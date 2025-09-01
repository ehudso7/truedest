const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    const responses = {
        'hello': 'Hello! How can I help you plan your perfect trip today?',
        'flight': 'I can help you find the best flights. What are your travel dates and destination?',
        'hotel': 'Looking for hotels? I can recommend great accommodations based on your preferences.',
        'japan': 'Japan is amazing! I recommend visiting in spring for cherry blossoms or autumn for fall colors.',
        'budget': 'I can help you plan within your budget. What\'s your price range and destination?'
    };

    const lowerMessage = message.toLowerCase();
    let response = 'I\'d be happy to help with that! Can you provide more details about your travel plans?';
    
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            response = value;
            break;
        }
    }

    res.json({ response });
});

router.post('/itinerary', async (req, res) => {
    const { destination, duration, interests } = req.body;
    
    res.json({
        itinerary: {
            destination,
            duration,
            days: [
                {
                    day: 1,
                    activities: [
                        'Arrival and check-in',
                        'Explore local area',
                        'Welcome dinner'
                    ]
                }
            ],
            estimatedCost: 1500
        }
    });
});

module.exports = router;