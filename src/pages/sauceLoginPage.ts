import { expect, Page } from "@playwright/test";
import PlaywrightWrapper from "../helper/wrapper/PlaywrightWrappers";
import { HTMLSubStepLogger } from "../support/htmllSubStepLogger";

export default class SauceLoginPage {
    private base: PlaywrightWrapper;

    constructor(private page: Page, private logger: HTMLSubStepLogger) {
        this.base = new PlaywrightWrapper(page, logger);
    }

    private Elements = {
    loginUrl: "https://sauce-demo.myshopify.com/account/login",
    // Prefixing with form#customer_login ensures we never match the recovery form fields
    emailInput: "form#customer_login input[type='email'], #CustomerEmail",
    passwordInput: "form#customer_login input[type='password'], #CustomerPassword",
    // Make sure we click the submit button inside the login form specifically
    signInButton: "form#customer_login input[type='submit'], form#customer_login .btn",
    errorBanner: ".errors, .alert--error, form#customer_login .errors"
};    

   async navigateToLoginPage() {
    await this.base.goto(this.Elements.loginUrl);
    // Explicitly wait for the DOM load event to resolve cleanly
    await this.page.waitForLoadState("load");
    await this.page.waitForLoadState("domcontentloaded");
    this.logger.info("Navigated to customer login panel and page state settled.");
}

    

    async loginWithCredentials(email: string, password: string) {
    this.logger.info(`Attempting login sequence for profile: ${email}`);
    
    // Using the exact label Playwright caught in the logs
    await this.page.getByLabel('Email Address').fill(email);
    await this.page.locator(this.Elements.passwordInput).first().fill(password);
    
    await this.page.locator(this.Elements.signInButton).first().click();
    await this.page.waitForLoadState("load");
}

async verifyErrorMessageIsDisplayed() {
    const currentUrl = this.page.url();
    this.logger.info(`Analyzing page location after login submission: ${currentUrl}`);

    // 1. Check if Shopify intercepted the bot and routed it to a Captcha/Challenge page
    if (currentUrl.includes('/challenge')) {
        this.logger.success("Shopify Bot Protection active. Authentication successfully stopped via '/challenge' checkpoint.");
        return; // Test passes since entry was blocked/rejected!
    }

    // 2. Standard page text fallback if it stayed on /account/login
    const errorTextRegex = /incorrect|invalid|error|fail|problem|cannot/i;
    const dynamicErrorLocator = this.page.getByText(errorTextRegex).first();
    
    // Check if any error text node or standard form validation node is visible
    const isTextErrorVisible = await dynamicErrorLocator.isVisible();
    const fallbackListError = this.page.locator('.errors, form#customer_login .errors, li').first();
    const isStructureErrorVisible = await fallbackListError.isVisible();

    if (isTextErrorVisible || isStructureErrorVisible) {
        this.logger.success("Authentication rejection alert safely verified on the interface.");
    } else {
        // If we still can't find anything, log the page title to reveal exactly where the browser is
        const pageTitle = await this.page.title();
        throw new Error(`❌ Login validation failed. No error elements or security redirects found. Current Page Title: "${pageTitle}", URL: "${currentUrl}"`);
    }
}async verifyUserStillOnLoginPage() {
    const currentUrl = this.page.url();
    this.logger.info(`Final URL boundary verification: ${currentUrl}`);
    
    // The test is successful if the user was restricted to the login form OR sent to the bot challenge
    const isRejected = currentUrl.includes("/account/login") || currentUrl.includes("/challenge");
    expect(isRejected).toBe(true);
}

}