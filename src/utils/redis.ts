import { createClient, RedisClientType } from 'redis';

export const connectRedis = async (): Promise<RedisClientType> => {
    try {
        const client: RedisClientType = createClient({
            url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || '6379'}`
        });

        client.on('error', (err: any) => console.error('Redis Client Error:', err));

        await client.connect();
        console.log('Connected to Redis');
        return client;
    } catch (err) {
        console.error('Error connecting to Redis:', err);
        throw err;
    }
};

