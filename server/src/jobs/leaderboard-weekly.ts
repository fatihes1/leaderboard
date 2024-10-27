import cron from 'node-cron';
import LeaderboardService from '../services/leaderboard';
import { leaderboardLogger as logger } from '../utils/logger/leaderboard-logger';

const leaderboardService = new LeaderboardService();

cron.schedule('0 0 * * 0', async () => {
    logger.info('Running weekly leaderboard reset');

    try {
        await leaderboardService.distributeWeeklyRewards();
        logger.info('Weekly leaderboard reset and rewards distribution completed successfully.');
    } catch (error) {
        logger.error('Error during weekly leaderboard reset:', error);
    }
});
