import Base from "./base";
import {prisma} from "../config";

class PlayerService extends Base<'player'> {
    constructor() {
        super('player')
    }
    async updatePlayerMoney  (playerId: number, earnedMoney: number) {
        return prisma.player.update({
            where: {id: playerId},
            data: {money: {increment: earnedMoney}},
        });
    };
}

export default PlayerService;