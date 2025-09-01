const express = require('express');
const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
    const { amount, currency = 'usd' } = req.body;
    
    res.json({
        clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2)}`,
        amount,
        currency
    });
});

router.post('/confirm', async (req, res) => {
    const { paymentIntentId } = req.body;
    
    res.json({
        status: 'succeeded',
        paymentIntentId,
        confirmationId: `CONF${Date.now()}`
    });
});

router.get('/methods', async (req, res) => {
    res.json({
        methods: [
            {
                id: 'pm_001',
                type: 'card',
                last4: '4242',
                brand: 'visa',
                expiryMonth: 12,
                expiryYear: 2025
            }
        ]
    });
});

module.exports = router;