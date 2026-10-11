# Test plan

## Objective

Verify that a fictional user can find products, manage a cart, apply a valid discount and submit a demo order, while the API rejects invalid quantities and calculates authoritative totals.

## UI cases

| ID | Scenario | Expected result |
| --- | --- | --- |
| UI-01 | Catalog and sold-out product | Four products; keyboard purchase disabled |
| UI-02 | Case-insensitive search | HEADPHONES returns Studio Headphones |
| UI-03 | No matches then clear | Empty result message; four products restored |
| UI-04 | Electronics category | Headphones and keyboard only |
| UI-05 | Notebook and bottle | Two units; total INR 1,050 |
| UI-06 | Quantity and removal | Totals update; last removal empties cart |
| UI-07 | Sixth notebook attempted | Five units maximum; clear limit message |
| UI-08 | Valid and invalid coupon | QA10 reduces bottle to INR 720; invalid code removes discount |
| UI-09 | Reload | Cart contents retained |
| UI-10 | Invalid email | API validation message; cart retained |
| UI-11 | Valid discounted checkout | 201 response; confirmed order; empty cart |
| UI-12 | Empty-cart checkout | Explicit validation error |
| UI-13 | Network failure | Error message; cart retained; retry button enabled |
| UI-14 | Desktop/mobile width | No horizontal page overflow |

## API cases

Catalog contract; client price tampering; empty cart; unknown product; zero, negative, fractional and over-stock quantities; sold-out item; duplicate IDs; invalid coupon; malformed JSON; exact quote values; invalid email; missing route. There are 15 executable API cases, including the data-driven quantity cases.

## Test data

Prices are integer paise: notebook 25,000; bottle 80,000; headphones 150,000; keyboard 220,000. Available products have five units; keyboard has zero. Coupon QA10 applies a 10% discount. Contacts use `Demo Tester` and `qa@example.test`.

## Execution and exit criteria

Run 8 unit checks, 15 API cases and 14 UI scenarios across each configured browser target. Exit requires zero failures, reports reviewed and no unexpected browser skips. A pass in one browser is not a cross-browser pass. Use traces to diagnose failures before changing assertions.

## Out of scope

Real payments, user accounts, SQL/database validation, accessibility conformance, load testing, penetration testing, production deployment, Selenium and mobile-native apps. The viewport overflow check is not a full accessibility or responsive design audit.
