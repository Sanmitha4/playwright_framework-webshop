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
 When('User updates the quantity of {string} to {string} on the cart page', async function (productName: string, quantity: string) {
     const target = Number(quantity);
     fixture.subStepLogger.info(`Adjusting quantity of ${productName} to ${target}`);
     const current = await fixture.pages.sauceCartPage.getProductQuantityInCart(productName);
     const clicksNeeded = target - current;
     if (clicksNeeded > 0) {
         // This theme has no cart-page quantity field — the only way to
         // increase quantity is clicking "Add to Cart" again per unit.
         await fixture.pages.sauceHomePage.increaseQuantityBy(productName, clicksNeeded);
     } else {
         fixture.subStepLogger.info(`Cart already at quantity ${current}; no increase needed (decreasing isn't supported by this UI).`);
     }
    fixture.subStepLogger.success(`Quantity adjustment complete for ${productName}`);
 });


Then('The cart page should show quantity {string} for product {string}', async function (quantity: string, productName: string) {
    fixture.subStepLogger.info(`Verifying quantity of ${productName} is ${quantity}`);
    const isCorrect = await fixture.pages.sauceCartPage.verifyQuantityIs(productName, quantity);
    expect(isCorrect).toBe(true);
    fixture.subStepLogger.success(`Quantity verified for ${productName}`);
});

When('User submits the search form without entering a term', async function () {
    fixture.subStepLogger.info('Triggering blank input form submission execution handler.');
    await fixture.pages.sauceSearchPage.submitEmptySearch();
});

Then('The user should remain on the search page without a server error', async function () {
    fixture.subStepLogger.info('Evaluating page source definitions for platform stability.');
    await fixture.pages.sauceSearchPage.verifyPageIsStableWithoutServerError();
});