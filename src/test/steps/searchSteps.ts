import { When, Then } from "@cucumber/cucumber";
import { fixture } from "../../support/pageFixture";

When('User searches for product {string}', async function (productName: string) {
    fixture.subStepLogger.info(`Injecting search execution parameters.`);
    await fixture.pages.sauceSearchPage.executeSearchQuery(productName);
});

Then('The search results page should be displayed', async function () {
    fixture.subStepLogger.info('Verifying URL query parameter transition states.');
    await fixture.pages.sauceSearchPage.verifyOnSearchResultsPage();
});

Then('The search results should include a product containing {string}', async function (productName: string) {
    fixture.subStepLogger.info('Scanning display cards for expected product criteria.');
    await fixture.pages.sauceSearchPage.verifyResultsContainKeyword(productName);
});

Then('The search results page should display no results found', async function () {
    fixture.subStepLogger.info('Scanning search response layout for empty dataset warnings.');
    await fixture.pages.sauceSearchPage.verifyNoResultsFoundMessage();
});