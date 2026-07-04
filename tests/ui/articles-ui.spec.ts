import { test, expect, request as playwrightRequest } from "@playwright/test";
import { AuthController } from "../../src/api/controllers/auth.controller.js";
import { ArticlePage } from "../../src/ui/pages/article.page.js";

test.describe("UI - Articles Tests", async () => {
    let articlePage: ArticlePage;
    let authToken: string;
    let username: string;

    test.beforeAll(async () => {
        // Creating new isolated context aiming to backend to avoid endpoint errors
        const apiContext = await playwrightRequest.newContext({
            baseURL: "https://api.realworld.show"
        });

        // Injecting the backend context
        const authController = new AuthController(apiContext);
        const uniqueId = Date.now();
        username = `user_${uniqueId}`;

        // Suite pre-condition: Existing user
        const response = await authController.register({
            user: {
                username: username,
                email: `email_${uniqueId}@test.com`,
                password: "newPassword123!"
            }
        });

        if (response.status() !== 201) {
            throw new Error(`Setup failed: Could not register user. Status: ${response.status()}`);
        };

        const body = await response.json();
        authToken = body.user.token;
        await apiContext.dispose(); // Clean context
    });

    test.beforeEach(async ({ page, context }) => {
        // Injecting jwt in local storage for authentication
        await context.addInitScript((token) => {
            window.localStorage.setItem("jwtToken", token);
        }, authToken);

        articlePage = new ArticlePage(page);
        await articlePage.navigateToEditor();
    });

    test("Should create and publish a new article via UI", async ({ page }) => {
        const uniqueId = Date.now();
        const articleData = {
            title: `Article test ${uniqueId}`,
            description: "Verifying frontend creation flow.",
            body: "Hello from Playwright. This is an automated article created using Playwright.",
            tags: ["automation", "ui", "test"]
        };

        await articlePage.createArticle(
            articleData.title,
            articleData.description,
            articleData.body,
            articleData.tags
        );

        await expect(page).toHaveURL(/\/article\/.+/);
        await expect(articlePage.articleTitleHeader).toHaveText(articleData.title);
        await expect(articlePage.articleBodyContent).toContainText(articleData.body);
    });
});