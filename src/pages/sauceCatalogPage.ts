import { Page } from "@playwright/test";

export default class SauceCatalogPage {
    private page: Page;
    private logger: any;

    private Elements = {
        // Selector matching navigation link to the catalog
        allProductsMenuLink: 'a[href="/collections/all"]',
        // Shopify themes render product links under a unique relative path structural loop
        productItems: 'a[href^="/collections/all/products/"], a[href^="/products/"]'
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
}