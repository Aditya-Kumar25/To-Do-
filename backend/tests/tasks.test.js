import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB, cleanDB } from "./testHelper.js";
import User from "../models/User.js";
import Task from "../models/Task.js";

describe("Task Controller Tests", () => {
  let user1, user2;
  let token1, token2;

  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await cleanDB();

    // Create user 1 and get token
    await request(app)
      .post("/api/auth/signup")
      .send({
        name: "User One",
        email: "user1@example.com",
        password: "password123",
      });

    const loginRes1 = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user1@example.com",
        password: "password123",
      });
    token1 = loginRes1.body.token;
    user1 = loginRes1.body.user;

    // Create user 2 and get token
    await request(app)
      .post("/api/auth/signup")
      .send({
        name: "User Two",
        email: "user2@example.com",
        password: "password123",
      });

    const loginRes2 = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user2@example.com",
        password: "password123",
      });
    token2 = loginRes2.body.token;
    user2 = loginRes2.body.user;
  });

  describe("POST /api/tasks/AddTask", () => {
    test("should successfully create a new task for logged in user", async () => {
      const res = await request(app)
        .post("/api/tasks/AddTask")
        .set("Authorization", `Bearer ${token1}`)
        .send({
          title: "Test Task 1",
          description: "Test Description",
          completed: false,
          deadline: new Date(),
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.title, "Test Task 1");
      assert.strictEqual(res.body.user, user1.id);

      const taskInDb = await Task.findById(res.body._id);
      assert.ok(taskInDb);
      assert.strictEqual(taskInDb.title, "Test Task 1");
    });

    test("should fail to create task if title is missing", async () => {
      const res = await request(app)
        .post("/api/tasks/AddTask")
        .set("Authorization", `Bearer ${token1}`)
        .send({
          description: "Missing title description",
        });

      assert.strictEqual(res.status, 500); // Mongoose validation error bubbles up as 500
    });

    test("should prevent creating tasks with duplicate titles for same user", async () => {
      // First task creation
      await request(app)
        .post("/api/tasks/AddTask")
        .set("Authorization", `Bearer ${token1}`)
        .send({ title: "Unique Title" });

      // Duplicate task creation for user 1
      const res = await request(app)
        .post("/api/tasks/AddTask")
        .set("Authorization", `Bearer ${token1}`)
        .send({ title: "Unique Title" });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.msg, "Task with this title already exists");

      // Same title should be allowed for user 2
      const resUser2 = await request(app)
        .post("/api/tasks/AddTask")
        .set("Authorization", `Bearer ${token2}`)
        .send({ title: "Unique Title" });

      assert.strictEqual(resUser2.status, 201);
    });
  });

  describe("GET /api/tasks/FetchTasks", () => {
    beforeEach(async () => {
      // Seed tasks
      await new Task({ title: "Task 1", user: user1.id }).save();
      await new Task({ title: "Task 2", user: user1.id }).save();
      await new Task({ title: "Task 3", user: user2.id }).save();
    });

    test("should fetch all tasks belonging to the logged in user", async () => {
      const res = await request(app)
        .get("/api/tasks/FetchTasks")
        .set("Authorization", `Bearer ${token1}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.length, 2);
      assert.strictEqual(res.body[0].title, "Task 2"); // Descending sort by createdAt
      assert.strictEqual(res.body[1].title, "Task 1");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    let task1;

    beforeEach(async () => {
      task1 = await new Task({ title: "Update Me", description: "Old Description", user: user1.id }).save();
    });

    test("should successfully update a task", async () => {
      const res = await request(app)
        .put(`/api/tasks/${task1._id}`)
        .set("Authorization", `Bearer ${token1}`)
        .send({
          title: "Updated Title",
          description: "New Description",
          completed: true,
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.title, "Updated Title");
      assert.strictEqual(res.body.description, "New Description");
      assert.strictEqual(res.body.completed, true);
    });

    test("should prevent updating another user's task", async () => {
      const res = await request(app)
        .put(`/api/tasks/${task1._id}`)
        .set("Authorization", `Bearer ${token2}`) // User 2 trying to update User 1's task
        .send({ title: "Hijacked Title" });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.msg, "Not authorized");

      const taskInDb = await Task.findById(task1._id);
      assert.strictEqual(taskInDb.title, "Update Me"); // Remains unchanged
    });

    test("should return 404 for a non-existent task ID", async () => {
      const nonExistentId = new User()._id; // Generate random valid ObjectId
      const res = await request(app)
        .put(`/api/tasks/${nonExistentId}`)
        .set("Authorization", `Bearer ${token1}`)
        .send({ title: "Doesn't matter" });

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.msg, "Task not found");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    let task1;

    beforeEach(async () => {
      task1 = await new Task({ title: "Delete Me", user: user1.id }).save();
    });

    test("should successfully delete a task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${task1._id}`)
        .set("Authorization", `Bearer ${token1}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.msg, "Task deleted successfully");

      const taskInDb = await Task.findById(task1._id);
      assert.strictEqual(taskInDb, null);
    });

    test("should prevent deleting another user's task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${task1._id}`)
        .set("Authorization", `Bearer ${token2}`); // User 2 trying to delete User 1's task

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.msg, "Not authorized");

      const taskInDb = await Task.findById(task1._id);
      assert.ok(taskInDb); // Still exists
    });

    test("should return 404 for a non-existent task ID when deleting", async () => {
      const nonExistentId = new User()._id; // Generate random valid ObjectId
      const res = await request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set("Authorization", `Bearer ${token1}`);

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.msg, "Task not found");
    });
  });
});
