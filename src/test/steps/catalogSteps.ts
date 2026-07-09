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