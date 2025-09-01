const knex = require('knex');

let db = null;

const initializeDatabase = async () => {
    if (db) return db;
    
    try {
        db = knex({
            client: 'pg',
            connection: process.env.DATABASE_URL || {
                host: 'localhost',
                port: 5432,
                database: 'travelbudi',
                user: 'postgres',
                password: 'postgres'
            },
            pool: {
                min: 2,
                max: 10
            }
        });

        console.log('Database connection initialized');
        return db;
    } catch (error) {
        console.error('Database connection failed:', error);
        return null;
    }
};

module.exports = { initializeDatabase, db };