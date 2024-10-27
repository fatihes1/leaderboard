
import { Response } from 'express';
import HttpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import {
    P2002_ERROR,
    P2002_ERROR_MESSAGE,
    P2014_ERROR, P2014_ERROR_MESSAGE,
    P2025_ERROR,
    P2025_ERROR_MESSAGE
} from "../constant/prisma-constants";

class BaseController {
    protected handleError(res: Response, error: any): void {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case P2002_ERROR:
                    res.status(HttpStatus.CONFLICT).send({
                        message: P2002_ERROR_MESSAGE
                    });
                    break;
                case P2025_ERROR:
                    res.status(HttpStatus.NOT_FOUND).send({
                        message: P2025_ERROR_MESSAGE
                    });
                    break;
                case P2014_ERROR:
                    res.status(HttpStatus.BAD_REQUEST).send({
                        message: P2014_ERROR_MESSAGE
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

export default BaseController;