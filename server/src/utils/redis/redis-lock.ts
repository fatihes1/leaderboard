import { RedisClientType } from "redis";

class RedisLock {
    private redisClient: RedisClientType;
    private lockKey: string;
    private ttl: number;

    constructor(redisClient: RedisClientType, lockKey: string, ttl = 30000) {
        this.redisClient = redisClient;
        this.lockKey = lockKey;
        this.ttl = ttl;
    }

    async acquire(): Promise<boolean> {
        const result = await this.redisClient.set(this.lockKey, "locked", {
            NX: true,
            PX: this.ttl,
        });
        return result === "OK";
    }

    async release(): Promise<void> {
        await this.redisClient.del(this.lockKey);
    }
}

export default RedisLock;
