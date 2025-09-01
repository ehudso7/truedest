const express = require('express');
const router = express.Router();

router.get('/profile', async (req, res) => {
    res.json({
        id: req.user?.id,
        email: req.user?.email,
        name: req.user?.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user?.email}`,
        preferences: {
            currency: 'USD',
            language: 'en',
            notifications: true
        }
    });
});

router.put('/profile', async (req, res) => {
    const { name, preferences } = req.body;
    
    res.json({
        message: 'Profile updated successfully',
        user: {
            id: req.user?.id,
            email: req.user?.email,
            name: name || req.user?.name,
            preferences
        }
    });
});

router.get('/trips', async (req, res) => {
    res.json({
        trips: [
            {
                id: 'TRIP001',
                destination: 'Paris, France',
                startDate: '2024-03-15',
                endDate: '2024-03-22',
                status: 'upcoming'
            }
        ]
    });
});

module.exports = router;