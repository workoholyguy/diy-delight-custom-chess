import express from "express";
import {
  createCustomItem,
  deleteCustomItem,
  getCustomItem,
  listCustomItems,
  updateCustomItem,
} from "../controllers/customItems.js";

const customItemsRouter = express.Router();

customItemsRouter.get("/", listCustomItems);
customItemsRouter.get("/:id", getCustomItem);
customItemsRouter.post("/", createCustomItem);
customItemsRouter.put("/:id", updateCustomItem);
customItemsRouter.delete("/:id", deleteCustomItem);

export default customItemsRouter;
