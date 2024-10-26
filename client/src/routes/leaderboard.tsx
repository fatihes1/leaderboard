import {Route, Switch} from 'react-router-dom';
import {LeaderboardPage} from "../pages/leaderboard.tsx";

export const LeaderboardRoutes = () => {
    
    return (
        <>
            <Switch>
                <Route exact path={'/'} component={LeaderboardPage} />
            </Switch>
        </>
    )
}