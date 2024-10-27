import PlayerService from "../services/player";
import {RequestHandler, Request, Response} from "express";
import HttpStatus from "http-status";
import BaseController from "./base";

class PlayerController extends BaseController {
    private playerService: PlayerService

    constructor() {
        super();
        this.playerService = new PlayerService();
    }

  index: RequestHandler = async (req: Request, res: Response): Promise<void> => {
      try {
          const players = await this.playerService.list({}, {
              id: true,
              name: true,
              money: true,
              country: true
          });
          res.status(HttpStatus.OK).send(players);
      } catch (error: any) {
          this.handleError(res, error);
      }
  }

  update: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const playerId = parseInt(req.params.id);
            const earnedMoney = parseInt(req.body.money);
            const player = await this.playerService.updatePlayerMoney(playerId, earnedMoney);
            res.status(HttpStatus.OK).send(player);
        } catch (error: any) {
            this.handleError(res, error);
        }
  }
}
export default PlayerController;