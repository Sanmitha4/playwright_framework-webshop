import { Page } from "@playwright/test";
import PlaywrightWrapper from "../helper/wrapper/PlaywrightWrappers";
import { HTMLSubStepLogger } from "../support/htmllSubStepLogger";

export default class SauceCartPage {
    private base: PlaywrightWrapper;

    constructor(private page: Page, private logger: HTMLSubStepLogger) {
        this.base = new PlaywrightWrapper(page, logger);
    }

    private Elements = {
        cartUrl: "https://sauce-demo.myshopify.com/cart",
        emptyCartText: "Your cart is empty.",
    }

    async navigateToCart() {
        await this.base.goto(this.Elements.cartUrl);
        this.logger.info("Navigated to cart page");
    }

    async verifyProductInCart(productName: string): Promise<boolean> {
        try {
            const emptyText = this.page.getByText(this.Elements.emptyCartText);
            const isEmpty = await emptyText.isVisible().catch(() => false);
            if (isEmpty) {
                this.logger.failure("Cart is empty, expected a product to be present");
                return false;
            }

            const productInCart = this.page.locator("body", { hasText: productName });
            const found = (await productInCart.count()) > 0;
            if (found) {
                this.logger.success(`Product found in cart: ${productName}`);
            } else {
                this.logger.failure(`Product NOT found in cart: ${productName}`);
            }
            return found;
        } catch (e) {
            this.logger.failure(`Error verifying product in cart: ${productName}`);
            return false;
        }
    }
}
