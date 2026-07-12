import { test, expect } from "../../fixtures/auth.fixture.js";
import { ArticlePage } from "../../src/ui/pages/article.page.js";

test.describe("UI - Articles Tests", async () => {
    test("Should create and publish a new article via UI", async ({ authenticatedPage }) => {
        const articlePage = new ArticlePage(authenticatedPage);
        
        await articlePage.navigateToEditor();
        
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

        await expect(authenticatedPage).toHaveURL(/\/article\/.+/);
        await expect(articlePage.articleTitleHeader).toHaveText(articleData.title);
        await expect(articlePage.articleBodyContent).toContainText(articleData.body);
    });
});