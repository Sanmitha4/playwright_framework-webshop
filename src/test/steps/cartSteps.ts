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

When('User double-clicks the {string} button rapidly for {string}', async function (buttonName: string, productName: string) {
    fixture.subStepLogger.info(`Attempting rapid double-click abuse on the ${buttonName} button.`);
    
    // Call our newly created rapid click function
    await fixture.pages.sauceHomePage.doubleClickAddToCartFor(productName);
    
    fixture.subStepLogger.success(`Rapid click execution completed for ${productName}`);
});

Given('User navigates to a product page where the item is sold out', async function () {
    fixture.subStepLogger.info('Setting up intercept and navigating to the Grey Jacket page.');
    
    // 1. Activate network manipulation for the specific product URL handle
    await fixture.pages.sauceHomePage.mockProductAsSoldOut('grey-jacket');
    
    // 2. Open the product page (this triggers the intercepted backend endpoint)
    await fixture.pages.sauceHomePage.navigateToHome();
    await fixture.pages.sauceHomePage.openProduct('Grey jacket');
    
    fixture.subStepLogger.success('Navigated to product page with simulated Sold Out environment.');
});

Then('The cart button text should change to {string}', async function (expectedText: string) {
    fixture.subStepLogger.info(`Verifying button text shows: ${expectedText}`);
    await fixture.pages.sauceHomePage.verifyAddToCartButtonState(expectedText, false);
});

Then('The {string} button should be disabled', async function (buttonText: string) {
    fixture.subStepLogger.info(`Verifying that the "${buttonText}" button is completely disabled.`);
    await fixture.pages.sauceHomePage.verifyAddToCartButtonState(buttonText, true);
    fixture.subStepLogger.success(`Button state successfully verified as disabled.`);
});

When('User attempts to click the {string} button', async function (buttonText: string) {
    fixture.subStepLogger.info(`Attempting to interact with the disabled "${buttonText}" button.`);
    await fixture.pages.sauceHomePage.clickDisabledAddToCartButton(buttonText);
});

Then('The cart count should remain unchanged', async function () {
    fixture.subStepLogger.info('Validating that the cart status did not alter.');
    // Verifies the cart count text still says "0" (or matches your baseline)
    const isCorrect = await fixture.pages.sauceHomePage.verifyCartCountIs("0"); 
    expect(isCorrect).toBe(true);
    fixture.subStepLogger.success('Cart count remained unchanged.');
});