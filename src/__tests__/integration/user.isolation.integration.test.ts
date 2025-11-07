import {
    ICreateTaskRequest,
    ILoginRequest,
    IRegisterRequest,
    IUpdateTaskRequest,
} from "../../types";
import request from "supertest";
import { clearTestDB, connectTestDB, disconnectTestDB } from "../setup";
import { createTestApp } from "../testAppInstance";

const app = createTestApp();

describe("User Isolation & Authorization", () => {
    let userAToken: string;
    let userBToken: string;

    let userAId: string;
    let userBId: string;

    let userATaskId: string;
    let userBTaskId: string;
    // Connect to test DB before all tests run
    beforeAll(async () => {
        await connectTestDB();
    });

    //Cleanup after each test runs
    beforeEach(async () => {
        await clearTestDB();

        // Register User A
        const userARes = await request(app)
            .post("/api/auth/register")
            .send({
                username: "UserA",
                email: "userA@test.com",
                password: "PasswordA123",
            } as IRegisterRequest)
            .expect(201);
        // Login User A
        const loginARes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "userA@test.com",
                password: "PasswordA123",
            } as ILoginRequest)
            .expect(200);
        userAId = userARes.body.data.id;
        userAToken = loginARes.body.token;

        // Register User B
        const userBRes = await request(app)
            .post("/api/auth/register")
            .send({
                username: "UserB",
                email: "userB@test.com",
                password: "PasswordB123",
            } as IRegisterRequest)
            .expect(201);

        // Login User B
        const loginBRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "userB@test.com",
                password: "PasswordB123",
            } as ILoginRequest)
            .expect(200);

        userBId = userBRes.body.data.id;
        userBToken = loginBRes.body.token;

        // User A creates a task
        const taskARes = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${userAToken}`)
            .send({
                title: "User A's Private Task",
                description: "Only User A should see this",
            } as ICreateTaskRequest)
            .expect(201);

        // User B creates a task
        const taskBRes = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${userBToken}`)
            .send({
                title: "User B's Private Task",
                description: "Only User B should see this",
            } as ICreateTaskRequest)
            .expect(201);

        userATaskId = taskARes.body.data._id;
        userBTaskId = taskBRes.body.data._id;
    });

    // Teardown, Disconnect after all tests have run
    afterAll(async () => {
        await disconnectTestDB();
    });

    describe("GET /api/tasks - List isolation", () => {
        it("Should return only User As tasks when user A requests", async () => {
            const res = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Tasks retrieved successfully");
            expect(res.body.data).toHaveLength(1);

            expect(res.body.data[0].title).not.toBe("User B's Private Task");
            expect(res.body.data[0].title).toBe("User A's Private Task");

            expect(res.body.data[0].userId).not.toBe(userBId);
            expect(res.body.data[0].userId).toBe(userAId);

            expect(res.body.data[0]._id).not.toBe(userBTaskId);
            expect(res.body.data[0]._id).toBe(userATaskId);
        });

        it("Should return only User Bs tasks when user B requests", async () => {
            const res = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${userBToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Tasks retrieved successfully");
            expect(res.body.data).toHaveLength(1); // Even though we have 2 objs in DB, we should only get 1 back

            expect(res.body.data[0].title).not.toBe("User A's Private Task");
            expect(res.body.data[0].title).toBe("User B's Private Task");

            expect(res.body.data[0].userId).not.toBe(userAId);
            expect(res.body.data[0].userId).toBe(userBId);

            expect(res.body.data[0]._id).not.toBe(userATaskId);
            expect(res.body.data[0]._id).toBe(userBTaskId);
        });

        it("Should return empty array if user has no tasks", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    username: "usernameC",
                    email: "usercemail@test.com",
                    password: "WeWork441$",
                } as IRegisterRequest)
                .expect(201);

            const userCToken = res.body.token;
            const getRes = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${userCToken}`)
                .expect(200);
            expect(getRes.body.success).toBe(true);
            expect(getRes.body.data).toHaveLength(0);
        });
    });

    describe("GET /api/tasks/:id - Read isolation", () => {
        it("Should allow user A to read their own task", async () => {
            const res = await request(app)
                .get(`/api/tasks/${userATaskId}`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(userATaskId);
            expect(res.body.data.title).toBe("User A's Private Task");
        });

        it("Should allow user B to read their on task", async () => {
            const res = await request(app)
                .get(`/api/tasks/${userBTaskId}`)
                .set("Authorization", `Bearer ${userBToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(userBTaskId);
            expect(res.body.data.title).toBe("User B's Private Task");
        });

        it("Should NOT allow user A to read a task from user B", async () => {
            const res = await request(app)
                .get(`/api/tasks/${userBTaskId}`) // User B task
                .set("Authorization", `Bearer ${userAToken}`) // User A is authenticated
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Task not found");
        });

        it("Should NOT allow user B to read a task from user A", async () => {
            const res = await request(app)
                .get(`/api/tasks/${userATaskId}`) // User A task
                .set("Authorization", `Bearer ${userBToken}`) // User B is authenticated
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Task not found");
        });
    });

    describe("PATCH /api/tasks/:id - Update isolation", () => {
        it("Should allow user A to update their own task", async () => {
            const updateTaskBody: IUpdateTaskRequest = {
                title: "Updated title",
                description: "Updated description",
                completed: true,
            };
            const res = await request(app)
                .patch(`/api/tasks/${userATaskId}`) // TaskId from user A
                .set("Authorization", `Bearer ${userAToken}`) // User A is authenticated
                .send(updateTaskBody)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Task updated successfully");
            expect(res.body.data.title).toBe("Updated title");
            expect(res.body.data.description).toBe("Updated description");
            expect(res.body.data.completed).toBe(true);
        });

        it("Should NOT allow user A to update user B's task", async () => {
            const res = await request(app)
                .patch(`/api/tasks/${userBTaskId}`) // TaskID from user B
                .set("Authorization", `Bearer ${userAToken}`) // User A is authenticated
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Task not found");

            // Make sure user B's task was not modified
            const verifyRes = await request(app)
                .get(`/api/tasks/${userBTaskId}`)
                .set("Authorization", `Bearer ${userBToken}`)
                .expect(200);

            expect(verifyRes.body.success).toBe(true);
            expect(verifyRes.body.message).toBe("Task retrieved successfully");
            expect(verifyRes.body.data.title).toBe("User B's Private Task");
        });

        it("Should NOT allow user B to update user A's task", async () => {
            const res = await request(app)
                .patch(`/api/tasks/${userATaskId}`) // TaskID from user A
                .set("Authorization", `Bearer ${userBToken}`) // User B is authenticated
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Task not found");

            // Make sure user A's task was not modified
            const verifyRes = await request(app)
                .get(`/api/tasks/${userATaskId}`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);

            expect(verifyRes.body.success).toBe(true);
            expect(verifyRes.body.message).toBe("Task retrieved successfully");
            expect(verifyRes.body.data.title).toBe("User A's Private Task");
        });
    });

    describe("DELETE /api/tasks/:id - Delete isolation", () => {
        it("Should allow User A to delete their own task", async () => {
            await request(app)
                .delete(`/api/tasks/${userATaskId}`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(204);

            // Verify task is deleted
            await request(app)
                .get(`/api/tasks/${userATaskId}`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(404);
        });

        it("Should NOT allow User A to delete User B's task", async () => {
            const res = await request(app)
                .delete(`/api/tasks/${userBTaskId}`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Task not found");

            // Verify User B's task still exists
            const verifyRes = await request(app)
                .get(`/api/tasks/${userBTaskId}`)
                .set("Authorization", `Bearer ${userBToken}`)
                .expect(200);

            expect(verifyRes.body.success).toBe(true);
            expect(verifyRes.body.data._id).toBe(userBTaskId);
        });

        it("Should NOT allow User B to delete User A's task", async () => {
            await request(app)
                .delete(`/api/tasks/${userATaskId}`)
                .set("Authorization", `Bearer ${userBToken}`)
                .expect(404);

            // Verify User A's task still exists
            await request(app)
                .get(`/api/tasks/${userATaskId}`)
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);
        });
    });

    describe("Multiple tasks per user", () => {
        it("Should properly isolate mutiple tasks from multiple users", async () => {
            // User A creates 2 more tasks (total 3)
            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${userAToken}`)
                .send({
                    title: "User A Task 2",
                    description: "Second task",
                })
                .expect(201);

            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${userAToken}`)
                .send({
                    title: "User A Task 3",
                    description: "Third task",
                })
                .expect(201);

            // User B creates 1 more task (total 2)
            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${userBToken}`)
                .send({
                    title: "User B Task 2",
                    description: "Second task",
                })
                .expect(201);

            // User A should see exactly 3 tasks
            const userARes = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${userAToken}`)
                .expect(200);

            expect(userARes.body.data).toHaveLength(3);

            // User B should see exactly 2 tasks
            const userBRes = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${userBToken}`)
                .expect(200);

            expect(userBRes.body.data).toHaveLength(2);
        });
    });
});
