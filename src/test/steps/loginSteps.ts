import { Given, When, Then } from "@cucumber/cucumber";
import { fixture } from "../../support/pageFixture";

Given('User navigates to the Sauce Demo login page', async function () {
    fixture.subStepLogger.info('Initializing customer login navigation path.');
    await fixture.pages.sauceLoginPage.navigateToLoginPage();
    fixture.subStepLogger.success('Customer login page initialized.');
});
When('User attempts to login with credentials from test data', async function () {
    // 1. Extract the active row that hooks.ts read from the CSV file
    const dataRow = this.csvData || fixture.testData; 
    
    const email = dataRow.Username;
    const password = dataRow.Password;

    fixture.subStepLogger.info(`Submitting CSV-stored credentials for user: ${email}`);
    
    // 2. Pass them cleanly into your page object method
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