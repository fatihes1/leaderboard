import BaseService from "./base";
import {prisma, redisClient} from "../config";
import PlayerService from "./player";
import {leaderboardLogger} from "../utils/logger/leaderboard-logger";
import RedisLock from "../utils/redis/redis-lock";

import {
    DISTRIBUTE_REWARDS_LOCK_KEY,
    LEADERBOARD_CACHE_TTL,
    LEADERBOARD_KEY,
    LEADERBOARD_LOCK_KEY,
    REWARD_POOL_KEY,
    SURROUNDING_PLAYERS_COUNT_ABOVE,
    SURROUNDING_PLAYERS_COUNT_BELOW,
    TOP_PLAYERS_COUNT,
    TOP_PLAYERS_REWARD_PERCENTAGES
} from "../constant/leaderboard-constants";
import {LeaderboardResponse} from "../types/leaderboard-types";
import {Player, PlayerOptionResponse, PlayerScore} from "../types/player-types";


class LeaderboardService extends BaseService<'leaderboard'> {
    private playerService: PlayerService;
    constructor() {
        super('leaderboard');
        this.playerService = new PlayerService();
    }

    async getPlayerList(playerName?: string, playerId?: number): Promise<PlayerOptionResponse | LeaderboardResponse | null> {
        return playerName ? this.getPlayerOptions(playerName) : this.getPlayerRanks(playerId);
    }

    async ensureLeaderboardData(): Promise<void> {
        const lock = new RedisLock(redisClient, LEADERBOARD_LOCK_KEY);
        if (await lock.acquire()) {
            try {
                const leaderboardExists = await redisClient.exists(LEADERBOARD_KEY);
                if (leaderboardExists) return;

                const players = await prisma.player.findMany({
                    select: {id: true, money: true},
                    orderBy: {money: 'desc'},
                });

                if (players.length === 0) return;

                const pipeline = redisClient.multi();
                players.forEach(player => {
                    pipeline.zAdd(LEADERBOARD_KEY, {
                        score: player.money,
                        value: player.id.toString(),
                    });
                });

                pipeline.expire(LEADERBOARD_KEY, LEADERBOARD_CACHE_TTL);
                await pipeline.exec();
                leaderboardLogger.info(`Leaderboard initialized with ${players.length} players`);
            } catch (error) {
                leaderboardLogger.error('Error initializing leaderboard under high traffic:', error);
                throw new Error('Failed to initialize leaderboard data');
            } finally {
                await lock.release();
            }
        } else {
            leaderboardLogger.info("Leaderboard initialization skipped due to existing lock.");
        }
    }

    private async getPlayerOptions(playerName: string): Promise<PlayerOptionResponse> {
        const similarPlayers = await this.playerService.list(
            {name: {contains: playerName, mode: 'insensitive'}},
            {id: true, name: true, country: true}
        );
        return {suggestions: similarPlayers};
    }

    async getPlayerRanks(playerId?: number): Promise<LeaderboardResponse | null> {
        const key = `rate_limit_player_rank_${playerId}`;
        const rateLimit = await redisClient.incr(key);
        if (rateLimit === 1) await redisClient.expire(key, 10);
        if (rateLimit > 5) {
            leaderboardLogger.warn(`Rate limit exceeded for player rank request: ${playerId}`);
            return null;
        }

        try {
            await this.ensureLeaderboardData();
            const topPlayersWithScores = await redisClient.zRangeWithScores(
                LEADERBOARD_KEY,
                0,
                TOP_PLAYERS_COUNT - 1,
                {REV: true}
            );

            let surroundingPlayersWithScores: Array<{ score: number; value: string }> = [];
            let playerRank: number | null = null;

            if (playerId) {
                const player = await this.playerService.findOne({id: playerId}, {id: true});
                if (player) {
                    playerRank = await this.getPlayerRank(player.id.toString());
                    console.log('PLAYER RANK', playerRank);
                    if (playerRank !== null && playerRank >= TOP_PLAYERS_COUNT) {
                        surroundingPlayersWithScores = await this.getSurroundingPlayers(playerRank);
                    }
                }
            }

            const allPlayerIds = new Set([
                ...topPlayersWithScores.map(p => parseInt(p.value)),
                ...surroundingPlayersWithScores.map(p => parseInt(p.value)),
            ]);

            const players = await this.playerService.list(
                {id: {in: Array.from(allPlayerIds)}},
                {id: true, name: true, country: true}
            );

            const playerRanks = await this.getPlayerRanksFromRedis(Array.from(allPlayerIds));

            return {
                topPlayers: this.formatPlayers(topPlayersWithScores, players, playerRanks),
                surroundingPlayers: playerRank !== null && playerRank < TOP_PLAYERS_COUNT
                    ? []
                    : this.formatPlayers(surroundingPlayersWithScores, players, playerRanks),
                playerRank: playerRank !== null ? playerRank + 1 : null,
            };
        } catch (error) {
            leaderboardLogger.error('Leaderboard error:', error);
            throw new Error('Failed to fetch leaderboard data');
        }
    }

