Feature: Shopping Cart

@smoke @sauce
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


@regression @negative @sauce
Scenario: Double-clicking the Add to Cart button rapidly
  Given User navigates to the Sauce Demo home page
  When User double-clicks the "ADD TO CART" button rapidly for "Grey jacket"
  Then The cart count should be "1"


@Key:Sauce_08 @regression @negative @sauce

Scenario: Prevent user from adding a sold-out product to the cart
  Given User navigates to a product page where the item is sold out
  Then The cart button text should change to "SOLD OUT"
  And The "SOLD OUT" button should be disabled
  When User attempts to click the "SOLD OUT" button
  Then The cart count should remain unchanged
