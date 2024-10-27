import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LeaderboardRoutes } from './leaderboard'; // LeaderboardRoutes dosya yolunu doğru ayarladığından emin ol

export const BaseRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path={'/'} element={<LeaderboardRoutes />} />
            </Routes>
        </Router>
    );
};
