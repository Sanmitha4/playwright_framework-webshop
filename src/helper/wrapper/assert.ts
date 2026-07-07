import { expect, Page } from "@playwright/test";

export default class Assert {
    static async assertTitle(page: Page, title: string, logger?: { info: (msg: string) => void, success?: (msg: string) => void, failure?: (msg: string) => void }) {
        logger?.info?.(`Asserting page title is: ${title}`);
        try {
            await expect(page).toHaveTitle(title);
            logger?.success?.(`Page title matches: ${title}`);
        } catch (e) {
            logger?.failure?.(`Page title assertion failed: ${title}`);
            throw e;
        }
    }

    static async assertTitleContains(page: Page, title: string, logger?: { info: (msg: string) => void, success?: (msg: string) => void, failure?: (msg: string) => void }) {
        logger?.info?.(`Asserting page title contains: ${title}`);
        try {
            const pageTitle = await page.title();
            expect(pageTitle).toContain(title);
            logger?.success?.(`Page title contains: ${title}`);
        } catch (e) {
            logger?.failure?.(`Page title does not contain: ${title}`);
            throw e;
        }
    }

    static async assertURL(page: Page, url: string, logger?: { info: (msg: string) => void, success?: (msg: string) => void, failure?: (msg: string) => void }) {
        logger?.info?.(`Asserting page URL is: ${url}`);
        try {
            await expect(page).toHaveURL(url);
            logger?.success?.(`Page URL matches: ${url}`);
        } catch (e) {
            logger?.failure?.(`Page URL assertion failed: ${url}`);
            throw e;
        }
    }

    static async assertURLContains(page: Page, text: string, logger?: { info: (msg: string) => void, success?: (msg: string) => void, failure?: (msg: string) => void }) {
        logger?.info?.(`Asserting page URL contains: ${text}`);
        try {
            const pageURL = page.url();
            expect(pageURL).toContain(text);
            logger?.success?.(`Page URL contains: ${text}`);
        } catch (e) {
            logger?.failure?.(`Page URL does not contain: ${text}`);
            throw e;
        }
    }

    static async assertElementExists(page: Page, locator: string, logger?: { info: (msg: string) => void, success?: (msg: string) => void, failure?: (msg: string) => void }) {
        logger?.info?.(`Asserting element exists: ${locator}`);
        try {
            const element = page.locator(locator);
            await expect(element).toBeVisible();
            logger?.success?.(`Element is visible: ${locator}`);
        } catch (e) {
            logger?.failure?.(`Element not visible: ${locator}`);
            throw e;
        }
    }

    static async assertElementNotExists(page: Page, locator: string, logger?: { info: (msg: string) => void, success?: (msg: string) => void, failure?: (msg: string) => void }) {
        logger?.info?.(`Asserting element does not exist: ${locator}`);
        try {
            const element = page.locator(locator);
            await expect(element).not.toBeVisible();
            logger?.success?.(`Element is not visible: ${locator}`);
        } catch (e) {
            logger?.failure?.(`Element is visible (should not be): ${locator}`);
            throw e;
        }
    }

    static async assertTrue(condition: boolean, logger?: { info: (msg: string) => void, success?: (msg: string) => void, failure?: (msg: string) => void }) {
        logger?.info?.(`Asserting condition is true`);
        try {
            expect(condition).toBeTruthy();
            logger?.success?.(`Condition is true`);
        } catch (e) {
            logger?.failure?.(`Condition is not true`);
            throw e;
        }
    }

    static async assertTextContents(page: Page, locator: string, expectedText: string, logger?: { info: (msg: string) => void, success?: (msg: string) => void, failure?: (msg: string) => void }) {
        logger?.info?.(`Asserting text contents for ${locator} is: ${expectedText}`);
        try {
            const element = page.locator(locator);
            await expect(element).toHaveText(expectedText);
            logger?.success?.(`Text contents match for ${locator}`);
        } catch (e) {
            logger?.failure?.(`Text contents do not match for ${locator}`);
            throw e;
        }
    }
}
