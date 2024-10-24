import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello Panteon, this is Fatih!' });
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;