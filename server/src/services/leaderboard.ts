import BaseService from "./base";
import {prisma, redisClient} from "../config";
import PlayerService from "./player";
import {z} from 'zod'
import {TOP_PLAYERS_REWARD_PERCENTAGES} from "../constant/leaderboard-constants";

interface PlayerScore {
    id: number;
    name: string;
    country: string;
    money: string;
}

interface LeaderboardResponse {
    topPlayers: PlayerScore[];
    surroundingPlayers: PlayerScore[];
    playerRank?: number | null;
}

interface PlayerOptionResponse {
    suggestions: PlayerOption[];
}

interface PlayerOption {
    id: number;
    name: string;
    country: object;
}

const playerSchema = z.object({
    id: z.number(),
    name: z.string(),
    country: z.string(),
});

type Player = z.infer<typeof playerSchema>;

class LeaderboardService extends BaseService<'leaderboard'> {
    private readonly LEADERBOARD_KEY = 'leaderboard';
    private readonly TOP_PLAYERS_COUNT = 100;
    private readonly SURROUNDING_PLAYERS_COUNT_ABOVE = 3;
    private readonly SURROUNDING_PLAYERS_COUNT_BELLOW = 2;
    private readonly REDIS_EXPIRE_TIME = 60 * 60; // 1 saat


    private playerService: PlayerService

    constructor() {
        super('leaderboard')
        this.playerService = new PlayerService()
    }

    async ensureLeaderboardData(): Promise<void> {
        try {
            // Redis'te veri var mı kontrol et
            const leaderboardExists = await redisClient.exists(this.LEADERBOARD_KEY);

            if (!leaderboardExists) {
                // Prisma'dan tüm oyuncuları money değerine göre sıralı şekilde çek
                const players = await prisma.player.findMany({
                    select: {
                        id: true,
                        money: true,
                    },
                    orderBy: {
                        money: 'desc',
                    },
                });

                if (players.length === 0) {
                    return; // Hiç oyuncu yoksa işlemi sonlandır
                }

                // Redis pipeline kullanarak bulk insert yap
                const pipeline = redisClient.multi();

                players.forEach(player => {
                    pipeline.zAdd(this.LEADERBOARD_KEY, {
                        score: player.money,
                        value: player.id.toString()
                    });
                });

                // Expire time ekle
                pipeline.expire(this.LEADERBOARD_KEY, this.REDIS_EXPIRE_TIME);

                // Pipeline'ı çalıştır
                await pipeline.exec();

                console.log(`Leaderboard initialized with ${players.length} players`);
            }
        } catch (error) {
            console.error('Error initializing leaderboard:', error);
            throw new Error('Failed to initialize leaderboard data');
        }
    }

    //@Override
    async getPlayerList(playerName?: string, playerId?: number): Promise<LeaderboardResponse | PlayerOptionResponse> {
        if (playerName) {
            return await this.getPlayerOptions(playerName);

        } else  {
            return await this.getPlayerRanks(playerId || 0);
        }
    }

    async getPlayerOptions(playerName: string): Promise<PlayerOptionResponse> {
        const similarPlayers = await this.playerService.list(
            {
                name: {
                    contains: playerName, // contains ile benzer kullanıcı adlarını ara
                    mode: 'insensitive',  // Büyük küçük harf duyarlılığı olmadan arama yapar
                },
            },
            {
                id: true,
                name: true,
                country: true,
            },
        );

       return { suggestions: similarPlayers };

    }

