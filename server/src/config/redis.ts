import { createClient } from 'redis'

const redisClient = createClient({
    url: 'redis://redis_db:6379'
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