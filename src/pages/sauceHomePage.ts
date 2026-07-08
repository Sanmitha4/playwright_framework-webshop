import { expect, Page } from "@playwright/test";
import PlaywrightWrapper from "../helper/wrapper/PlaywrightWrappers";
import { HTMLSubStepLogger } from "../support/htmllSubStepLogger";

export default class SauceHomePage {
    private base: PlaywrightWrapper;

    constructor(private page: Page, private logger: HTMLSubStepLogger) {
        this.base = new PlaywrightWrapper(page, logger);
    }

    private Elements = {
        homeUrl: "https://sauce-demo.myshopify.com/",
        cartCountText: (count: string) => `text=/My Cart\\s*\\(${count}\\)/i`,
        addToCartButton: { role: "button" as const, name: /add to cart/i },
    }

    async navigateToHome() {
        await this.base.goto(this.Elements.homeUrl);
        await expect(this.page).toHaveTitle(/Sauce Demo/i);
        this.logger.info("Navigated to Sauce Demo home page");
    }

    async openProduct(productName: string) {
        const productLink = this.page.locator("a:visible", { hasText: productName }).first();
        await productLink.waitFor({ state: "visible" });
        await productLink.click();
        await this.logger.success(`Opened product: ${productName}`);
    }

    async addOpenedProductToCart() {
        const addToCartBtn = this.page.getByRole(this.Elements.addToCartButton.role, { name: this.Elements.addToCartButton.name });
        await addToCartBtn.waitFor({ state: "visible" });
              // Wait for the actual /cart/add network response, not just a generic
       // load-state - this theme adds to cart via AJAX (no full page nav),
       // so waitForLoadState resolves immediately and races the real update.
       const [response] = await Promise.all([
           this.page.waitForResponse(res => /\/cart\/add/.test(res.url()), { timeout: 15000 }).catch(() => null),
           addToCartBtn.click(),
       ]);
       if (response) {
           this.logger.success(`Add to Cart request completed (status ${response.status()})`);
       } else {
           this.logger.info("No /cart/add network response detected within timeout; falling back to load-state wait");
           await this.page.waitForLoadState("domcontentloaded");
       }
       // Small settle buffer in case the theme updates cart-related DOM/state
       // just after the response resolves.
       await this.page.waitForTimeout(300);
    }
    

    async addProductToCartByName(productName: string) {
        await this.openProduct(productName);
        await this.addOpenedProductToCart();
    }

    async verifyCartCountIs(expectedCount: string): Promise<boolean> {
        const locator = this.page.locator(this.Elements.cartCountText(expectedCount)).first();
        try {
            await locator.waitFor({ state: "visible", timeout: 10000 });
            this.logger.success(`Cart count updated to ${expectedCount}`);
            return true;
        } catch (e) {
            this.logger.failure(`Cart count did not update to ${expectedCount}`);
            return false;
        }
    }

    async increaseQuantityBy(productName: string, times: number) {
        for (let i = 0; i < times; i++) {
            await this.navigateToHome();
            await this.openProduct(productName);
            await this.addOpenedProductToCart();
        }
        this.logger.success(`Clicked Add to Cart ${times} additional time(s) for ${productName}`);
    }
}
