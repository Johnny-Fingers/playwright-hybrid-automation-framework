import { test, expect } from "../../fixtures/auth.fixture.js";
import { ArticleController } from "../../src/api/controllers/article.controller.js";
import { CommentController } from "../../src/api/controllers/comment.controller.js";
import { ArticleResponse } from "../../src/api/models/article.model.js";
import { CommentResponse } from "../../src/api/models/comment.model.js";

test.describe("API - Comments Tests", () => {   
    test("Should add a comment to an article successfully", async ({ authenticatedRequest }) => {
        const articleController = new ArticleController(authenticatedRequest);
        const commentController = new CommentController(authenticatedRequest);
        // Test pre-condition: Existing article
        const uniqueId = Date.now();

        const articlePayload = {
            article: {
                title: `Article for comments ${uniqueId}`,
                description: "This article is for comments testing",
                body: "Add a comment using Playwright",
                tagList: ["testing", "comments", "integration"]
            }
        };

        const articleResponse = await articleController.create(articlePayload);
        expect(articleResponse.status()).toBe(201);
        // Recover the slug to add a comment to this article
        const articleBody: ArticleResponse = await articleResponse.json();
        const targetSlug = articleBody.article.slug;

        // Add comment
        const commentPayload = {
            comment: {
                body: "This automated comment was added using Playwright."
            }
        };

        const response = await commentController.create(targetSlug, commentPayload);

        expect(response.status()).toBe(201);
        const commentBody: CommentResponse = await response.json();
        expect(commentBody.comment.body).toBe(commentPayload.comment.body);
        expect(commentBody.comment.id).toBeTruthy();
        expect(typeof commentBody.comment.id).toBe("number");
    });
});