import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { fixture } from "../../support/pageFixture";
import * as configuration from "../../helper/commonConfig/configuration.json";

setDefaultTimeout(configuration.defaultTimeOut);

Given('User navigates to the Sauce Demo home page', async function () {
    fixture.subStepLogger.info('Navigating to Sauce Demo home page.');
    await fixture.pages.sauceHomePage.navigateToHome();
    fixture.subStepLogger.success('Sauce Demo home page loaded.');
});

When('User adds product {string} to the cart', async function (productName: string) {
    fixture.subStepLogger.info(`Adding product to cart: ${productName}`);
    await fixture.pages.sauceHomePage.addProductToCartByName(productName);
    fixture.subStepLogger.success(`Product added to cart: ${productName}`);
});

Then('The cart count should be {string}', async function (expectedCount: string) {
    fixture.subStepLogger.info(`Verifying cart count is: ${expectedCount}`);
    const isCorrect = await fixture.pages.sauceHomePage.verifyCartCountIs(expectedCount);
    expect(isCorrect).toBe(true);
    fixture.subStepLogger.success(`Cart count verified: ${expectedCount}`);
});

Then('The cart page should contain product {string}', async function (productName: string) {
    fixture.subStepLogger.info(`Verifying product is present in cart: ${productName}`);
    await fixture.pages.sauceCartPage.navigateToCart();
    const found = await fixture.pages.sauceCartPage.verifyProductInCart(productName);
    expect(found).toBe(true);
    fixture.subStepLogger.success(`Product verified in cart: ${productName}`);
});
