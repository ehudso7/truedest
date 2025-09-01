const { Client } = require('@elastic/elasticsearch');

let esClient = null;

const initializeElasticsearch = async () => {
    if (esClient) return esClient;
    
    try {
        esClient = new Client({
            node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
        });

        await esClient.ping();
        console.log('Elasticsearch connection established');
        return esClient;
    } catch (error) {
        console.log('Elasticsearch not available, using in-memory search');
        return null;
    }
};

module.exports = { initializeElasticsearch, esClient };