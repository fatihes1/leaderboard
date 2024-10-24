import PlayerService from "../services/player-service";
import {RequestHandler, Request, Response} from "express";
import HttpStatus from "http-status";
import { Prisma } from '@prisma/client'

class PlayerController {
    private playerService: PlayerService

    constructor() {
        this.playerService = new PlayerService();
    }

  index: RequestHandler = async (req: Request, res: Response): Promise<void> => {
      try {
          const players = await this.playerService.list();
          res.status(HttpStatus.OK).send(players);
      } catch (error: any) {
          this.handleError(res, error);
      }
  }

    private handleError(res: Response, error: any): void {
        console.error('Error:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Prisma özel hata kodlarını işle
            switch (error.code) {
                case 'P2002':
                    res.status(HttpStatus.CONFLICT).send({
                        message: 'Unique constraint violation'
                    });
                    break;
                case 'P2025':
                    res.status(HttpStatus.NOT_FOUND).send({
                        message: 'Record not found'
                    });
                    break;
                case 'P2014':
                    res.status(HttpStatus.BAD_REQUEST).send({
                        message: 'Invalid ID'
                    });
                    break;
                default:
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                        message: 'An internal server error occurred'
                    });
            }
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: error.message || 'An internal server error occurred'
            });
        }
    }
}
export default PlayerController;