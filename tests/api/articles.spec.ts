import { test, expect } from "@playwright/test";
import { AuthController } from "../../src/api/controllers/auth.controller.js";
import { ArticleController } from "../../src/api/controllers/article.controller.js";
import { ArticleResponse } from "../../src/api/models/article.model.js";

test.describe("API - Articles Test", () => {
    let authController: AuthController;
    let articleController: ArticleController;
    let authToken: string;

    // Suite pre-condition: Existing user
    test.beforeAll(async ({ request }) => {
        authController = new AuthController(request);
        const uniqueId = Date.now();

        const registerPayload = {
            user: {
                username: `user_${uniqueId}`,
                email: `email_${uniqueId}@test.com`,
                password: "newPassword123!"
            }
        };

        const response = await authController.register(registerPayload);

        if (response.status() !== 201) {
            throw new Error("Pre-condition failed: Could not create a user.");
        };

        // Save token for authentication
        const body = await response.json();
        authToken = body.user.token;
    });

    test.beforeEach(({ request }) => {
        // Initialize controller in each test
        articleController = new ArticleController(request);
    });

    test("Should create an article successfully", async () => {
        const uniqueId = Date.now();
        const articlePayload = {
            article: {
                title: `This is the Playwright Test ${uniqueId}`,
                description: "If you see this article it means that the create article test (via API) passed.",
                body: "This article was wrote using the Conduit's API. It works as an example of how robust could be Playwright.",
                tagList: ["testing", "automation", "playwright", "typescript"]
            }
        };

        const response = await articleController.create(articlePayload, authToken);

        expect(response.status()).toBe(201);

        const body: ArticleResponse = await response.json();
        expect(body.article.title).toBe(articlePayload.article.title);
        expect(body.article.slug).toBeTruthy();
        expect(body.article.author.following).toBe(false);
    });

    test("Should get an existing article publicy by slug", async ({ page }) => {
        // Test pre-condition: Existing article
        const uniqueId = Date.now();
        const articlePayload = {
            article: {
                title: `Readable article ${uniqueId}`,
                description: "Article for testing GET endpoint.",
                body: "This is an article to validate reading test.",
                tagList: ["testing", "automation"]
            }
        };

        const createResponse = await articleController.create(articlePayload, authToken);
        const createBody: ArticleResponse = await createResponse.json();
        const targetSlug = createBody.article.slug;

        // Get article by its slug
        const response = await articleController.get(targetSlug, authToken);

        expect(response.status()).toBe(200);

        const body: ArticleResponse = await response.json();
        expect(body.article.slug).toBe(targetSlug);
        expect(body.article.title).toBe(articlePayload.article.title);
    });

    test("Should delete an article successfully", async () => {
        // Test pre-condition: Existing article
        const uniqueId = Date.now();
        const articlePayload = {
            article: {
                title: `Article to delete ${uniqueId}`,
                description: "Article for testing DELETE endpoint.",
                body: "This article will be deleted.",
                tagList: ["playwright", "typescript"]
            }
        };

        const createResponse = await articleController.create(articlePayload, authToken);
        const createBody: ArticleResponse = await createResponse.json();
        const targetSlug = createBody.article.slug;

        // Delete article
        const response = await articleController.delete(targetSlug, authToken);

        expect(response.status()).toBe(204);

        const verifyResponse = await articleController.get(targetSlug, authToken);
        expect(verifyResponse.status()).toBe(404);
    });
});