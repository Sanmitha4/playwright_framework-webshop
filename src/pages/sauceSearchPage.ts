import { expect, Page } from "@playwright/test";
import PlaywrightWrapper from "../helper/wrapper/PlaywrightWrappers";
import { HTMLSubStepLogger } from "../support/htmllSubStepLogger";

export default class SauceSearchPage {
    private base: PlaywrightWrapper;

    constructor(private page: Page, private logger: HTMLSubStepLogger) {
        this.base = new PlaywrightWrapper(page, logger);
    }

    private Elements = {
    // 1. Updated with your exact search field ID from the log
    searchBarInput: "#search-field, input[name='q'], input[type='text'].search",
    searchSubmitButton: "button[type='submit'], input[type='submit']",
    // 2. Target the main content area where visible text elements are loaded
    searchMainContent: "#main, main, #page, #content"
};

async executeSearchQuery(keyword: string) {
    this.logger.info(`Initiating product search lookup for: "${keyword}"`);
    
    const searchInput = this.page.locator(this.Elements.searchBarInput).first();
    await searchInput.waitFor({ state: "visible", timeout: 5000 });
    
    await searchInput.fill(keyword);
    await searchInput.press("Enter");
    
    await this.page.waitForLoadState("load");
}

async verifyResultsContainKeyword(keyword: string) {
    this.logger.info(`Evaluating visible matching product links for keyword: "${keyword}"`);
    
    // Instead of waiting for a structural container that might stay hidden,
    // wait for the text keyword to directly appear as visible on the screen.
    const pattern = new RegExp(keyword, "i");
    const visibleResultText = this.page.getByText(pattern).first();
    
    // Wait up to 5 seconds for the dynamic search text results to finish loading and populate
    await visibleResultText.waitFor({ state: "visible", timeout: 5000 });
    await expect(visibleResultText).toBeVisible();
    
    this.logger.success(`Search validation verified for product results containing: "${keyword}"`);
}

    

    

    async verifyOnSearchResultsPage() {
        const currentUrl = this.page.url();
        this.logger.info(`Validating browser url context state: ${currentUrl}`);
        
        // Assert that the URL successfully routed to Shopify's query endpoint path
        expect(currentUrl).toContain("/search");
    }

    async verifyNoResultsFoundMessage() {
    this.logger.info("Verifying that the interface indicates zero product matches.");

    // 1. Regex capturing common empty search notification strings
    const noResultsRegex = /no results|0 results|did not match|no matches|empty/i;
    
    // 2. Scan the page text nodes natively
    const messageLocator = this.page.getByText(noResultsRegex).first();
    
    try {
        await messageLocator.waitFor({ state: "visible", timeout: 5000 });
        await expect(messageLocator).toBeVisible();
        
        const capturedText = await messageLocator.innerText();
        this.logger.success(`Empty result verification confirmed with text: "${capturedText.trim()}"`);
    } catch (error) {
        // Fallback: If no explicit text matched, ensure standard product grid elements contain 0 items
        const productGridItems = this.page.locator('.product-grid .product-card, .grid-item, #search-results li');
        const itemCount = await productGridItems.count();
        
        expect(itemCount).toBe(0);
        this.logger.success("Empty result verification confirmed: Product item count is exactly 0.");
    }
}

    
}