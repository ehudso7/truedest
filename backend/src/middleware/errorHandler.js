const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.details
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID format'
        });
    }

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
    });
};

module.exports = { errorHandler };