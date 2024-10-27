import express from "express";
const router = express.Router();
import PlayerController from "../controllers/player";

const playerController = new PlayerController();

router.get('/', playerController.index);
router.put('/:id', playerController.update);

export default router;