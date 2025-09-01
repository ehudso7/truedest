const promClient = require('prom-client');

const metrics = {
    httpRequestDuration: null,
    httpRequestTotal: null,
    activeConnections: null
};

const initializeMetrics = async () => {
    metrics.httpRequestDuration = new promClient.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status']
    });

    metrics.httpRequestTotal = new promClient.Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status']
    });

    metrics.activeConnections = new promClient.Gauge({
        name: 'websocket_active_connections',
        help: 'Number of active WebSocket connections'
    });

    console.log('Metrics initialized');
};

module.exports = { initializeMetrics, metrics };