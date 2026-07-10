
Feature: User Login Authentication

@Key:Login_01 @regression @sauce @negative
  Scenario: Login fails with invalid credentials
    Given User navigates to the Sauce Demo login page
    When User attempts to login with credentials from test data
    Then An error message should be displayed on the login page
    And User should remain on the login page

@Key:Login_02 @regression @sauce @negative
  Scenario: Login fails with a malformed email address
    Given User navigates to the Sauce Demo login page
    When User attempts to login with email "not-an-email" and password "SomePassword1"
    Then An error message should be displayed on the login page

@Key:Login_03 @regression @sauce @negative 
  Scenario:Login fails with empty credentials
    Given User navigates to the Sauce Demo login page
    When User attempts to login with credentials from test data
    Then An error message should be displayed on the login page


@Key:Login_04  @sanity @sauce
  Scenario:Navigate to the "Create Account" page with login
    Given User navigates to the Sauce Demo login page
    When User clicks on the "Create Account" link
    Then The account registration page should be displayed





