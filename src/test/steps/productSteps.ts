import { Given, When, Then } from "@cucumber/cucumber";
import { fixture } from "../../support/pageFixture";

// 1. Navigation Step to open specific collections
When('User navigates to the {string} collection', async function (collectionName: string) {
    fixture.subStepLogger.info(`Navigating catalog layout to collection panel: "${collectionName}"`);
    // Assuming you have a collection navigation method in your page object
    await fixture.pages.sauceProductPage.navigateToCollection(collectionName);
});

// 2. Action Step to open a specific product item card
When('User opens the product {string}', async function (productName: string) {
    fixture.subStepLogger.info(`Locating and entering product catalog page for: "${productName}"`);
    await fixture.pages.sauceProductPage.selectProductByName(productName);
});

// 3. Assertion Step for successful loading of details
Then('The product detail page should load successfully', async function () {
    fixture.subStepLogger.info('Verifying individual product layout load state.');
    await fixture.pages.sauceProductPage.verifyProductDetailsLoaded();
});

// 4. Assertion Step for pricing and currency configurations
Then('The price should be displayed with the correct currency symbol', async function () {
    fixture.subStepLogger.info('Analyzing catalog pricing tags for currency formatting.');
    await fixture.pages.sauceProductPage.verifyPriceFormat();
});

// 5. Assertion Step for sold out messaging validation
Then('The product page should indicate the product is sold out', async function () {
    fixture.subStepLogger.info('Scanning screen for out-of-stock badge elements.');
    await fixture.pages.sauceProductPage.verifyProductIsSoldOut();
});

// 6. Assertion Step to confirm the buying element is blocked
Then('The Add to Cart button should be disabled or unavailable', async function () {
    fixture.subStepLogger.info('Evaluating operational interaction boundaries for purchase button.');
    await fixture.pages.sauceProductPage.verifyAddToCartIsDisabled();
});