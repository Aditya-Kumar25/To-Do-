import express from "express";
import { addTask, getTasks, updateTask, deleteTask } from "../controllers/taskControllers.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/AddTask", authMiddleware, addTask);   // Create task
router.get("/FetchTasks", authMiddleware, getTasks);   // Get tasks
router.put("/:id", authMiddleware, updateTask); // Update task
router.delete("/:id", authMiddleware, deleteTask); // Delete task

export default router;
