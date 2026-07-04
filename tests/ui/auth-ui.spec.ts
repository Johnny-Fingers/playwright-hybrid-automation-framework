import { test, expect, request as playwrightRequest } from "@playwright/test";
import { LoginPage } from "../../src/ui/pages/login.page.js";
import { HomePage } from "../../src/ui/pages/home.page.js";
import { AuthController } from "../../src/api/controllers/auth.controller.js";

test.describe("UI - Authentication Tests", () => {
    let loginPage: LoginPage;
    let homePage: HomePage;

    let dynamicUsername: string;
    let dynamicEmail: string;
    const testPassword: string = "newPassword123!";

    // Suite pre-condition: Existing user
    test.beforeAll(async () => {
        // Creating new isolated context aiming to backend to avoid endpoint errors
        const apiContext = await playwrightRequest.newContext({
            baseURL: "https://api.realworld.show"
        });

        // Injecting the backend context
        const authController = new AuthController(apiContext);
        const uniqueId = Date.now();

        dynamicUsername = `user_${uniqueId}`;
        dynamicEmail = `email_${uniqueId}@test.com`;

        const response = await authController.register({
            user: {
                username: dynamicUsername,
                email: dynamicEmail,
                password: testPassword
            }
        });
        
        if (response.status() !== 201) {
            throw new Error(`Setup failed: Could not register user. Status: ${response.status()}`);
        }
    });

    test.beforeEach(async ({ page }) => {
        // Initialize every page
        loginPage = new LoginPage(page);
        homePage = new HomePage(page);
        await loginPage.navigate();
    });

    test("Should login successfully via UI with valid credentials", async ({ page }) => {
        await loginPage.login(dynamicEmail, testPassword);

        await expect(page).toHaveURL("/");

        const isLoggedIn = await homePage.isUserLoggedIn(dynamicUsername);
        expect(isLoggedIn).toBe(true);
    });
});