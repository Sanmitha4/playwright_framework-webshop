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
    async doubleClickAddToCartFor(productName: string) {
    // 1. Navigate to the product detail page first
    await this.openProduct(productName);

    // 2. Locate the button
    const addToCartBtn = this.page.getByRole(this.Elements.addToCartButton.role, { 
        name: this.Elements.addToCartButton.name 
    });
    await addToCartBtn.waitFor({ state: "visible" });

    this.logger.info(`Simulating rapid double-click on Add to Cart for: ${productName}`);

    // 3. Execute an explicit double-click without waiting for AJAX intervals
    await addToCartBtn.click({ clickCount: 2, delay: 50 }); 
    
    // Settle buffer for network requests to complete/fail
    await this.page.waitForTimeout(1000);
}
async mockProductAsSoldOut(productUrlHandle: string) {
    this.logger.info(`Intercepting network to mock product '${productUrlHandle}' as sold out.`);
    
    // Intercept Shopify's background data request before navigating
    await this.page.route(`**/products/${productUrlHandle}.js`, async (route) => {
        const response = await route.fetch();
        const json = await response.json();
        
        // Force the main availability and all variant states to false
        json.available = false;
        if (json.variants) {
            json.variants.forEach((variant: any) => variant.available = false);
        }
        
        await route.fulfill({ json });
    });
}

async verifyAddToCartButtonState(expectedText: string, shouldBeDisabled: boolean) {
    const button = this.page.getByRole('button', { name: new RegExp(expectedText, 'i') });
    await button.waitFor({ state: "visible" });
    
    if (shouldBeDisabled) {
        await expect(button).toBeDisabled();
        this.logger.success(`Verified that the button is disabled and displays: "${expectedText}"`);
    } else {
        await expect(button).toBeEnabled();
        this.logger.success(`Verified that the button is enabled and displays: "${expectedText}"`);
    }
}

async clickDisabledAddToCartButton(expectedText: string) {
    const button = this.page.getByRole('button', { name: new RegExp(expectedText, 'i') });
    // Bypasses normal Playwright actionability checks to force a click on a disabled button
    await button.click({ force: true });
    this.logger.info(`Forced a click action on the disabled "${expectedText}" button.`);
}
}