    private async getPlayerRank(playerId: string): Promise<number | null> {
        const rank = await redisClient.zRank(LEADERBOARD_KEY, playerId);
        return rank !== null ? (await redisClient.zCard(LEADERBOARD_KEY)) - rank : null;
    }

    private async getSurroundingPlayers(playerRank: number): Promise<Array<{ score: number; value: string }>> {
        const start = Math.max(0, playerRank - SURROUNDING_PLAYERS_COUNT_ABOVE);
        const end = Math.min(await redisClient.zCard(LEADERBOARD_KEY) - 1, playerRank + SURROUNDING_PLAYERS_COUNT_BELOW);
        return await redisClient.zRangeWithScores(LEADERBOARD_KEY, start, end, {REV: true});
    }

    private async getPlayerRanksFromRedis(playerIds: number[]): Promise<Map<number, number>> {
        const totalPlayers = await redisClient.zCard(LEADERBOARD_KEY);
        const rankMap = new Map<number, number>();

        for (const playerId of playerIds) {
            const rank = await redisClient.zRank(LEADERBOARD_KEY, playerId.toString());
            if (rank !== null) {
                rankMap.set(playerId, totalPlayers - rank);
            }
        }
        return rankMap;
    }

    async distributeWeeklyRewards(): Promise<void> {
        const lock = new RedisLock(redisClient, DISTRIBUTE_REWARDS_LOCK_KEY);
        if (await lock.acquire()) {
            try {
                const rewardPool = parseFloat(await redisClient.get(REWARD_POOL_KEY) || '0');
                if (rewardPool === 0) {
                    leaderboardLogger.info('No rewards to distribute');
                    return;
                }

                const topPlayers = await redisClient.zRangeWithScores(
                    LEADERBOARD_KEY,
                    0,
                    TOP_PLAYERS_COUNT - 1,
                    {REV: true}
                );

                await prisma.$transaction(async (tx) => {
                    for (let [index, player] of topPlayers.entries()) {
                        const playerId = Number(player.value);
                        const playerRank = index + 1;

                        const rewardAmount = this.calculateReward(playerRank, rewardPool);

                        await tx.player.update({
                            where: { id: playerId },
                            data: {
                                money: rewardAmount
                            }
                        });
                    }
                });

                await prisma.player.updateMany({
                    where: {id: {notIn: topPlayers.map(player => Number(player.value))}},
                    data: {money: 0},
                });

                await redisClient.del(REWARD_POOL_KEY);
                await redisClient.del(LEADERBOARD_KEY);
                leaderboardLogger.info('Weekly rewards distributed and leaderboard reset.');
            } catch (error) {
                leaderboardLogger.error('Error distributing weekly rewards:', error);
                throw new Error('Failed to distribute weekly rewards');
            } finally {
                await lock.release();
            }
        }
    }

    private calculateReward(rank: number, pool: number) {
        if (rank <= 3) {
            return pool * TOP_PLAYERS_REWARD_PERCENTAGES[rank - 1].percentage;
        }
        if (rank <= 100) {
            // 101 because we want to give at least some reward to the last player
            return pool * ((101 - rank) / 5046);
        }
        return 0;
    }

    // Helper function to format player data
    private formatPlayers(
        redisData: Array<{ score: number; value: string }>,
        players: Player[],
        playerRanks: Map<number, number>
    ): PlayerScore[] {
        return redisData.map(({score, value}) => {
            const playerId = parseInt(value);
            const player = players.find(p => p.id === playerId);
            const rank = playerRanks.get(playerId);

            return {
                id: playerId,
                name: player?.name ?? 'Unknown',
                country: player?.country ?? 'Unknown',
                money: score.toFixed(2).toString(),
                rank: rank ?? null,
            };
        });
    }
}

export default LeaderboardService;