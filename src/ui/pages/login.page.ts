import { Locator, Page } from "@playwright/test";

export class LoginPage {
    // Define locators
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly signInButton: Locator;
    readonly errorMessage: Locator;

    constructor(private page: Page) {
        // Initialize the elements
        this.emailInput = page.getByPlaceholder("Email");
        this.passwordInput = page.getByPlaceholder("Password");
        this.signInButton = page.getByRole("button", { name: "Sign in" });
        this.errorMessage = page.locator(".error-messages");
    }

    // Navigate to login page directly
    async navigate(): Promise<void> {
        await this.page.goto("/login");
    }

    // Fill form and send data
    async login(username: string, password: string): Promise<void> {
        await this.emailInput.fill(username);
        await this.passwordInput.fill(password);
        await this.signInButton.click();
    }
}