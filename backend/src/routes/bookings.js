const express = require('express');
const router = express.Router();

const bookings = new Map();

router.get('/', async (req, res) => {
    const userBookings = Array.from(bookings.values()).filter(
        booking => booking.userId === req.user?.id
    );
    res.json({ bookings: userBookings });
});

router.get('/:id', async (req, res) => {
    const booking = bookings.get(req.params.id);
    
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.userId !== req.user?.id) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(booking);
});

router.post('/', async (req, res) => {
    const bookingId = `BK${Date.now()}`;
    const booking = {
        id: bookingId,
        userId: req.user?.id,
        ...req.body,
        status: 'pending',
        createdAt: new Date()
    };
    
    bookings.set(bookingId, booking);
    
    res.status(201).json(booking);
});

router.put('/:id/cancel', async (req, res) => {
    const booking = bookings.get(req.params.id);
    
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.userId !== req.user?.id) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    
    res.json({ message: 'Booking cancelled successfully', booking });
});

module.exports = router;