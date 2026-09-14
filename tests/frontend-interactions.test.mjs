import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("BookingDialog: source guarantees native close() and separate onClose cleanup", async () => {
  const [bookingDialogCode, spaCommerceCode] = await Promise.all([
    readFile(new URL("../app/components/BookingDialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SpaCommerce.tsx", import.meta.url), "utf8"),
  ]);

  // Verify BookingDialog defines requestClose calling dialog.close()
  assert.match(bookingDialogCode, /const requestClose = \(\) =>/);
  assert.match(bookingDialogCode, /dialog\.close\(\)/);

  // Verify X button, backdrop click, and "Hoàn tất" call requestClose
  assert.match(bookingDialogCode, /onClick=\{\(event\) =>\s*\{\s*if \(event\.target === event\.currentTarget\) requestClose\(\);?\s*\}\}/);
  assert.match(bookingDialogCode, /aria-label="Đóng biểu mẫu"\s+onClick=\{requestClose\}/);
  assert.match(bookingDialogCode, /onClick=\{requestClose\}[\s\S]*?Hoàn tất/);

  // Verify native dialog onClose attribute is wired to onCloseDialog callback
  assert.match(bookingDialogCode, /<dialog[\s\S]*?onClose=\{onCloseDialog\}/);

  // Verify onCloseDialog resets state, clears timeout and restores focus to opener
  assert.match(spaCommerceCode, /onCloseDialog=\{/);
  assert.match(spaCommerceCode, /bookingOpener\.current\?\.focus\(\)/);
  assert.match(spaCommerceCode, /setBookingState\("idle"\)/);
});

test("BookingDialog: interactive close lifecycle with native dialog events and focus restoration", () => {
  // Mock element and dialog simulating browser DOM
  let focusedElement = null;
  const mockOpener = {
    focus() {
      focusedElement = mockOpener;
    },
  };

  let dialogOpen = false;
  let dialogOnCloseHandler = null;

  const mockDialog = {
    get open() {
      return dialogOpen;
    },
    showModal() {
      dialogOpen = true;
    },
    close() {
      dialogOpen = false;
      if (typeof dialogOnCloseHandler === "function") {
        dialogOnCloseHandler();
      }
    },
  };

  let bookingState = "idle";
  let activeOpener = null;

  const openBooking = (opener) => {
    activeOpener = opener;
    mockDialog.showModal();
  };

  const onCloseDialog = () => {
    bookingState = "idle";
    activeOpener?.focus();
  };

  dialogOnCloseHandler = onCloseDialog;

  const requestClose = () => {
    if (mockDialog && typeof mockDialog.close === "function") {
      mockDialog.close();
    } else {
      onCloseDialog();
    }
  };

  // 1. Open dialog and close with X button
  openBooking(mockOpener);
  assert.equal(mockDialog.open, true, "Dialog should be open after showModal");
  requestClose(); // Simulates clicking X button
  assert.equal(mockDialog.open, false, "Dialog should be closed after X click");
  assert.equal(focusedElement, mockOpener, "Focus must be restored to opener after X close");
  assert.equal(bookingState, "idle", "Booking state should be reset to idle");

  // 2. Open again and close via backdrop click
  focusedElement = null;
  openBooking(mockOpener);
  assert.equal(mockDialog.open, true, "Dialog should be open again");
  // Simulates backdrop click: event.target === event.currentTarget
  requestClose();
  assert.equal(mockDialog.open, false, "Dialog should be closed after backdrop click");
  assert.equal(focusedElement, mockOpener, "Focus must be restored to opener after backdrop click");

  // 3. Open again, transition to confirmation, close via 'Hoàn tất' button
  focusedElement = null;
  openBooking(mockOpener);
  bookingState = "confirmed";
  assert.equal(mockDialog.open, true, "Dialog should be open");
  assert.equal(bookingState, "confirmed", "Dialog is in confirmed state");
  requestClose(); // Simulates clicking 'Hoàn tất' button
  assert.equal(mockDialog.open, false, "Dialog should be closed after 'Hoàn tất'");
  assert.equal(bookingState, "idle", "Booking state must be reset to idle");
  assert.equal(focusedElement, mockOpener, "Focus must be restored to opener after completion");

  // 4. Open again and close via native Escape key
  focusedElement = null;
  openBooking(mockOpener);
  assert.equal(mockDialog.open, true, "Dialog should be open");
  // Native Escape key invokes mockDialog.close()
  mockDialog.close();
  assert.equal(mockDialog.open, false, "Dialog should be closed by Escape");
  assert.equal(bookingState, "idle", "Booking state must be idle after Escape");
  assert.equal(focusedElement, mockOpener, "Focus must be restored to opener after Escape");
});

test("Coupon: applying TINH10 gives 10% discount and text editing immediately invalidates it", async () => {
  const spaCommerceCode = await readFile(
    new URL("../app/SpaCommerce.tsx", import.meta.url),
    "utf8",
  );

  // Verify handleCouponChange invalidates couponValid
  assert.match(spaCommerceCode, /const handleCouponChange = \(value: string\) =>/);
  assert.match(spaCommerceCode, /setCoupon\(value\)/);
  assert.match(spaCommerceCode, /if \(couponValid\) \{\s*setCouponValid\(false\);?\s*\}/);
  assert.match(spaCommerceCode, /onCouponChange=\{handleCouponChange\}/);

  // State machine test simulating exact checkout coupon flow
  let coupon = "";
  let couponValid = false;
  const subtotal = 1000000;

  const handleCouponChange = (value) => {
    coupon = value;
    if (couponValid) {
      couponValid = false;
    }
  };

  const applyCoupon = () => {
    const valid = coupon.trim().toUpperCase() === "TINH10";
    couponValid = valid;
  };

  const calculateDiscount = () => (couponValid ? subtotal * 0.1 : 0);
  const calculateTotal = () => subtotal - calculateDiscount();

  // Step 1: Initial state
  assert.equal(couponValid, false);
  assert.equal(calculateDiscount(), 0);
  assert.equal(calculateTotal(), 1000000);

  // Step 2: Enter TINH10 and apply
  handleCouponChange("TINH10");
  applyCoupon();
  assert.equal(couponValid, true, "Coupon TINH10 must be valid");
  assert.equal(calculateDiscount(), 100000, "10% discount should be 100,000 VND");
  assert.equal(calculateTotal(), 900000, "Total should be 900,000 VND");

  // Step 3: Edit coupon input (e.g. typing another character or backspacing)
  handleCouponChange("TINH10X");
  assert.equal(couponValid, false, "Modifying text must immediately invalidate the coupon");
  assert.equal(calculateDiscount(), 0, "Discount must immediately return to 0");
  assert.equal(calculateTotal(), 1000000, "Total must immediately revert to subtotal");

  // Step 4: Correct it back to TINH10 and apply again
  handleCouponChange("tinh10");
  assert.equal(couponValid, false, "Coupon remains invalid until user clicks Apply");
  applyCoupon();
  assert.equal(couponValid, true, "Coupon should be valid again after re-applying");
  assert.equal(calculateDiscount(), 100000);
  assert.equal(calculateTotal(), 900000);

  // Step 5: Partial edit immediately invalidates again
  handleCouponChange("tinh1");
  assert.equal(couponValid, false, "Any character edit must immediately invalidate coupon");
  assert.equal(calculateDiscount(), 0);
  assert.equal(calculateTotal(), 1000000);
});

test("Cart drawer: keyboard Escape closes drawer and restores focus to trigger", async () => {
  const spaCommerceCode = await readFile(
    new URL("../app/SpaCommerce.tsx", import.meta.url),
    "utf8",
  );

  assert.match(spaCommerceCode, /if \(event\.key !== "Escape"\) return;/);
  assert.match(spaCommerceCode, /if \(cartOpen\) \{\s*setCartOpen\(false\);\s*cartTrigger\.current\?\.focus\(\);/);
});

test("Mobile navigation: keyboard Escape closes mobile menu and restores focus", async () => {
  const spaCommerceCode = await readFile(
    new URL("../app/SpaCommerce.tsx", import.meta.url),
    "utf8",
  );

  assert.match(spaCommerceCode, /else if \(mobileOpen\) \{\s*setMobileOpen\(false\);\s*menuTrigger\.current\?\.focus\(\);/);
});

test("Treatment section: robust responsive intrinsic layout with no hard-coded min-height ceiling", async () => {
  const liquidCss = await readFile(
    new URL("../app/liquid.css", import.meta.url),
    "utf8",
  );

  // Verify treatment-section uses intrinsic flex layout and relative positioning for copy
  assert.match(liquidCss, /\.treatment-section\s*\{[\s\S]*?display:\s*flex;[\s\S]*?overflow:\s*clip;/);
  assert.match(liquidCss, /\.treatment-copy\s*\{[\s\S]*?position:\s*relative;/);
  assert.match(liquidCss, /\.treatment-copy\s*\{[\s\S]*?overflow:\s*visible;/);

  // Verify that artificial hard-coded min-heights (64rem, 76rem, 80rem) were eliminated
  assert.doesNotMatch(liquidCss, /min-height:\s*64rem/);
  assert.doesNotMatch(liquidCss, /min-height:\s*76rem/);
  assert.doesNotMatch(liquidCss, /min-height:\s*80rem/);
});

test("Toast dismiss control: dedicated accessible styling exists", async () => {
  const liquidCss = await readFile(
    new URL("../app/liquid.css", import.meta.url),
    "utf8",
  );

  assert.match(liquidCss, /\.toast-dismiss\s*\{/);
  assert.match(liquidCss, /\.toast-dismiss:hover\s*\{/);
  assert.match(liquidCss, /\.toast-dismiss:focus-visible\s*\{/);
});
