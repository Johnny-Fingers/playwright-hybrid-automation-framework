import { test, expect } from "../../fixtures/auth.fixture.js";
import { AuthController } from "../../src/api/controllers/auth.controller.js";
import { UserResponse, AuthErrorResponse } from "../../src/api/models/user.model.js";

test.describe("API - Authentication Tests", () => {
    test("Should register a new user successfully", async ({ request }) => {
        const authController = new AuthController(request);
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

    test("Should login successfully with valid credentials", async ({ request, registeredUser }) => {
        const authController = new AuthController(request);
        const loginPayload = {
            user: {
                email: registeredUser.email,
                password: registeredUser.password
            }
        };

        const response = await authController.login(loginPayload);

        expect(response.status()).toBe(200);

        const body: UserResponse = await response.json();
        expect(body.user.email).toBe(loginPayload.user.email);
        expect(body.user.token).toBeTruthy();
        expect(typeof body.user.token).toBe("string");
    });

    test("Should fail login with incorrect password", async ({ request, registeredUser }) => {
        const authController = new AuthController(request);
        const invalidPayload = {
            user: {
                email: registeredUser.email,
                password: "wrongPassword"
            }
        };

        const response = await authController.login(invalidPayload);

        expect(response.status()).toBe(401);

        const body: AuthErrorResponse = await response.json();
        expect(body.errors).toHaveProperty("credentials");
    });
});