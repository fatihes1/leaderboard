import express from "express";
const router = express.Router();
import PlayerController from "../controllers/player-controller";

const playerController = new PlayerController();

router.get('/', playerController.index);

export default router;