Feature: Product Catalog Browsing

  @Key:Catalog_01 @smoke @sauce
  Scenario: View all products in the catalog
    Given User navigates to the Sauce Demo home page
    When User navigates to the "All Products" collection
    Then The catalog page should display at least "1" product