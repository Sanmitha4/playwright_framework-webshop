@Key:Search_01 @smoke @sauce
Feature: Product Search

  Scenario: Search for an existing product
    Given User navigates to the Sauce Demo home page
    When User searches for product "jacket"
    Then The search results page should be displayed
    And The search results should include a product containing "jacket"