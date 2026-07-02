import { test, expect } from "@playwright/test";
import { AuthController } from "../../src/api/controllers/auth.controller.js";
import { UserResponse, AuthErrorResponse } from "../../src/api/models/user.model.js";

test.describe("API - Authentication Tests", () => {
    let authController: AuthController;

    let dynamicUsername: string;
    let dynamicEmail: string;
    let testPassword: string = "newPassword123!"

    // Suite pre-condition: Existing user for loggin
    test.beforeAll(async ({ request }) => {
        const controller = new AuthController(request);
        const uniqueId = Date.now();

        dynamicUsername = `user_${uniqueId}`;
        dynamicEmail = `email_${uniqueId}@test.com`;

        const registerPayload = {
            user: {
                username: dynamicUsername,
                email: dynamicEmail,
                password: testPassword
            }
        };

        const response = await controller.register(registerPayload);

        if (response.status() !== 201) {
            throw new Error(`Setup failed: Could not register user. Status: ${response.status()}`);
        };
    });

    test.beforeEach(({ request }) => {
        // Initialize controller in each test
        authController = new AuthController(request);
    });

    test("Should register a new user successfully", async () => {
        const uniqueId = Date.now();
        const registerPayload = {
            user: {
                username: `user_${uniqueId}`,
                email: `email_${uniqueId}@test.com`,
                password: "newPassword123!"
            }
        };

        const response = await authController.register(registerPayload);

        expect(response.status()).toBe(201);

        const body: UserResponse = await response.json();
        expect(body.user.username).toBe(registerPayload.user.username);
        expect(body.user.email).toBe(registerPayload.user.email);
        expect(body.user.token).toBeTruthy();
    });

    test("Should login successfully with valid credentials", async () => {
        const loginPayload = {
            user: {
                email: dynamicEmail,
                password: testPassword
            }
        };

        const response = await authController.login(loginPayload);

        expect(response.status()).toBe(200);

        const body: UserResponse = await response.json();
        expect(body.user.email).toBe(loginPayload.user.email);
        expect(body.user.token).toBeTruthy();
        expect(typeof body.user.token).toBe("string");
    });

    test("Should fail login with incorrect password", async () => {
        const invalidPayload = {
            user: {
                email: dynamicEmail,
                password: "wrongPassword"
            }
        };

        const response = await authController.login(invalidPayload);

        expect(response.status()).toBe(401);

        const body: AuthErrorResponse = await response.json();
        expect(body.errors).toHaveProperty("credentials");
    });
});