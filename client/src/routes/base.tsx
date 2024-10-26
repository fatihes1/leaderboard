import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { LeaderboardRoutes } from './leaderboard'; // LeaderboardRoutes dosya yolunu doğru ayarladığından emin ol

export const BaseRoutes = () => {
    return (
        <Router>
            <Switch>
                <Route path={'/'} component={LeaderboardRoutes} />
            </Switch>
        </Router>
    );
};
