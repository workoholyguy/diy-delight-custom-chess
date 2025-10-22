import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  getChessPieces,
  getChessById,
  deleteChessPiece,
  updateChessPiece,
} from "../controllers/chess.js";

// import GiftsController from "../controllers/gifts.js";

// const __fileName = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__fileName);

const router = express.Router();

router.get("/", getChessPieces);

router.get("/:id", getChessById);

router.delete("/:id", deleteChessPiece);

router.patch("/:id", updateChessPiece);

export default router;
