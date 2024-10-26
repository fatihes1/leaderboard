import axios from 'axios'

const API_URL =  'http://localhost:8000'

const LEADERBOARD_URL = `${API_URL}/leaderboard`

export function fetchLeaderboardRequest() {
    return axios.get(LEADERBOARD_URL)
}