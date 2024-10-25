import express from "express";
const router = express.Router();
import LeaderboardController from "../controllers/leaderboard";

const leaderboardController = new LeaderboardController();

router.get('/', leaderboardController.index);

export default router;