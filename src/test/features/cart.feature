Feature: Shopping Cart

 @smoke @sauce
  Scenario: Add a product to the cart successfully

    Given User navigates to the Sauce Demo home page
    When User adds product "Grey jacket" to the cart
    Then The cart count should be "1"
    And The cart page should contain product "Grey jacket"
