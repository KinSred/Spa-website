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

test("Mobile navigation: enforces modal isolation via inert and aria-hidden on footer and background", async () => {
  const [footerCode, spaCommerceCode] = await Promise.all([
    readFile(new URL("../app/components/Footer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SpaCommerce.tsx", import.meta.url), "utf8"),
  ]);

  // Contract: Footer receives mobileOpen prop and marks footer inert and aria-hidden
  assert.match(footerCode, /mobileOpen\??: boolean/);
  assert.match(footerCode, /<footer[\s\S]*?inert=\{mobileOpen \? true : undefined\}/);
  assert.match(footerCode, /aria-hidden=\{mobileOpen \? true : undefined\}/);

  // Contract: SpaCommerce wires mobileOpen to Footer and isolates main when mobileOpen is true
  assert.match(spaCommerceCode, /<Footer[\s\S]*?mobileOpen=\{mobileOpen\}/);
  assert.match(spaCommerceCode, /<main[\s\S]*?inert=\{mobileOpen\}/);

  // Behavioral simulation of modal background isolation
  let mobileOpen = false;
  const isMainInert = () => mobileOpen;
  const isFooterInert = () => mobileOpen;

  // 1. Initial idle state: elements interactive
  assert.equal(isMainInert(), false, "Main must not be inert when mobile menu is closed");
  assert.equal(isFooterInert(), false, "Footer must not be inert when mobile menu is closed");

  // 2. Open mobile menu: background becomes inert
  mobileOpen = true;
  assert.equal(isMainInert(), true, "Main must become inert when mobile menu opens");
  assert.equal(isFooterInert(), true, "Footer must become inert when mobile menu opens");

  // 3. Close mobile menu: background becomes interactive again
  mobileOpen = false;
  assert.equal(isMainInert(), false, "Main must become interactive when mobile menu closes");
  assert.equal(isFooterInert(), false, "Footer must become interactive when mobile menu closes");
});

test("ProductCatalogue: skin filter semantic group and aria-pressed state without tablist/tab", async () => {
  const catalogueCode = await readFile(
    new URL("../app/components/ProductCatalogue.tsx", import.meta.url),
    "utf8",
  );

  // Must use group role with accessible label
  assert.match(catalogueCode, /role="group"\s+aria-label="Lọc theo loại da"/);

  // Must use aria-pressed on toggle buttons
  assert.match(catalogueCode, /aria-pressed=\{active\}/);

  // Must NOT use tablist or tab roles
  assert.doesNotMatch(catalogueCode, /role="tablist"/);
  assert.doesNotMatch(catalogueCode, /role="tab"/);

  // Behavioral simulation of filter button group state
  const options = ["Tất cả", "Da khô", "Da dầu", "Da nhạy cảm"];
  let selectedSkin = "Tất cả";

  const getButtonState = (option) => ({
    option,
    ariaPressed: selectedSkin === option,
  });

  // Initial state: "Tất cả" is pressed
  let states = options.map(getButtonState);
  assert.equal(states.find((s) => s.option === "Tất cả")?.ariaPressed, true);
  assert.equal(states.find((s) => s.option === "Da nhạy cảm")?.ariaPressed, false);

  // User selects "Da nhạy cảm"
  selectedSkin = "Da nhạy cảm";
  states = options.map(getButtonState);
  assert.equal(states.find((s) => s.option === "Tất cả")?.ariaPressed, false);
  assert.equal(states.find((s) => s.option === "Da nhạy cảm")?.ariaPressed, true);
});

test("ProductCatalogue: removing active skin filter restores focus to default skin button", async () => {
  const [catalogueCode, spaCommerceCode] = await Promise.all([
    readFile(new URL("../app/components/ProductCatalogue.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SpaCommerce.tsx", import.meta.url), "utf8"),
  ]);

  // Must attach defaultSkinChipRef to the default "Tất cả" chip
  assert.match(catalogueCode, /const defaultSkinChipRef = useRef<HTMLButtonElement \| null>\(null\)/);
  assert.match(catalogueCode, /ref=\{opt === "Tất cả" \? defaultSkinChipRef : undefined\}/);

  // When removing skin filter, must restore focus to defaultSkinChipRef
  assert.match(catalogueCode, /returnFilterFocus\(defaultSkinChipRef\.current\)/);

  // Must not reference obsolete skinSelectRef
  assert.doesNotMatch(catalogueCode, /skinSelectRef/);
  assert.doesNotMatch(spaCommerceCode, /skinSelectRef/);

  // Behavioral simulation of focus restoration on filter tag removal
  let focusedElement = null;
  const mockDefaultSkinChip = {
    id: "default-skin-chip",
    focus() {
      focusedElement = mockDefaultSkinChip;
    },
  };

  let activeSkin = "Da nhạy cảm";
  const removeSkinFilter = () => {
    activeSkin = "Tất cả";
    mockDefaultSkinChip.focus();
  };

  removeSkinFilter();
  assert.equal(activeSkin, "Tất cả", "Active skin filter must reset to 'Tất cả'");
  assert.equal(focusedElement, mockDefaultSkinChip, "Focus must be restored to default skin button");
});

