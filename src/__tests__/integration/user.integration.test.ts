import { ILoginRequest, IRegisterRequest } from "../../types";
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
            expect(response.body.data.username).toBe(userDataInput.username);
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

        it("Should reject registration with weak password", async () => {
            const userDataInput = {
                username: "myUserName",
                email: "usernameemail@test.com",
                password: "weak",
            } as IRegisterRequest;

            const response = await request(app)
                .post("/api/auth/register")
                .send(userDataInput)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "Password is not valid, must be at least 8 digits long, must contain alpha numeric characters"
            );
        });

        it("Should reject registration if one of the request params is missing", async () => {
            const userDataInput = {
                username: "myUserName",
                //email: "usernameemail@test.com",
                password: "weak",
            } as Partial<IRegisterRequest>;

            const response = await request(app)
                .post("/api/auth/register")
                .send(userDataInput)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "username, email and password are required and must be strings"
            );
        });

        it("Should reject registration if one of the request params has a different type", async () => {
            const userDataInput = {
                username: 123,
                email: "usernameemail@test.com",
                password: true,
            };

            const response = await request(app)
                .post("/api/auth/register")
                .send(userDataInput)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "username, email and password are required and must be strings"
            );
        });

        it("Should reject duplicate email registration", async () => {
            const userDataInput = {
                username: "myUserName",
                email: "usernameemail@test.com",
                password: "WeWork441$$$",
            } as IRegisterRequest;

            await request(app)
                .post("/api/auth/register")
                .send(userDataInput)
                .expect(201);

            const response = await request(app)
                .post("/api/auth/register")
                .send(userDataInput)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                "User with this email already exists"
            );
        });

        it("Should reject duplicate username registration", async () => {
            const userDataInput = {
                username: "myUserName",
                email: "usernameemail@test.com",
                password: "WeWork441$$$",
            } as IRegisterRequest;

            const userDataInput2 = {
                username: "myUserName",
                email: "differentEmail@test.com",
                password: "WeWork441$$$",
            } as IRegisterRequest;

            await request(app)
                .post("/api/auth/register")
                .send(userDataInput)
                .expect(201);

            const response = await request(app)
                .post("/api/auth/register")
                .send(userDataInput2)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Username already exists");
        });
    });

    describe("POST /api/auth/login", () => {
        const registerUser = async () => {
            return await request(app)
                .post("/api/auth/register")
                .send({
                    username: "myUsername",
                    email: "myEmail@test.com",
                    password: "MyPassword123#",
                } as IRegisterRequest)
                .expect(201);
        };

        it("Should successfully login with the correct credentials", async () => {
            await registerUser();

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "myEmail@test.com",
                    password: "MyPassword123#",
                } as ILoginRequest)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User logged in successfully");

            expect(response.body.user).toBeDefined();
            expect(response.body.user.username).toBe("myUsername");
            expect(response.body.user.email).toMatch(/myEmail@test.com/i);
            expect(response.body.token).toBeDefined();
            expect(response.body.token.split(".")).toHaveLength(3);
        });
    });
});
