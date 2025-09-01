const express = require('express');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
    res.json({
        stats: {
            totalUsers: 1234,
            totalBookings: 5678,
            revenue: 234567,
            activeFlights: 89
        }
    });
});

router.get('/users', async (req, res) => {
    res.json({
        users: [],
        total: 0
    });
});

module.exports = router;