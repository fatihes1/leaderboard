import BaseService from "./base-service";

class PlayerService extends BaseService<'player'> {
    constructor() {
        super('player')
    }
}

export default PlayerService;