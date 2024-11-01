import BaseService from "./base";
import {prisma, redisClient} from "../config";
import {LEADERBOARD_KEY, PORTION_OF_REWARD_POOL, REWARD_POOL_KEY} from "../constant/leaderboard-constants";

class PlayerService extends BaseService<'player'> {
    constructor() {
        super('player')
    }
    async updatePlayerMoney  (playerId: number, earnedMoney: number) {
        const player =  await prisma.player.update({
            where: {id: playerId},
            data: {money: {increment: earnedMoney}},
        });

        await redisClient.zAdd(LEADERBOARD_KEY,{ score: player.money, value: playerId.toString()});
        await this.updateRewardPool(earnedMoney);
        return player;
    };

    async updateRewardPool  (earnedMoney: number) {
        const contribution = earnedMoney * PORTION_OF_REWARD_POOL;
        await redisClient.incrByFloat(REWARD_POOL_KEY, contribution);
    }
}

export default PlayerService;