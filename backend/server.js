import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/signup",authRoutes);
app.use("/login",authRoutes);
app.use("/me",authMiddleware,authRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(()=> console.log("MongoDB connected"))

app.listen(process.env.PORT,()=>console.log("Running on port 3000"));