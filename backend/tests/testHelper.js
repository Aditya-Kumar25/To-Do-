import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Force the environment to use a test-specific MongoDB URI and JWT Secret
process.env.MONGO_URI = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/todo_test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_12345678";

export async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

export async function cleanDB() {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
}
