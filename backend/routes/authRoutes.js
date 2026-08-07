import express from "express";
import {signup,login,getProfile,checkAuth} from "../controllers/authController.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup",signup);
router.post("/login",login);
router.get("/me",authMiddleware,getProfile);
router.get("/check",authMiddleware,checkAuth);

export default router;