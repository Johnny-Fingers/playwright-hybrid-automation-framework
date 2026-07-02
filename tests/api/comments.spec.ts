import { test, expect } from "@playwright/test";
import { AuthController } from "../../src/api/controllers/auth.controller.js";
import { ArticleController } from "../../src/api/controllers/article.controller.js";
import { CommentController } from "../../src/api/controllers/comment.controller.js";
import { ArticleResponse } from "../../src/api/models/article.model.js";
import { CommentResponse } from "../../src/api/models/comment.model.js";

test.describe("API - Comments Tests", () => {
    let authController: AuthController;
    let articleController: ArticleController;
    let commentController: CommentController;
    let authToken: string;

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

        const body = await response.json();
        authToken = body.user.token;
    });

    test.beforeEach(async ({ request }) => {
        articleController = new ArticleController(request);
        commentController = new CommentController(request);
    });

    test("Should add a comment to an article successfully", async () => {
        const uniqueId = Date.now();

        const articlePayload = {
            article: {
                title: `Article for comments ${uniqueId}`,
                description: "This article is for comments testing",
                body: "Add a comment using Playwright",
                tagList: ["testing", "comments", "integration"]
            }
        };

        const articleResponse = await articleController.create(articlePayload, authToken);
        expect(articleResponse.status()).toBe(201);
        const articleBody: ArticleResponse = await articleResponse.json();
        const targetSlug = articleBody.article.slug;

        const commentPayload = {
            comment: {
                body: "This automated comment was added using Playwright."
            }
        };

        const response = await commentController.create(targetSlug, commentPayload, authToken);

        expect(response.status()).toBe(201);
        const commentBody: CommentResponse = await response.json();
        expect(commentBody.comment.body).toBe(commentPayload.comment.body);
        expect(commentBody.comment.id).toBeTruthy();
        expect(typeof commentBody.comment.id).toBe("number");
    });
});