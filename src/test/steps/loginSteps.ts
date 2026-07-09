import { Given, When, Then } from "@cucumber/cucumber";
import { fixture } from "../../support/pageFixture";

Given('User navigates to the Sauce Demo login page', async function () {
    fixture.subStepLogger.info('Initializing customer login navigation path.');
    await fixture.pages.sauceLoginPage.navigateToLoginPage();
    fixture.subStepLogger.success('Customer login page initialized.');
});

When('User attempts to login with email {string} and password {string}', async function (email: string, password: string) {
    fixture.subStepLogger.info('Submitting provided credentials to authentication context.');
    await fixture.pages.sauceLoginPage.loginWithCredentials(email, password);
});

Then('An error message should be displayed on the login page', async function () {
    fixture.subStepLogger.info('Scanning browser layout elements for validation failure summaries.');
    await fixture.pages.sauceLoginPage.verifyErrorMessageIsDisplayed();
});

Then('User should remain on the login page', async function () {
    fixture.subStepLogger.info('Verifying session was rejected and navigation boundaries held.');
    await fixture.pages.sauceLoginPage.verifyUserStillOnLoginPage();
    fixture.subStepLogger.success('Negative authentication verification complete.');
});