@regression @sauce
Feature: Product Catalog and Stock Management

  @Key:Product_01 @smoke
  Scenario: View individual product details successfully
    Given User navigates to the Sauce Demo home page
    When User navigates to the "All Products" collection
    And User opens the product "Brown Shades"
    Then The product detail page should load successfully
    And The price should be displayed with the correct currency symbol

  @Key:Product_04 @negative
  Scenario Outline: Sold out products do not allow adding to cart
    Given User navigates to the Sauce Demo home page
    When User navigates to the "All Products" collection
    And User opens the product "<productName>"
    Then The product page should indicate the product is sold out
    And The Add to Cart button should be disabled or unavailable

    Examples:
      | productName   |
      | Brown Shades  |
      | White sandals |