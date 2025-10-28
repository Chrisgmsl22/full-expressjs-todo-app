import { IRegisterRequest } from "../../types";
import request from "supertest";
import { clearTestDB, connectTestDB, disconnectTestDB } from "../setup";
import { createTestApp } from "../testAppInstance";

const app = createTestApp();

describe("User API Integration Tests", () => {
    // Connect to test DB before all tests run
    beforeAll(async () => {
        await connectTestDB();
    });

    //Cleanup after each test runs
    beforeEach(async () => {
        await clearTestDB();
    });

    // Teardown, Disconnect after all tests have run
    afterAll(async () => {
        await disconnectTestDB();
    });

    describe("POST /api/auth/register", () => {
        it("Should successfully register a new user", async () => {
            const userDataInput = {
                username: "myUserName",
                email: "myEmail@test.com",
                password: "myValidPassword123$",
            } as IRegisterRequest;
            const postRoute = "/api/auth/register";

            const response = await request(app)
                .post(postRoute)
                .send(userDataInput)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User registered successfully");
            expect(response.body.data).toBeDefined();
            expect(response.body.data.email).toBe(
                userDataInput.email.toLowerCase()
            );
            expect(response.body.data.username).toBe(
                userDataInput.username.toLowerCase()
            );
        });

        it("Should reject registration when email is invalid", async () => {
            const userDataInput = {
                username: "myUserName",
                email: "invalidemail.com",
                password: "myValidPassword123$",
            } as IRegisterRequest;
            const postRoute = "/api/auth/register";

            const response = await request(app)
                .post(postRoute)
                .send(userDataInput)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid email format");
        });
    });
});
