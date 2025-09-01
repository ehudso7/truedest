const cron = require('node-cron');

const startCronJobs = () => {
    cron.schedule('0 * * * *', () => {
        console.log('Running hourly cleanup job');
    });

    cron.schedule('0 0 * * *', () => {
        console.log('Running daily analytics job');
    });

    cron.schedule('0 2 * * 0', () => {
        console.log('Running weekly backup job');
    });

    console.log('Cron jobs started');
};

module.exports = { startCronJobs };