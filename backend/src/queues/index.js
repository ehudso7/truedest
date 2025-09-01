const Bull = require('bull');

const queues = {};

const initializeQueues = async () => {
    try {
        const redisConfig = {
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD
            }
        };

        queues.emailQueue = new Bull('email', redisConfig);
        queues.notificationQueue = new Bull('notification', redisConfig);
        queues.bookingQueue = new Bull('booking', redisConfig);

        queues.emailQueue.process(async (job) => {
            console.log('Processing email job:', job.data);
            return { success: true };
        });

        queues.notificationQueue.process(async (job) => {
            console.log('Processing notification job:', job.data);
            return { success: true };
        });

        queues.bookingQueue.process(async (job) => {
            console.log('Processing booking job:', job.data);
            return { success: true };
        });

        console.log('Queues initialized');
    } catch (error) {
        console.log('Queue service not available, jobs will run synchronously');
    }
};

module.exports = { initializeQueues, queues };