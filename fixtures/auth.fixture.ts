import { test as base, Page, APIRequestContext, request as playwrightRequest } from "@playwright/test";
import { AuthController } from "../src/api/controllers/auth.controller.js";

type UserCredentials = {
    username: string;
    email: string;
    password: string;
};

type MyFixtures = {
    authenticatedPage: Page;
    authenticatedRequest: APIRequestContext;
    registeredUser: UserCredentials;
};

export const test = base.extend<MyFixtures>({
    // Set an authenticated page for UI tests
    authenticatedPage: async ({ page, context }, use) => {
        const apiContext = await playwrightRequest.newContext({
            baseURL: "http://localhost:3001"
        });
        const authController = new AuthController(apiContext);
        const uniqueId = Date.now();

        const response = await authController.register({
            user: {
                username: `user_${uniqueId}`,
                email: `email_${uniqueId}@test.com`,
                password: "Password123!"
            }
        });

        if (response.status() !== 201) {
            console.error("authenticatedPage FAIL:", await response.json());
            throw new Error(`authenticatedPage Setup failed. Status: ${response.status()}`);
        }

        const body = await response.json();
        const token = body.user.token;
        await apiContext.dispose();

        await context.addInitScript((jwt) => {
            window.localStorage.setItem("token", jwt)
        }, token);

        await use(page);
    },

    // Set the context for API testing
    authenticatedRequest: async ({}, use) => {
        const apiContext = await playwrightRequest.newContext({
            baseURL: "http://localhost:3001"
        });
        const authController = new AuthController(apiContext);
        const uniqueId = Date.now();

        const response = await authController.register({
            user: {
                username: `user_${uniqueId}`,
                email: `email_${uniqueId}@test.com`,
                password: "Password123!"
            }
        });

        if (response.status() !== 201) {
            console.error("authenticatedRequest FAIL:", await response.json());
            throw new Error(`authenticatedRequest Setup failed. Status: ${response.status()}`);
        }
        const body = await response.json();
        const token = body.user.token;

        const authorizedContext = await playwrightRequest.newContext({
            baseURL: "http://localhost:3001",
            extraHTTPHeaders: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json"
            }
        });

        await apiContext.dispose();
        await use(authorizedContext);
        await authorizedContext.dispose();
    },

    // Resgister a user without save its authentication token
    registeredUser: async ({}, use) => {
        const apiContext = await playwrightRequest.newContext({
            baseURL: "http://localhost:3001"
        });
        const authController = new AuthController(apiContext);

        const uniqueId = Date.now();
        const credentials = {
            username: `user_${uniqueId}`,
            email: `email_${uniqueId}@test.com`,
            password: "Password123!"
        };

        const response = await authController.register({ user: credentials });
        if (response.status() !== 201) {
            console.error("registeredUser FAIL:", await response.json());
            throw new Error(`registeredUser Fixture: Failed to pre-register user. Status: ${response.status()}`);
        };
        await apiContext.dispose();
        await use(credentials);
    }
});

export { expect } from "@playwright/test";