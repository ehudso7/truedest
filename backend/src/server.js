const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createServer } = require('http');
const { Server } = require('socket.io');
const WebSocket = require('ws');
const Redis = require('ioredis');
const Sentry = require('@sentry/node');
const promClient = require('prom-client');
const statusMonitor = require('express-status-monitor');
const morgan = require('morgan');
const winston = require('winston');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const flightRoutes = require('./routes/flights');
const hotelRoutes = require('./routes/hotels');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const searchRoutes = require('./routes/search');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhooks');

const { initializeDatabase } = require('./config/database');
const { initializeElasticsearch } = require('./config/elasticsearch');
const { initializePassport } = require('./config/passport');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const { validateRequest } = require('./middleware/validation');
const { initializeQueues } = require('./queues');
const { startCronJobs } = require('./jobs');
const { initializeCache } = require('./services/cache');
const { initializeMetrics } = require('./monitoring/metrics');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true
    }
});

const wss = new WebSocket.Server({ server, path: '/ws' });
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        if (times > 3) {
            return null;
        }
        return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true
});

const pubClient = redis.duplicate();
const subClient = redis.duplicate();

// Handle Redis errors gracefully
redis.on('error', (err) => {
    console.log('Redis connection error (main):', err.message);
});

pubClient.on('error', (err) => {
    console.log('Redis connection error (pub):', err.message);
});

subClient.on('error', (err) => {
    console.log('Redis connection error (sub):', err.message);
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'travelbudi-api' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app })
    ],
    tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.stripe.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'wss:', 'https:']
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many requests',
            retryAfter: req.rateLimit.resetTime
        });
    }
});

app.use('/api/', limiter);

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true
});

app.use('/api/auth/login', strictLimiter);
app.use('/api/auth/register', strictLimiter);

const sessionConfig = {
    secret: process.env.SESSION_SECRET || uuidv4(),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    }
};

redis.connect().then(() => {
    sessionConfig.store = new RedisStore({ client: redis });
    console.log('Using Redis for session storage');
}).catch(() => {
    console.log('Using memory session storage (Redis unavailable)');
});

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
initializePassport(passport);

app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

promClient.collectDefaultMetrics();
app.use(statusMonitor());

app.get('/metrics', (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    promClient.register.metrics().then(metrics => {
        res.end(metrics);
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        redis: redis.status === 'ready',
        database: true
    });
});

