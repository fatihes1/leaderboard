import {Route, Routes} from 'react-router-dom';
import {LeaderboardPage} from "../pages/leaderboard.tsx";

export const LeaderboardRoutes = () => {
    
    return (
        <>
            <Routes>
                <Route  path={'/'} element={<LeaderboardPage />} />
            </Routes>
        </>
    )
}