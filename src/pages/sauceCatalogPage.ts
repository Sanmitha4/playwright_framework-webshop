import { Page } from "@playwright/test";
import PlaywrightWrapper from "../helper/wrapper/PlaywrightWrappers";
import { HTMLSubStepLogger } from "../support/htmllSubStepLogger";

export default class SauceCatalogPage {
    private base: PlaywrightWrapper;

    constructor(private page: Page, private logger: HTMLSubStepLogger) {
        this.base = new PlaywrightWrapper(page, logger);
    }

    private Elements = {
        allProductsLink: 'a[href="/collections/all"]',
        productCardLink: 'a[href^="/products/"]:visible',
    }

    async navigateToAllProducts() {
        await this.base.waitAndClick(this.Elements.allProductsLink, "All Products link");
        this.logger.info("Navigated to All Products collection");
    }

    async getProductCount(): Promise<number> {
        const links = this.page.locator(this.Elements.productCardLink);
        const count = await links.count();
        this.logger.info(`Found ${count} visible product link(s) on the catalog page`);
        return count;
    }
}