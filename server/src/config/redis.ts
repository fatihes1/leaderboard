import { createClient, RedisClientType} from 'redis'

const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL
})

redisClient.on('error', (err) => {
    console.error('🐞 Redis Client Error:', err)
})


const connectRedis = async () => {
    await redisClient.connect();
}

redisClient.on('connect', () => {
    console.log('✅ Redis Client Connected')
})
export {
    redisClient,
    connectRedis
};