import express, { Express, Request, Response } from 'express';
import {server, connectDB, prisma} from "./config";
import helmet from "helmet";
import PlayerRoutes from "./routes/player-routes";

const port = process.env.PORT || 8000;


server();

const app: Express = express();
app.use(express.json());
app.use(helmet());

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello Panteon, this is Fatih!' });
});

app.listen(port, async () => {
    await connectDB();
    app.use('/leaderboard', PlayerRoutes);
    console.log(`⚡️ Server is running at PORT:${port}`);
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

export default app;