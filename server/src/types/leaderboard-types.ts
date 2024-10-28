import {PlayerScore} from "./player-types";

export interface LeaderboardResponse {
    topPlayers: PlayerScore[];
    surroundingPlayers: PlayerScore[];
    playerRank?: number | null;
}