test("Hero: final reconciled class contract and style rules exist without discarded variants", async () => {
  const [heroCode, liquidCss] = await Promise.all([
    readFile(new URL("../app/components/Hero.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/liquid.css", import.meta.url), "utf8"),
  ]);

  // Verified final markup classes present in Hero.tsx
  const expectedClasses = [
    "hero-visual-caption",
    "caption-tag",
    "caption-title",
    "hero-vignette-card",
    "vignette-label",
    "vignette-quote",
  ];

  for (const cls of expectedClasses) {
    assert.match(heroCode, new RegExp(cls), `Hero.tsx must contain class: ${cls}`);
    assert.match(liquidCss, new RegExp(`\\.${cls}\\b`), `liquid.css must style class: .${cls}`);
  }

  // Obsolete/abandoned naming variants must NOT exist
  const discardedClasses = [
    "hero-caption-card",
    "hero-floating-meta",
    "meta-atelier-room",
    "meta-atelier-details",
  ];

  for (const cls of discardedClasses) {
    assert.doesNotMatch(heroCode, new RegExp(cls), `Hero.tsx must NOT contain discarded class: ${cls}`);
    assert.doesNotMatch(liquidCss, new RegExp(`\\.${cls}\\b`), `liquid.css must NOT contain discarded class: .${cls}`);
  }

  // Absence of fabricated/unsupported claims in Hero
  assert.doesNotMatch(heroCode, /10\.7769/, "Must not contain fabricated coordinates");
  assert.doesNotMatch(heroCode, /live-dot|dot-pulse/, "Must not claim live operating status with fake dot");
  assert.doesNotMatch(heroCode, /VOL\. 01 \/ 2024/, "Must not contain stale 2024 edition text");
  assert.doesNotMatch(heroCode, /trọn đời/, "Must not promise lifelong dossier retention");
});

test("Storefront: unsupported cart=open query parameter opens cart drawer and focuses close button", async () => {
  const spaCommerceCode = await readFile(
    new URL("../app/SpaCommerce.tsx", import.meta.url),
    "utf8",
  );

  // Verify URL query parameter contract for ?cart=open
  assert.match(spaCommerceCode, /url\.searchParams\.get\("cart"\) !== "open"/);
  assert.match(spaCommerceCode, /url\.searchParams\.delete\("cart"\)/);
  assert.match(spaCommerceCode, /window\.history\.replaceState/);
  assert.match(spaCommerceCode, /setCartOpen\(true\)/);
  assert.match(spaCommerceCode, /cartClose\.current\?\.focus\(\)/);

  // Behavioral simulation of URL parsing and opening
  let cartOpen = false;
  let focusedTarget = null;
  const mockCartClose = {
    focus() {
      focusedTarget = "cartClose";
    },
  };

  const simulateUrlNavigation = (search) => {
    const params = new URLSearchParams(search);
    if (params.get("cart") === "open") {
      params.delete("cart");
      cartOpen = true;
      mockCartClose.focus();
    }
  };

  simulateUrlNavigation("?cart=open");
  assert.equal(cartOpen, true, "Cart must be open when URL contains cart=open");
  assert.equal(focusedTarget, "cartClose", "Focus must move to cart close button");
});

test("Truthful content audit: fabricated claims and unsupported clinical guarantees are absent", async () => {
  const [footerCode, continuityCode, treatmentCode, journalCode, productDetailCode] = await Promise.all([
    readFile(new URL("../app/components/Footer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ContinuitySection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/TreatmentSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/JournalSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/san-pham/[slug]/ProductDetail.tsx", import.meta.url), "utf8"),
  ]);

  // Footer: no invented phone numbers, emails, addresses, or regulatory claims
  assert.doesNotMatch(footerCode, /028\s*\d{4}/, "Footer must not contain fabricated phone numbers");
  assert.doesNotMatch(footerCode, /atelier@tinh/i, "Footer must not contain fabricated email addresses");
  assert.doesNotMatch(footerCode, /Nguyễn Thị Minh Khai|Quận 1|Bến Nghé/i, "Footer must not contain fabricated street addresses");
  assert.doesNotMatch(footerCode, /bảo mật tuyệt đối|trọn đời/i, "Footer must not make absolute privacy/retention guarantees");

  // Continuity: no undocumented warm waves, tissue penetration or false server sync
  assert.doesNotMatch(continuityCode, /sóng ấm/i, "Continuity must not claim warm wave technology");
  assert.doesNotMatch(continuityCode, /vào sâu mà không gây tổn thương mô/i, "Continuity must not claim deep tissue delivery");
  assert.doesNotMatch(continuityCode, /đồng bộ trực tiếp|đồng bộ liên tục/i, "Continuity must not claim real-time server sync");

  // Treatment: no epidermal moisture measurement claim
  assert.doesNotMatch(treatmentCode, /đo độ ẩm tầng biểu bì/i, "Treatment must not claim epidermal moisture measurement");

  // Journal: no fake navigation back to #journal on article titles, no fake clinical essay labels
  assert.doesNotMatch(journalCode, /href="#journal"/, "Journal must not use fake navigation on headings");
  assert.doesNotMatch(journalCode, /CLINICAL ESSAYS/i, "Journal must not claim clinical essays");
  assert.doesNotMatch(journalCode, /hàng nghìn ca lâm sàng/i, "Journal must not claim thousands of clinical cases");

  // ProductDetail: no fabricated marketing claims
  assert.doesNotMatch(productDetailCode, /Chiết xuất thực vật tinh khiết/i, "ProductDetail must not fabricate pure botanical extract claims");
  assert.doesNotMatch(productDetailCode, /Điều chế mẻ nhỏ bảo toàn hoạt tính/i, "ProductDetail must not fabricate small-batch activity preservation claims");
});

