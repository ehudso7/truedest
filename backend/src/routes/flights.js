const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { from, to, date, passengers } = req.query;
    
    const mockFlights = [
        {
            id: 'FL001',
            airline: 'United Airlines',
            from: from || 'JFK',
            to: to || 'LAX',
            departure: date || '2024-01-15T10:00:00Z',
            arrival: '2024-01-15T13:30:00Z',
            price: 299,
            duration: '5h 30m',
            stops: 0
        },
        {
            id: 'FL002',
            airline: 'Delta Airlines',
            from: from || 'JFK',
            to: to || 'LAX',
            departure: date || '2024-01-15T14:00:00Z',
            arrival: '2024-01-15T17:45:00Z',
            price: 349,
            duration: '5h 45m',
            stops: 0
        }
    ];

    res.json({ flights: mockFlights });
});

router.get('/:id', async (req, res) => {
    res.json({
        id: req.params.id,
        airline: 'United Airlines',
        from: 'JFK',
        to: 'LAX',
        departure: '2024-01-15T10:00:00Z',
        arrival: '2024-01-15T13:30:00Z',
        price: 299,
        duration: '5h 30m',
        aircraft: 'Boeing 737',
        seats: {
            economy: { available: 45, price: 299 },
            business: { available: 8, price: 899 },
            first: { available: 2, price: 1499 }
        }
    });
});

router.post('/:id/book', async (req, res) => {
    const { passengers, seatClass } = req.body;
    
    res.json({
        bookingId: `BK${Date.now()}`,
        flightId: req.params.id,
        status: 'confirmed',
        passengers,
        seatClass,
        totalPrice: passengers * 299,
        confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    });
});

module.exports = router;