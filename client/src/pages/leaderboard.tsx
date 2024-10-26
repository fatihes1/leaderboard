import TableExample from "../components/ui/example.tsx";
import {LeaderboardProvider} from "../providers/leaderboard/leaderboard-provider.tsx";

export const LeaderboardPage = () => {
    return (
        <LeaderboardProvider>
                <TableExample />
        </LeaderboardProvider>
    )
}