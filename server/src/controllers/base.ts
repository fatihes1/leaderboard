
import { Response } from 'express';
import HttpStatus from 'http-status';
import { Prisma } from '@prisma/client';

class BaseController {
    protected handleError(res: Response, error: any): void {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

export default BaseController;