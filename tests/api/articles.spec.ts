import { test, expect } from "../../fixtures/auth.fixture.js";
import { ArticleController } from "../../src/api/controllers/article.controller.js";
import { ArticleResponse } from "../../src/api/models/article.model.js";

test.describe("API - Articles Test", () => {
    test("Should create an article successfully", async ({ authenticatedRequest }) => {
        const articleController = new ArticleController(authenticatedRequest);
        const uniqueId = Date.now();
        const articlePayload = {
            article: {
                title: `This is the Playwright Test ${uniqueId}`,
                description: "If you see this article it means that the create article test (via API) passed.",
                body: "This article was wrote using the Conduit's API. It works as an example of how robust could be Playwright.",
                tagList: ["testing", "automation", "playwright", "typescript"]
            }
        };

        const response = await articleController.create(articlePayload);

        expect(response.status()).toBe(201);

        const body: ArticleResponse = await response.json();
        expect(body.article.title).toBe(articlePayload.article.title);
        expect(body.article.slug).toBeTruthy();
        expect(body.article.author.following).toBe(false);
    });

    test("Should get an existing article publicy by slug", async ({ authenticatedRequest }) => {
        const articleController = new ArticleController(authenticatedRequest);
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

        const createResponse = await articleController.create(articlePayload);
        const createBody: ArticleResponse = await createResponse.json();
        const targetSlug = createBody.article.slug;

        // Get article by its slug
        const response = await articleController.get(targetSlug);

        expect(response.status()).toBe(200);

        const body: ArticleResponse = await response.json();
        expect(body.article.slug).toBe(targetSlug);
        expect(body.article.title).toBe(articlePayload.article.title);
    });

    test("Should delete an article successfully", async ({ authenticatedRequest }) => {
        const articleController = new ArticleController(authenticatedRequest);
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

        const createResponse = await articleController.create(articlePayload);
        const createBody: ArticleResponse = await createResponse.json();
        const targetSlug = createBody.article.slug;

        // Delete article
        const response = await articleController.delete(targetSlug);

        expect(response.status()).toBe(204);

        const verifyResponse = await articleController.get(targetSlug);
        expect(verifyResponse.status()).toBe(404);
    });
});