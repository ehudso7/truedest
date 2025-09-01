const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { from, to, departure, return: returnDate, travelers, type } = req.body;
    
    const results = {
        flights: [
            {
                id: 'SR001',
                airline: 'United Airlines',
                from,
                to,
                price: 399,
                duration: '5h 30m'
            },
            {
                id: 'SR002',
                airline: 'Delta Airlines',
                from,
                to,
                price: 449,
                duration: '5h 45m'
            }
        ],
        hotels: [
            {
                id: 'HSR001',
                name: 'Marriott Downtown',
                location: to,
                price: 189,
                rating: 4.5
            }
        ],
        packages: []
    };

    res.json(results[type] || results.flights);
});

router.get('/suggestions', async (req, res) => {
    const { query } = req.query;
    
    const suggestions = [
        { code: 'JFK', name: 'New York JFK', city: 'New York' },
        { code: 'LAX', name: 'Los Angeles LAX', city: 'Los Angeles' },
        { code: 'ORD', name: "Chicago O'Hare", city: 'Chicago' }
    ].filter(s => 
        s.code.toLowerCase().includes(query.toLowerCase()) ||
        s.city.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ suggestions });
});

module.exports = router;