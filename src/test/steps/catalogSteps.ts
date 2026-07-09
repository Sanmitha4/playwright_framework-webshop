import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { fixture } from "../../support/pageFixture";

// NOTE: "User navigates to the Sauce Demo home page" is already globally handled inside cartSteps.ts

When('User navigates to the {string} collection', async function (collectionName: string) {
    fixture.subStepLogger.info(`Navigating to collection: ${collectionName}`);
    await fixture.pages.sauceCatalogPage.navigateToAllProducts();
    fixture.subStepLogger.success(`Successfully navigated to ${collectionName} collection.`);
});

Then('The catalog page should display exactly {string} products', async function (expectedCountStr: string) {
    const expectedCount = Number(expectedCountStr);
    fixture.subStepLogger.info(`Counting products displayed on catalog page. Expecting exactly: ${expectedCount}`);
    
    // Call the page object calculation
    const actualCount = await fixture.pages.sauceCatalogPage.getProductCount();
    
    fixture.subStepLogger.info(`Found ${actualCount} items displayed in DOM.`);
    expect(actualCount).toBe(expectedCount);
    
    fixture.subStepLogger.success(`Catalog validation complete. Displayed items match exact count of ${expectedCount}.`);
});
When('User opens the product {string}', async function (productName: string) {
    fixture.subStepLogger.info(`Opening individual product page for: ${productName}`);
    await fixture.pages.sauceCatalogPage.openProductByName(productName);
    fixture.subStepLogger.success(`Product page loaded for: ${productName}`);
});

Then('The product page should display the product title {string}', async function (expectedTitle: string) {
    fixture.subStepLogger.info(`Verifying product page title matches: ${expectedTitle}`);
    await fixture.pages.sauceCatalogPage.verifyProductTitle(expectedTitle);
    fixture.subStepLogger.success(`Product title verified successfully.`);
});

Then('The product page should display a price', async function () {
    fixture.subStepLogger.info('Verifying that the product price is displayed.');
    await fixture.pages.sauceCatalogPage.verifyPriceIsDisplayed();
    fixture.subStepLogger.success('Product price visibility verified.');
});

Then('The product page should display an "Add to Cart" button', async function () {
    fixture.subStepLogger.info('Verifying that the "Add to Cart" button is visible.');
    await fixture.pages.sauceCatalogPage.verifyAddToCartButtonIsDisplayed();
    fixture.subStepLogger.success('"Add to Cart" button visibility verified.');
});