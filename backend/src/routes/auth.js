const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const users = new Map();

router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (users.has(email)) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const user = {
            id: userId,
            email,
            name,
            password: hashedPassword,
            createdAt: new Date(),
            twoFactorEnabled: false
        };

        users.set(email, user);

        const token = jwt.sign(
            { id: userId, email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing credentials' });
        }

        const user = users.get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        req.session.userId = user.id;

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});

router.get('/session', (req, res) => {
    if (req.session && req.session.userId) {
        const user = Array.from(users.values()).find(u => u.id === req.session.userId);
        if (user) {
            return res.json({
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
            });
        }
    }
    res.status(401).json({ error: 'Not authenticated' });
});

router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
    
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret');
        const newToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );
        
        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

router.post('/2fa/enable', async (req, res) => {
    const secret = speakeasy.generateSecret({
        name: `TravelBudi (${req.user.email})`
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl
    });
});

router.post('/2fa/verify', (req, res) => {
    const { token, secret } = req.body;

    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2
    });

    if (verified) {
        res.json({ message: '2FA verified successfully' });
    } else {
        res.status(400).json({ error: 'Invalid 2FA token' });
    }
});

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );
        res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    }
);

module.exports = router;