    async getPlayerRanks(playerId?: number): Promise<LeaderboardResponse> {
        try {

            if (!redisClient.isOpen) {
                await redisClient.connect();
            }

            await this.ensureLeaderboardData();

            const topPlayersWithScores = await redisClient.zRangeWithScores(
                this.LEADERBOARD_KEY,
                0,
                this.TOP_PLAYERS_COUNT - 1,
                { REV: true }
            );

            let surroundingPlayersWithScores: Array<{ score: number; value: string }> = [];
            let playerRank: number | null = null;

            if (playerId) {
                const player = await this.playerService.findOne(
                    { id: playerId },
                    { id: true },
                );

                if (player) {
                    const playerId = player.id.toString();
                    playerRank = await redisClient.zRank(this.LEADERBOARD_KEY, playerId);
                    console.log('Player rank:', playerRank);
                    if (playerRank !== null) {
                        playerRank = await redisClient.zCard(this.LEADERBOARD_KEY) - playerRank - 1;

                        if (playerRank >= this.TOP_PLAYERS_COUNT) {
                            const start = Math.max(
                                0,
                                playerRank - this.SURROUNDING_PLAYERS_COUNT_ABOVE
                            );
                            const end = Math.min(
                                await redisClient.zCard(this.LEADERBOARD_KEY) - 1,
                                playerRank + this.SURROUNDING_PLAYERS_COUNT_BELLOW
                            );

                            surroundingPlayersWithScores = await redisClient.zRangeWithScores(
                                this.LEADERBOARD_KEY,
                                start,
                                end,
                                { REV: true }
                            );
                        }
                    }
                }
            }

            // 3. Tüm player ID'leri topla
            const allPlayerIds = new Set([
                ...topPlayersWithScores.map(p => parseInt(p.value)),
                ...surroundingPlayersWithScores.map(p => parseInt(p.value)),
            ]);

            const players = await this.playerService.list({
                    id: {
                        in: Array.from(allPlayerIds),
                    },
                },
                {
                    id: true,
                    name: true,
                    country: true,
                },
            );

            const playerRanks = await this.getPlayerRanksFromRedis(Array.from(allPlayerIds));

            return {
                topPlayers: this.formatPlayers(topPlayersWithScores, players, playerRanks),
                surroundingPlayers: playerRank !== null && playerRank < this.TOP_PLAYERS_COUNT
                    ? []
                    : this.formatPlayers(surroundingPlayersWithScores, players, playerRanks),
                playerRank: playerRank !== null ? playerRank + 1 : null,
            };
        } catch (error) {
            console.error('Leaderboard error:', error);
            throw new Error('Failed to fetch leaderboard data');
        }
    }


    private formatPlayers(
        redisData: Array<{ score: number; value: string }>,
        players: Player[],
        playerRanks: Map<number, number>
    ): PlayerScore[] {
        return redisData.map(({ score, value }) => {
            const playerId = parseInt(value);
            const player = players.find(p => p.id === playerId);
            const rank = playerRanks.get(playerId);

            return {
                id: playerId,
                name: player?.name ?? 'Unknown',
                country: player?.country ?? 'Unknown',
                money: score.toString(),
                rank: rank ?? null  // Sıralama bilgisini ekle
            };
        });
    }

    private async getPlayerRanksFromRedis(playerIds: number[]): Promise<Map<number, number>> {
        const totalPlayers = await redisClient.zCard(this.LEADERBOARD_KEY);
        const rankMap = new Map<number, number>();

        for (const playerId of playerIds) {
            const rank = await redisClient.zRank(this.LEADERBOARD_KEY, playerId.toString());
            if (rank !== null) {
                rankMap.set(playerId, totalPlayers - rank);
            }
        }

        return rankMap;
    }

    async distributeWeeklyRewards(): Promise<void> {
        const rewardPool = parseFloat(await redisClient.get('reward_pool') || '0');

        const topPlayers = await redisClient.zRangeWithScores(
            this.LEADERBOARD_KEY,
            0,
            this.TOP_PLAYERS_COUNT - 1,
            { REV: true }
        );


        for (let i = 0; i < topPlayers.length; i += 2) {
            const playerId = Number(topPlayers[i]);
            const playerRank = i / 2 + 1;

            let rewardAmount;
            if (playerRank === 1) {
                rewardAmount = rewardPool * TOP_PLAYERS_REWARD_PERCENTAGES[0].percentage;
            } else if (playerRank === 2) {
                rewardAmount = rewardPool * TOP_PLAYERS_REWARD_PERCENTAGES[1].percentage;
            } else if (playerRank === 3) {
                rewardAmount = rewardPool * TOP_PLAYERS_REWARD_PERCENTAGES[2].percentage;
            } else if (playerRank <= 100) {
                rewardAmount = rewardPool * ((100 - playerRank) / 5046);
            }

            await this.prisma.player.update({
                where: { id: playerId },
                data: { money: rewardAmount },
            });
        }

        await redisClient.del('reward_pool');
        await redisClient.del('leaderboard');
        console.log('Weekly rewards distributed and leaderboard reset.');
    }
}

export default LeaderboardService;