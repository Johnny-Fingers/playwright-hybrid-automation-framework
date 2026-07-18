import { Locator, Page } from "@playwright/test";

export class ArticlePage {
    // Define locators of the elements of creation form
    readonly titleInput: Locator;
    readonly descriptionInput: Locator;
    readonly bodyInput: Locator;
    readonly tagsInput: Locator;
    readonly publishButton: Locator;
    // Define locators of the elements of published article view
    readonly articleTitleHeader: Locator;
    readonly articleBodyContent: Locator;

    constructor (private page: Page) {
        // Initialize the elements
        this.titleInput = page.getByPlaceholder("Article Title");
        this.descriptionInput = page.getByPlaceholder("What's this article about?");
        this.bodyInput = page.getByPlaceholder("Write your article (in markdown)");
        this.tagsInput = page.getByPlaceholder("Enter tags");
        this.publishButton = page.getByRole("button", { name: "Publish Article" });
        this.articleTitleHeader = page.locator(".article-page h1");
        this.articleBodyContent = page.locator(".article-content > div > div");
    }

    // Navigate to editor article page
    async navigateToEditor(): Promise<void> {
        await this.page.goto("/editor");
    }

    // Fill form and send data
    async createArticle(title: string, description: string, body: string, tags: string[]): Promise<void> {
        await this.titleInput.fill(title);
        await this.descriptionInput.fill(description);
        await this.bodyInput.fill(body);
        
        for (const tag of tags) {
            await this.tagsInput.fill(tag);
            await this.tagsInput.press("Enter");
        }

        await this.publishButton.click();
    }
}