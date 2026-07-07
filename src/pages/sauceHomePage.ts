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
        const productLink = this.page.locator("a", { hasText: productName }).first();
        await productLink.waitFor({ state: "visible" });
        await productLink.click();
        await this.logger.success(`Opened product: ${productName}`);
    }

    async addOpenedProductToCart() {
        const addToCartBtn = this.page.getByRole(this.Elements.addToCartButton.role, { name: this.Elements.addToCartButton.name });
        await addToCartBtn.waitFor({ state: "visible" });
        await addToCartBtn.click();
        await this.logger.success("Clicked Add to Cart");
        await this.page.waitForLoadState("domcontentloaded");
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
}
