@Key:Catalog_01 @smoke @sauce
Feature: Product Catalog Validation

  Scenario: View all products in the catalog
    Given User navigates to the Sauce Demo home page
    When User navigates to the "All Products" collection
    Then The catalog page should display exactly "7" products

@Key:Catalog_02 @regression @sauce
  Scenario: View individual product details
    Given User navigates to the Sauce Demo home page
    When User opens the product "Grey jacket"
    Then The product page should display the product title "Grey jacket"
    And The product page should display a price
    And The product page should display an "Add to Cart" button