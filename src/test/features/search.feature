@Key:Search_01 @smoke @sauce
Feature: Product Search

  Scenario: Search for an existing product
    Given User navigates to the Sauce Demo home page
    When User searches for product "jacket"
    Then The search results page should be displayed
    And The search results should include a product containing "jacket"

    @Key:Search_02 @regression @sauce @negative
  Scenario: Search for a product that does not exist
    Given User navigates to the Sauce Demo home page
    When User searches for product "xyznonexistentproduct123"
    Then The search results page should display no results found


@Key:Search_03 @regression @sauce @negative
  Scenario: Search with an empty query
    Given User navigates to the Sauce Demo home page
    When User submits the search form without entering a term
    Then The user should remain on the search page without a server error