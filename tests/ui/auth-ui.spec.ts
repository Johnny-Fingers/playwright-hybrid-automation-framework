import { test, expect } from "../../fixtures/auth.fixture.js";
import { LoginPage } from "../../src/ui/pages/login.page.js";
import { HomePage } from "../../src/ui/pages/home.page.js";

test.describe("UI - Authentication Tests", () => {
    test("Should login successfully via UI with valid credentials", async ({ page, registeredUser }) => {
        const loginPage = new LoginPage(page);
        const homePage = new HomePage(page);

        await loginPage.navigate();

        await loginPage.login(registeredUser.email, registeredUser.password);

        await expect(page).toHaveURL("/");

        const isLoggedIn = await homePage.isUserLoggedIn(registeredUser.username);
        expect(isLoggedIn).toBe(true);
    });
});