import { Page, Locator, expect } from "@playwright/test";
import { HTMLSubStepLogger } from "../../support/htmllSubStepLogger";
// import { StepLogger } from "../../support/textSubStepLogger";

export default class PlaywrightWrapper {
    constructor(private page: Page, private logger: HTMLSubStepLogger) { }

    // ✅ Reusable waitFor method
    async waitForElement(locator: string): Promise<Locator> {
        const element = this.page.locator(locator);
        await element.waitFor({ state: "visible" });
        return element;
    }

  async goto(path: string) {
  const baseUrl = process.env.BASEURL;
  if (!baseUrl) {
    throw new Error(" BASEURL is undefined. Check your .env file and dotenv.config()");
  }

  // Combine base + relative path
  const url = new URL(path, baseUrl).toString();
  // console.log("My URL is :" +url)
  const response = await this.page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  if (!response || !response.ok()) {
    throw new Error(
      `Navigation failed: ${response?.status()} ${response?.statusText()} for URL: ${url}`
    );
  }
}


    async waitAndClick(locator: string, objName: string = '') {
        const element = await this.waitForElement(locator);
        await element.click();
        await this.logger.success(`Clicked on element: ${objName || locator}`);
    }

    async navigateTo(link: string) {
        await Promise.all([
            this.page.waitForNavigation(),
            this.page.click(link)
        ]);
    }

    // ✅ Wait for a specific URL (exact or partial)
    async waitForURL(expectedURL: string | RegExp, timeout: number = 5000) {
        if (typeof expectedURL === "string") {
            // Convert string to RegExp to match anywhere in the URL
            const escaped = expectedURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape special chars
            await expect(this.page).toHaveURL(new RegExp(escaped), { timeout });
        } else {
            await expect(this.page).toHaveURL(expectedURL, { timeout });
        }
    }

    // ✅ Perform an action and wait for URL to change
    async waitForURLAfterAction(action: () => Promise<void>, expectedURL: string | RegExp, timeout: number = 5000) {
        await Promise.all([
            action(),                    // Perform the passed action (e.g., click Logout)
            this.page.waitForURL(expectedURL, { timeout })  // Wait for URL
        ]);
    }

    async typeText(locator: string, text: string, objName: string = '') {
        const element = await this.waitForElement(locator);
        await element.fill(text);
        this.logger.success(`Typed ${text} into element: ${objName || locator}`);
    }

    async typePassword(locator: string, text: string, objName: string = '') {
        const element = await this.waitForElement(locator);
        await element.fill(text);
        this.logger.success(`Typed ******** into element: ${objName || locator}`);
    }

    async selectOption(locator: string, value: string, objName: string = '') {
        const element = await this.waitForElement(locator);
        await element.selectOption({ label: value });
        this.logger.success(`Selected option ${value} in element: ${objName || locator}`);
    }

    async check(locator: string, objName: string = '') {
        const element = await this.waitForElement(locator);
        await element.check();
        this.logger.success(`Checked element: ${objName || locator}`);
    }

    async uncheck(locator: string, objName: string = '') {
        const element = await this.waitForElement(locator);
        await element.uncheck();
        await this.logger.success(`Unchecked element: ${objName || locator}`);
    }

    async getText(locator: string): Promise<string | null> {
        const element = await this.waitForElement(locator);
        return await element.textContent();
    }

    async elementExists(locator: string): Promise<boolean> {
        const element = this.page.locator(locator);
        return (await element.count()) > 0;
    }


    async elementVisible(locator: string): Promise<boolean> {
        const element = this.page.locator(locator);
        return await element.isVisible();
    }
   static async parseStringArray(values: string): Promise<string[]> {
   return new Promise((resolve) => {
    const result = values
      .replace(/^\[|\]$/g, '') // remove [ and ] at start/end
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
    resolve(result);
  });
}




}
