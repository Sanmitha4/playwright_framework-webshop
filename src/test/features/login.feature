@Key:Login_01 @regression @sauce @negative
Feature: User Login Authentication

  Scenario: Login fails with invalid credentials
    Given User navigates to the Sauce Demo login page
    When User attempts to login with email "invalid_user@test.com" and password "WrongPass123"
    Then An error message should be displayed on the login page
    And User should remain on the login page