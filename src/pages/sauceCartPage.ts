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
    async updateQuantity(productName: string, quantity: string) {
    // Fetch cart directly using Playwright's API context
    const cartRes = await this.page.request.get('https://sauce-demo.myshopify.com/cart.js');
    const cart = await cartRes.json();
    
    const item = cart.items.find((i: any) =>
        (i.product_title || i.title || '').toLowerCase().includes(productName.toLowerCase())
    );

    if (!item) {
        throw new Error(`Product not found in cart: ${productName}`);
    }

    // Post update request directly from Node
    await this.page.request.post('https://sauce-demo.myshopify.com/cart/change.js', {
        data: { id: item.key, quantity: Number(quantity) }
    });

    await this.page.reload();
}


    async verifyQuantityIs(productName: string, expectedQuantity: string): Promise<boolean> {
        try {
            const cart = await this.page.evaluate(async () => {
                // @ts-ignore - fetch runs inside the browser page context, not Node
                const res = await fetch('/cart.js', { headers: { 'Accept': 'application/json' } });
                return res.json();
            });

            const item = cart.items.find((i: any) =>
                (i.product_title || i.title || '').toLowerCase().includes(productName.toLowerCase())
            );

            if (!item) {
                this.logger.failure(`Product not found in cart: ${productName}`);
                return false;
            }

            const matches = item.quantity === Number(expectedQuantity);
            matches
                ? this.logger.success(`Quantity for ${productName} verified as ${expectedQuantity}`)
                : this.logger.failure(`Expected quantity ${expectedQuantity} but found ${item.quantity} for ${productName}`);
            return matches;
        } catch (e) {
            this.logger.failure(`Error verifying quantity via /cart.js: ${e}`);
            return false;
        }
    }
    async getProductQuantityInCart(productName: string): Promise<number> {
        const cart = await this.page.evaluate(async () => {
            // @ts-ignore - fetch runs inside the browser page context, not Node
            const res = await fetch('/cart.js', { headers: { 'Accept': 'application/json' } });
            return res.json();
        });
        console.log(`[DEBUG] /cart.js items:`, JSON.stringify(
           cart.items.map((i: any) => ({ title: i.product_title || i.title, quantity: i.quantity, key: i.key }))
       ));
        const item = cart.items.find((i: any) =>
            (i.product_title || i.title || '').toLowerCase().includes(productName.toLowerCase())
        );
        return item ? item.quantity : 0;
    }
}