app.get('/ready', async (req, res) => {
    try {
        await redis.ping();
        await initializeDatabase();
        res.json({ status: 'ready' });
    } catch (error) {
        res.status(503).json({ status: 'not ready', error: error.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/flights', authenticate, flightRoutes);
app.use('/api/hotels', authenticate, hotelRoutes);
app.use('/api/bookings', authenticate, bookingRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/payments', authenticate, paymentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', authenticate, aiRoutes);
app.use('/api/admin', authenticate, adminRoutes);
app.use('/webhooks', webhookRoutes);

app.use('/api/destinations/trending', async (req, res) => {
    try {
        let cached = null;
        try {
            if (redis.status === 'ready') {
                cached = await redis.get('trending:destinations');
                if (cached) {
                    return res.json(JSON.parse(cached));
                }
            }
        } catch (err) {
            // Redis not available, continue without cache
        }

        const destinations = [
            {
                id: 1,
                name: 'Santorini, Greece',
                image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
                price: 899,
                rating: 4.8,
                category: 'Beach',
                description: 'Stunning sunsets and white-washed buildings'
            },
            {
                id: 2,
                name: 'Kyoto, Japan',
                image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
                price: 1299,
                rating: 4.9,
                category: 'City',
                description: 'Ancient temples and cherry blossoms'
            },
            {
                id: 3,
                name: 'Maldives',
                image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400',
                price: 2499,
                rating: 5.0,
                category: 'Beach',
                description: 'Crystal clear waters and overwater bungalows'
            },
            {
                id: 4,
                name: 'Dubai, UAE',
                image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
                price: 1099,
                rating: 4.7,
                category: 'City',
                description: 'Modern architecture and luxury shopping'
            },
            {
                id: 5,
                name: 'Swiss Alps',
                image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
                price: 1799,
                rating: 4.9,
                category: 'Mountain',
                description: 'Breathtaking mountain views and skiing'
            },
            {
                id: 6,
                name: 'Patagonia',
                image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
                price: 1599,
                rating: 4.8,
                category: 'Adventure',
                description: 'Wild landscapes and outdoor adventures'
            }
        ];

        try {
            if (redis.status === 'ready') {
                await redis.setex('trending:destinations', 3600, JSON.stringify({ destinations }));
            }
        } catch (err) {
            // Redis not available, continue without cache
        }
        res.json({ destinations });
    } catch (error) {
        logger.error('Error fetching trending destinations:', error);
        res.status(500).json({ error: 'Failed to fetch destinations' });
    }
});

io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('subscribe', (data) => {
        if (data.channels && Array.isArray(data.channels)) {
            data.channels.forEach(channel => {
                socket.join(channel);
                logger.info(`Socket ${socket.id} joined channel: ${channel}`);
            });
        }
    });

    socket.on('search', async (data) => {
        try {
            socket.emit('search_results', {
                type: 'results',
                payload: { message: 'Processing search...', requestId: data.requestId }
            });
        } catch (error) {
            socket.emit('error', { message: 'Search failed', error: error.message });
        }
    });

    socket.on('chat', async (data) => {
        try {
            const response = await processAIChat(data.message);
            socket.emit('chat_response', {
                type: 'chat_response',
                payload: response
            });
        } catch (error) {
            socket.emit('error', { message: 'Chat failed', error: error.message });
        }
    });

    socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });
});

wss.on('connection', (ws, req) => {
    const clientId = uuidv4();
    logger.info(`WebSocket connected: ${clientId}`);

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'subscribe':
                    if (data.channels) {
                        data.channels.forEach(channel => {
                            subClient.subscribe(channel);
                        });
                    }
                    break;

                case 'chat':
                    const response = await processAIChat(data.payload.message);
                    ws.send(JSON.stringify({
                        type: 'chat_response',
                        payload: response
                    }));
                    break;

                default:
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Unknown message type'
                    }));
            }
        } catch (error) {
            logger.error('WebSocket message error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to process message'
            }));
        }
    });

    ws.on('close', () => {
        logger.info(`WebSocket disconnected: ${clientId}`);
    });

    ws.on('error', (error) => {
        logger.error(`WebSocket error for ${clientId}:`, error);
    });
});

subClient.on('message', (channel, message) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'broadcast',
                channel,
                payload: JSON.parse(message)
            }));
        }
    });

    io.to(channel).emit('broadcast', JSON.parse(message));
});

async function processAIChat(message) {
    const responses = {
        'hello': 'Hello! How can I help you plan your perfect trip today?',
        'flight': 'I can help you find the best flights. What are your travel dates and destination?',
        'hotel': 'Looking for hotels? I can recommend great accommodations based on your preferences.',
        'japan': 'Japan is amazing! I recommend visiting in spring for cherry blossoms or autumn for fall colors.',
        'budget': 'I can help you plan within your budget. What\'s your price range and destination?',
        'default': 'I\'d be happy to help with that! Can you provide more details about your travel plans?'
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return value;
        }
    }

    return responses.default;
}

app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`,
        timestamp: new Date().toISOString()
    });
});

async function startServer() {
    try {
        await initializeDatabase();
        await initializeElasticsearch();
        await initializeCache();
        await initializeQueues();
        await initializeMetrics();
        startCronJobs();

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, '0.0.0.0', () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
            logger.info(`WebSocket server ready at ws://localhost:${PORT}/ws`);
            logger.info(`Socket.IO server ready at http://localhost:${PORT}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
            logger.info(`Metrics: http://localhost:${PORT}/metrics`);
        });

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

async function gracefulShutdown() {
    logger.info('Shutting down gracefully...');
    
    server.close(() => {
        logger.info('HTTP server closed');
    });

    wss.clients.forEach(ws => {
        ws.close();
    });

    io.close(() => {
        logger.info('Socket.IO server closed');
    });

    await redis.quit();
    await pubClient.quit();
    await subClient.quit();

    process.exit(0);
}

startServer();

module.exports = { app, server, io, wss };