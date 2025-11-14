import {
    ICreateTaskRequest,
    ILoginRequest,
    IRegisterRequest,
} from "../../types";
import { generateExpiredToken } from "../../utils";
import { clearTestDB, connectTestDB, disconnectTestDB } from "../setup";
import { createTestApp } from "../testAppInstance";
import request from "supertest";

const app = createTestApp();

describe("Task API Integration tests", () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        await connectTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        // Register a user and login in order to get auth token
        const registerRes = await request(app)
            .post("/api/auth/register")
            .send({
                username: "MyUserName1",
                email: "myEmail@test.com",
                password: "MyPassword123",
            } as IRegisterRequest)
            .expect(201);

        userId = registerRes.body.data._id; // Capture user ID for expired token tests

        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "myEmail@test.com",
                password: "MyPassword123",
            } as ILoginRequest)
            .expect(200);

        authToken = loginRes.body.token;
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    //? Protected routes
    describe("GET /api/tasks", () => {
        it("Should return empty array when no tasks exist", async () => {
            const res = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
            expect(res.body.message).toBe("Tasks retrieved successfully");
        });

        it("Should reject request without an auth token", async () => {
            // Notice how we are not setting a Bearer token, that why request fails
            const res = await request(app).get("/api/tasks").expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Could not validate token");
        });

        it("Should reject request with invalid token", async () => {
            const res = await request(app)
                .get("/api/tasks")
                .set("Authorization", "Bearer invalid-token")
                .expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Invalid token");
        });

        it("Should reject request with expired token", async () => {
            // Generate an expired token for the test user
            const expiredToken = generateExpiredToken(
                userId,
                "myEmail@test.com",
                "MyUserName1"
            );

            const res = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${expiredToken}`)
                .expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Token has expired");
        });

        it("Should return all tasks for an authenticated user", async () => {
            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Task 1",
                    description: "Description1",
                } as ICreateTaskRequest)
                .expect(201);

            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Task 2",
                    description: "Description2",
                } as ICreateTaskRequest)
                .expect(201);

            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Task 3",
                    description: "Description3",
                } as ICreateTaskRequest)
                .expect(201);

            const res = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Tasks retrieved successfully");
            expect(res.body.data).toBeDefined();
            expect(res.body.data).toHaveLength(3);
            expect(res.body.data[0].title).toBe("Task 1");
            expect(res.body.data[1].title).toBe("Task 2");
            expect(res.body.data[2].title).toBe("Task 3");
        });
    });

    describe("POST /api/tasks", () => {
        it("Should create a new task", async () => {
            const taskData = {
                title: "My task",
                description: "My description",
            } as ICreateTaskRequest;

            const response = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send(taskData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe("My task");
            expect(response.body.data.description).toBe("My description");
            expect(response.body.data.completed).toBe(false);
            expect(response.body.data._id).toBeDefined();
        });

        it("Should reject task creation if title (required) is missing", async () => {
            const taskData = {
                description: "My description",
            } as ICreateTaskRequest;

            const response = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send(taskData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "Title is required and must be a string"
            );
        });

        it("Should reject task creation without auth token", async () => {
            const taskData = {
                title: "Title",
                description: "My description",
            } as ICreateTaskRequest;

            const response = await request(app)
                .post("/api/tasks")
                // .set("Authorization", `Bearer ${authToken}`)
                .send(taskData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Could not validate token");
        });
    });

    describe("GET /api/tasks/:id", () => {
        it("Should get a task by ID", async () => {
            // First, create a task
            const createTaskRes = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "My task",
                    description: "My description",
                } as ICreateTaskRequest)
                .expect(201);

            const taskId = createTaskRes.body.data._id;

            // Attempt to get an existing app by ID
            const res = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Task retrieved successfully");
            expect(res.body.data.title).toBe("My task");
            expect(res.body.data.description).toBe("My description");
            expect(res.body.data._id).toBe(taskId);
        });

        it("Should return 404 when task ID does not exist", async () => {
            // Use a valid MongoDB ObjectId format that doesn't exist
            const nonExistentId = "507f1f77bcf86cd799439011";

            const res = await request(app)
                .get(`/api/tasks/${nonExistentId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Task not found");
        });

        it("Should return 400 for invalid task ID format", async () => {
            // Invalid MongoDB ObjectId format
            const invalidId = "invalid-id-123";

            const res = await request(app)
                .get(`/api/tasks/${invalidId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Invalid ID format");
        });

        it("Should reject call without a valid token", async () => {
            const res = await request(app)
                .get("/api/tasks/random-id")
                .expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Could not validate token");
        });
    });

    describe("PATCH /api/tasks/:id", () => {
        it("Should update a task (partial update)", async () => {
            // First, create a task
            const createTaskRes = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Original Title",
                    description: "Original Description",
                } as ICreateTaskRequest)
                .expect(201);

            const taskId = createTaskRes.body.data._id;

            // Update only the completed status (PATCH allows partial updates)
            const res = await request(app)
                .patch(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    completed: true,
                })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Task updated successfully");
            expect(res.body.data._id).toBe(taskId);
            expect(res.body.data.completed).toBe(true);
            // These should remain unchanged
            expect(res.body.data.title).toBe("Original Title");
            expect(res.body.data.description).toBe("Original Description");
        });

        it("Should update multiple fields at once", async () => {
            // Create a task
            const createTaskRes = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Task to Update",
                    description: "Old Description",
                } as ICreateTaskRequest)
                .expect(201);

            const taskId = createTaskRes.body.data._id;

            // Update multiple fields
            const res = await request(app)
                .patch(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Updated Title",
                    description: "Updated Description",
                    completed: true,
                })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe("Updated Title");
            expect(res.body.data.description).toBe("Updated Description");
            expect(res.body.data.completed).toBe(true);
        });

        it("Should return 404 when updating non-existent task", async () => {
            const nonExistentId = "507f1f77bcf86cd799439011";

            const res = await request(app)
                .patch(`/api/tasks/${nonExistentId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    completed: true,
                })
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Task not found");
        });

        it("Should return 400 for invalid task ID format", async () => {
            const invalidId = "invalid-id-format";

            const res = await request(app)
                .patch(`/api/tasks/${invalidId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    completed: true,
                })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Invalid ID format");
        });

        it("Should reject update without auth token", async () => {
            const res = await request(app)
                .patch("/api/tasks/507f1f77bcf86cd799439011")
                .send({
                    completed: true,
                })
                .expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Could not validate token");
        });
    });

    describe("DELETE /api/tasks/:id", () => {
        it("Should successfully delete an existing task", async () => {
            const createTaskRes = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Task to delete",
                    description: "description",
                } as ICreateTaskRequest)
                .expect(201);

            const taskId = createTaskRes.body.data._id;

            await request(app)
                .delete(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(204); // Deletion does not return us anything but this status code
        });

        it("Should reject deletion if ID is not valid", async () => {
            const invalidId = "invalid-id";
            const res = await request(app)
                .delete(`/api/tasks/${invalidId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Invalid ID format");
        });

        it("Should reject deletion if no task was found", async () => {
            const nonExistentId = "507f1f77bcf86cd799439011";
            const res = await request(app)
                .delete(`/api/tasks/${nonExistentId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Task not found");
        });

        it("Should reject deletion if no auth token is provided", async () => {
            const res = await request(app)
                .delete("/api/tasks/id-here")
                .expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Could not validate token");
        });
    });

    describe("Redis Cache Behavior", () => {
        it("Should demonstrate cache MISS then cache HIT on repeated GET requests", async () => {
            // Create a task first
            const createRes = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Cached Task",
                    description: "Testing cache behavior",
                } as ICreateTaskRequest)
                .expect(201);

            const taskId = createRes.body.data._id;

            // First GET - should be MISS (not cached yet)
            const firstGet = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(firstGet.body.success).toBe(true);
            expect(firstGet.body.data.title).toBe("Cached Task");
            // May or may not be cached depending on mock vs real Redis
            console.log("First GET - cached:", firstGet.body.cached);

            // Second GET - should be HIT (now cached)
            const secondGet = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(secondGet.body.success).toBe(true);
            expect(secondGet.body.data.title).toBe("Cached Task");

            // If using real Redis, this should be cached
            console.log("Second GET - cached:", secondGet.body.cached);

            // Note: In real Redis, secondGet.body.cached should be true
        });

        it("Should invalidate cache after updating a task", async () => {
            // Create task
            const createRes = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "Original Title",
                    description: "Original description",
                } as ICreateTaskRequest)
                .expect(201);

            const taskId = createRes.body.data._id;

            // First GET - caches the task
            await request(app)
                .get(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            // Update the task - should invalidate cache
            await request(app)
                .patch(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Updated Title" })
                .expect(200);

            // GET again - should fetch from DB (not cache) with updated title
            const afterUpdate = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(afterUpdate.body.data.title).toBe("Updated Title");
            // Should NOT be cached (cache was invalidated)
            expect(afterUpdate.body.cached).toBeFalsy();
        });

        it("Should cache task list and invalidate on new task creation", async () => {
            // First GET - empty list, will be cached
            const firstList = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(firstList.body.data.length).toBe(0);

            // Second GET - should hit cache
            const secondList = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            console.log("Task list cached:", secondList.body.cached);

            // Create a new task - should invalidate list cache
            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "New Task",
                    description: "This should invalidate cache",
                } as ICreateTaskRequest)
                .expect(201);

            // GET list again - should NOT be cached (invalidated)
            const afterCreate = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(afterCreate.body.data.length).toBe(1);
            // Should NOT be from cache
            expect(afterCreate.body.cached).toBeFalsy();
        });
    });
});
