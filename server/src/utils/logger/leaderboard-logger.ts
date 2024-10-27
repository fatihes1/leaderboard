import winston from "winston";

export const leaderboardLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'leaderboard-service' },
    transports: [
        new winston.transports.File({ filename: 'logs/leaderboard/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/leaderboard/info.log', level: 'info' }),
        new winston.transports.File({ filename: 'logs/leaderboard/combined.log'}),
    ],
})