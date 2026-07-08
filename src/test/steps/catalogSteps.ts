import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { fixture } from "../../support/pageFixture";
import * as configuration from "../../helper/commonConfig/configuration.json";

setDefaultTimeout(configuration.defaultTimeOut);

When('User navigates to the {string} collection', async function (collectionName: string) {
    fixture.subStepLogger.info(`Navigating to collection: ${collectionName}`);
    if (collectionName.toLowerCase() === "all products") {
        await fixture.pages.sauceCatalogPage.navigateToAllProducts();
    } else {
        throw new Error(`Unsupported collection: ${collectionName}`);
    }
    fixture.subStepLogger.success(`Collection navigation complete: ${collectionName}`);
});

Then('The catalog page should display at least {string} product', async function (minCount: string) {
    fixture.subStepLogger.info(`Verifying catalog displays at least ${minCount} product(s)`);
    const count = await fixture.pages.sauceCatalogPage.getProductCount();
    expect(count).toBeGreaterThanOrEqual(Number(minCount));
    fixture.subStepLogger.success(`Catalog displays ${count} product(s)`);
});