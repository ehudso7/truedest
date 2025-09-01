const Redis = require('ioredis');

let cacheClient = null;

const initializeCache = async () => {
    if (cacheClient) return cacheClient;
    
    console.log('Cache service not available, using in-memory cache');
    cacheClient = {
        cache: new Map(),
        get: async (key) => {
            const item = cacheClient.cache.get(key);
            if (item && item.expires > Date.now()) {
                return item.value;
            }
            cacheClient.cache.delete(key);
            return null;
        },
        set: async (key, value) => {
            cacheClient.cache.set(key, { value, expires: Date.now() + 3600000 });
            return true;
        },
        del: async (key) => {
            cacheClient.cache.delete(key);
            return true;
        },
        setex: async (key, seconds, value) => {
            cacheClient.cache.set(key, { value, expires: Date.now() + (seconds * 1000) });
            return true;
        }
    };
    
    return cacheClient;
};

module.exports = { initializeCache, cacheClient };