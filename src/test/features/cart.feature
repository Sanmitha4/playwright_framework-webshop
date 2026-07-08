Feature: Shopping Cart

@Key:Sauce_01 @smoke @sauce

  Scenario: Add a product to the cart successfully

    Given User navigates to the Sauce Demo home page
    When User adds product "Grey jacket" to the cart
    Then The cart count should be "1"
    And The cart page should contain product "Grey jacket"

@regression @sauce
  Scenario: Add multiple different products to the cart
    Given User navigates to the Sauce Demo home page
    When User adds product "Grey jacket" to the cart
    And User navigates to the Sauce Demo home page
    And User adds product "Noir jacket" to the cart
    Then The cart count should be "2"
    And The cart page should contain product "Grey jacket"
    And The cart page should contain product "Noir jacket"


 @regression @sauce
  Scenario: Update product quantity in the cart
    Given User navigates to the Sauce Demo home page
    When User adds product "Grey jacket" to the cart
    And User updates the quantity of "Grey jacket" to "3" on the cart page
    Then The cart page should show quantity "3" for product "Grey jacket"




