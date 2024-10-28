import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const LEADERBOARD_URL = `${API_URL}/leaderboard`

export function fetchLeaderboardRequest(
    playerName?: string,
    playerId?: number,
) {
    return axios.get(LEADERBOARD_URL, {
        params: {
            playerName,
            playerId,
        }
    })
}