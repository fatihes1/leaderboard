import BaseController from "./base";
import LeaderboardService from "../services/leaderboard";
import {Request, RequestHandler, Response} from "express";
import HttpStatus from "http-status";


class LeaderboardController extends BaseController {
    private leaderboardService: LeaderboardService

    constructor() {
        super();
        this.leaderboardService = new LeaderboardService();
    }

    index: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const { playerName, playerId } = req.query ||'';
        try {
            const players = await this.leaderboardService.getPlayerList(playerName?.toString() ||'', Number(playerId));
            res.status(HttpStatus.OK).send(players);
        } catch (error: any) {
            this.handleError(res, error);
        }
    }

    distribute: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const { playerId } = req.params;
        try {
            await this.leaderboardService.distributeWeeklyRewards();
            res.status(HttpStatus.OK).send();
        } catch (error: any) {
            this.handleError(res, error);
        }
    }
}

export default LeaderboardController;