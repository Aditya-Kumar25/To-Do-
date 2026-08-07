import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB, cleanDB } from "./testHelper.js";
import User from "../models/User.js";

describe("Auth Controller Tests", () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await cleanDB();
  });

  describe("POST /api/auth/signup", () => {
    test("should successfully register a new user", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.msg, "User registered successfully");

      const user = await User.findOne({ email: "john@example.com" });
      assert.ok(user);
      assert.strictEqual(user.name, "John Doe");
    });

    test("should fail if user already exists", async () => {
      // Register user first
      await request(app)
        .post("/api/auth/signup")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        });

      // Try registering again with the same email
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "John Smith",
          email: "john@example.com",
          password: "password1234",
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.msg, "User already exists");
    });

    test("should fail if password is less than 8 characters", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "short",
        });

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.msg.includes("Password must be at least 8 characters"));
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Alice Smith",
          email: "alice@example.com",
          password: "securepassword",
        });
    });

    test("should login successfully with correct credentials and set httpOnly cookie", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "alice@example.com",
          password: "securepassword",
        });

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.name, "Alice Smith");
      assert.strictEqual(res.body.user.email, "alice@example.com");

      // Verify cookie is set and is HttpOnly
      assert.ok(res.headers["set-cookie"]);
      const cookieHeader = res.headers["set-cookie"][0];
      assert.ok(cookieHeader.includes("token="));
      assert.ok(cookieHeader.includes("HttpOnly"));
      assert.ok(cookieHeader.includes("SameSite=Strict"));
    });

    test("should fail to login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "alice@example.com",
          password: "wrongpassword",
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.message, "Invalid password");
    });

    test("should fail to login for non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "securepassword",
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.message, "User not found");
    });
  });

  describe("GET /api/auth/me", () => {
    let token;

    beforeEach(async () => {
      // Register and login to get token
      await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Bob Jones",
          email: "bob@example.com",
          password: "securepassword",
        });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "bob@example.com",
          password: "securepassword",
        });

      token = loginRes.body.token;
    });

    test("should fetch user profile if authorized via Header", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.name, "Bob Jones");
      assert.strictEqual(res.body.email, "bob@example.com");
      assert.strictEqual(res.body.password, undefined); // Password should be excluded
    });

    test("should fetch user profile if authorized via Cookie", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "bob@example.com",
          password: "securepassword",
        });

      const cookieHeader = loginRes.headers["set-cookie"];
      assert.ok(cookieHeader);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookieHeader);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.name, "Bob Jones");
      assert.strictEqual(res.body.email, "bob@example.com");
    });

    test("should fail to fetch profile if token is missing", async () => {
      const res = await request(app).get("/api/auth/me");

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.msg, "No token, Authorization denied");
    });

    test("should fail to fetch profile if token is invalid", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalidtoken");

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.msg, "Invalid token");
    });
  });

  describe("GET /api/auth/check", () => {
    test("should return isAuthenticated true if authorized via Cookie", async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Cookie Check User",
          email: "cookie_check@example.com",
          password: "securepassword",
        });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "cookie_check@example.com",
          password: "securepassword",
        });

      const cookieHeader = loginRes.headers["set-cookie"];
      assert.ok(cookieHeader);

      const res = await request(app)
        .get("/api/auth/check")
        .set("Cookie", cookieHeader);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.isAuthenticated, true);
      assert.strictEqual(res.body.user.email, "cookie_check@example.com");
    });

    test("should return 401 if cookie/token is missing", async () => {
      const res = await request(app).get("/api/auth/check");
      assert.strictEqual(res.status, 401);
    });
  });
});
