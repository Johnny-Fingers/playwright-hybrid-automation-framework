import { Locator, Page } from "@playwright/test";

export class HomePage {
    // Define locators
    readonly globalFeedToggle: Locator;
    readonly userNav: Locator;

    constructor(private page: Page) {
        // Initialize the elements
        this.globalFeedToggle = page.getByRole("link", { name: "Global Feed" });
        this.userNav = page.locator(".navbar");
    }

    // Verify the username is visible on the navbar
    async isUserLoggedIn(username: string): Promise<boolean> {
        const userLink = this.userNav.getByRole("link", { name: username });
        return await userLink.isVisible();
    }
}