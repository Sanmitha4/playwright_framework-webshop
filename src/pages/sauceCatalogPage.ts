import { Page,expect } from "@playwright/test";

export default class SauceCatalogPage {
    private page: Page;
    private logger: any;

    private Elements = {
        // Selector matching navigation link to the catalog
        allProductsMenuLink: 'a[href="/collections/all"]',
        // Shopify themes render product links under a unique relative path structural loop
        productItems: 'a[href^="/collections/all/products/"], a[href^="/products/"]',
        productTitleHeader: '.product-single__title, h1.product-single__title, .product__title, h1:not(#logo)', 
    productPrice: 'span.price, div.price, .product-single__price', 
    addToCartButton: 'button[type="submit"][name="add"], #AddToCart'

    };

    constructor(page: Page, logger: any) {
        this.page = page;
        this.logger = logger;
    }

    async navigateToAllProducts() {
    const link = this.page.locator(this.Elements.allProductsMenuLink).first();
    if (await link.isVisible()) {
        await link.click();
    } else {
        await this.page.goto('https://sauce-demo.myshopify.com/collections/all');
    }
    
    // Change "networkidle" to "load" to prevent background analytics from locking up your test
    await this.page.waitForLoadState("load");
}

  

   async getProductCount(): Promise<number> {
    // 1. Wait briefly for layout elements to settle
    await this.page.waitForTimeout(1000);
    
    // 2. Locate the product grid items
    const productBlocks = this.page.locator('li.grid__item, div.grid__item, .product-item, .grid-view-item');
    let count = await productBlocks.count();

    // 3. Fallback strategy using an implicit object typing context
    if (count === 0) {
        const fallbackUrls = this.page.locator('a[href*="/products/"]');
        const urls = await fallbackUrls.evaluateAll(links => 
            Array.from(new Set(links.map(a => (a as any).href)))
        );
        count = urls.length;
    }

    this.logger.info(`Product catalog counting operation executed. Total items identified: ${count}`);
    return count;
}
async openProductByName(productName: string) {
    // Locate the link by its visible product text name and click it
    const productLink = this.page.locator(`a:has-text("${productName}")`).first();
    await productLink.waitFor({ state: 'visible', timeout: 5000 });
    await productLink.click();
    await this.page.waitForLoadState("load");
}




async verifyProductTitle(expectedTitle: string) {
    // Target the specific selector matching the product template context
    const titleLocator = this.page.locator(this.Elements.productTitleHeader).first();
    await titleLocator.waitFor({ state: "visible", timeout: 5000 });
    
    // Validate text contents match the regex pattern safely
    await expect(titleLocator).toHaveText(new RegExp(expectedTitle, 'i'));
}
async verifyPriceIsDisplayed() {
    // 1. Try finding by matching price structural classes or text containing a currency symbol
    const priceLocator = this.page.locator('.price, .product-single__price, .product__price').first();
    
    if (await priceLocator.isVisible()) {
        await expect(priceLocator).toBeVisible();
    } else {
        // 2. Fallback: Search the visible DOM for text matching a currency symbol ($ or £) followed by digits
        const currencyPriceLocator = this.page.getByText(/[\$£\u20AC]\d+/).first();
        await currencyPriceLocator.waitFor({ state: "visible", timeout: 5000 });
        await expect(currencyPriceLocator).toBeVisible();
    }
}
async verifyAddToCartButtonIsDisplayed() {
    const btnLocator = this.page.getByRole('button', { name: /add to cart/i }).first();
    await expect(btnLocator).toBeVisible();
}

}