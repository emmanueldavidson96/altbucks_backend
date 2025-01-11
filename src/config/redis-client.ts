import { connectRedis } from '../utils/redis'; 
import { RedisClientType } from 'redis';

let client: RedisClientType 

export const getRedisClient = async (): Promise<RedisClientType> => {
    if (!client) {
        client = await connectRedis();
    }
    return client;
};
