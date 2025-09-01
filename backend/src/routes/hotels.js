const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { location, checkIn, checkOut, guests } = req.query;
    
    const mockHotels = [
        {
            id: 'HTL001',
            name: 'Grand Plaza Hotel',
            location: location || 'New York',
            rating: 4.5,
            price: 199,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
            amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant']
        },
        {
            id: 'HTL002',
            name: 'Luxury Suites',
            location: location || 'New York',
            rating: 4.8,
            price: 299,
            image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
            amenities: ['WiFi', 'Gym', 'Bar', 'Room Service']
        }
    ];

    res.json({ hotels: mockHotels });
});

router.get('/:id', async (req, res) => {
    res.json({
        id: req.params.id,
        name: 'Grand Plaza Hotel',
        location: 'New York',
        rating: 4.5,
        price: 199,
        description: 'Luxury hotel in the heart of Manhattan',
        images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
        ],
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Bar'],
        rooms: [
            { type: 'Standard', price: 199, available: 5 },
            { type: 'Deluxe', price: 299, available: 3 },
            { type: 'Suite', price: 499, available: 1 }
        ]
    });
});

router.post('/:id/book', async (req, res) => {
    const { checkIn, checkOut, guests, roomType } = req.body;
    
    res.json({
        bookingId: `HBK${Date.now()}`,
        hotelId: req.params.id,
        status: 'confirmed',
        checkIn,
        checkOut,
        guests,
        roomType,
        totalPrice: 199 * guests,
        confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    });
});

module.exports = router;