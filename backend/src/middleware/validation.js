const Joi = require('joi');

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                details: error.details.map(d => d.message)
            });
        }
        
        next();
    };
};

const schemas = {
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        name: Joi.string().min(2).required()
    }),
    
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    
    booking: Joi.object({
        type: Joi.string().valid('flight', 'hotel', 'package').required(),
        details: Joi.object().required()
    })
};

module.exports = { validateRequest, schemas };