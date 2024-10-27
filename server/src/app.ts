import express, { Express, Request, Response } from 'express';
import {server, connectDB, prisma, connectRedis} from "./config";
import helmet from "helmet";
import PlayerRoutes from "./routes/player";
import LeaderboardRoutes from "./routes/leaderboard";
import cors from "cors";
import {apiLimiter} from "./middlewares/rate-limit";

const port = process.env.PORT || 8000;


server();

const app: Express = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(apiLimiter);

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello Panteon, this is Fatih!' });
});

app.listen(port, async () => {
    await connectDB();
    await connectRedis();
    app.use('/leaderboard', LeaderboardRoutes);
    app.use('/player', PlayerRoutes);
    console.log(`⚡️ Server is running at PORT:${port}`);
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

export default app;