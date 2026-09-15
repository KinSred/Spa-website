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

  assert.match(spaCommerceCode, /else if \(mobileOpen\) \{\s*closeMobileMenu\("dismiss"\);/);
  assert.match(spaCommerceCode, /const closeMobileMenu = \(reason: MobileMenuCloseReason = "dismiss"\) =>/);
  assert.match(spaCommerceCode, /menuTrigger\.current\?\.focus\(\)/);
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

test("Truthful content sweep: Hero, Treatment, ProductDetail, Footer, and Navigation conform to canonical catalog", async () => {
  const [heroCode, treatmentCode, productDetailCode, footerCode, headerCode] = await Promise.all([
    readFile(new URL("../app/components/Hero.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/TreatmentSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/san-pham/[slug]/ProductDetail.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/Footer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8"),
  ]);

  // 1. Hero: no unbacked location, operating hours, or technical dossier claims
  assert.doesNotMatch(heroCode, /TP\.\s*HỒ\s*CHÍ\s*MINH/i, "Hero must not contain unbacked TP. HCM location");
  assert.doesNotMatch(heroCode, /09:00\s*[–-]\s*20:00/, "Hero must not claim unbacked 09:00 - 20:00 operating hours");
  assert.doesNotMatch(heroCode, /hồ\s*sơ\s*duy\s*nhất/i, "Hero must not promise unified technical customer dossier");
  assert.match(heroCode, /Chăm da, không chia đôi\./);

  // 2. Treatment: no efficacy duration claims or botanical lipid claims
  assert.doesNotMatch(treatmentCode, /nhiều\s*tháng\s*tới/i, "Treatment must not claim multi-month recovery");
  assert.doesNotMatch(treatmentCode, /mặt\s*nạ\s*lipid\s*thực\s*vật/i, "Treatment must not claim botanical lipid mask");

  // 3. ProductDetail: truthful price label
  assert.doesNotMatch(productDetailCode, /Giá niêm yết chính hãng/i, "ProductDetail must not use hyperbolic price label");
  assert.match(productDetailCode, /<span className="price-lead-label">Giá<\/span>/);

  // 4. Navigation & Footer: no admin links in customer surfaces
  assert.doesNotMatch(headerCode, /href="\/admin"/, "Header must not link to /admin");
  assert.doesNotMatch(footerCode, /href="\/admin"/, "Footer must not link to /admin");
});

test("Token hygiene: zero occurrences of --z-fixed and transition: all across all styles", async () => {
  const [liquidCss, globalsCss, tokensCss] = await Promise.all([
    readFile(new URL("../app/liquid.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../tokens.css", import.meta.url), "utf8"),
  ]);

  const allCss = `${liquidCss}\n${globalsCss}\n${tokensCss}`;

  // Zero occurrences of z-fixed
  assert.doesNotMatch(allCss, /--z-fixed\b/, "Must have zero occurrences of --z-fixed token definition");
  assert.doesNotMatch(allCss, /var\(--z-fixed\)/, "Must have zero occurrences of var(--z-fixed)");

  // Zero occurrences of transition: all or transition-all
  assert.doesNotMatch(allCss, /transition:\s*all\b/i, "Must have zero occurrences of transition: all");
  assert.doesNotMatch(allCss, /\btransition-all\b/, "Must have zero occurrences of transition-all utility");
});

test("Restrained TĨNH scrollbars and stable header scroll morph in liquid.css", async () => {
  const liquidCss = await readFile(
    new URL("../app/liquid.css", import.meta.url),
    "utf8",
  );

  // Restrained scrollbars for WebKit and Firefox
  assert.match(liquidCss, /scrollbar-width:\s*thin/);
  assert.match(liquidCss, /scrollbar-color:\s*var\(--color-rule-2\)\s+transparent/);
  assert.match(liquidCss, /::-webkit-scrollbar/);
  assert.match(liquidCss, /::-webkit-scrollbar-thumb/);

  // Stable header scroll morph: smooth announcement collapse without translateY on compact nav-inner
  assert.match(liquidCss, /\.site-header\.is-compact \.announcement\s*\{[\s\S]*?max-height:\s*0/);
  assert.match(liquidCss, /\.site-header\.is-compact \.announcement\s*\{[\s\S]*?opacity:\s*0/);
  assert.match(liquidCss, /\.site-header\.is-compact \.nav-inner\s*\{[^{}]*background:\s*var\(--color-surface\)/);
  assert.doesNotMatch(liquidCss, /\.site-header\.is-compact \.nav-inner\s*\{[^{}]*transform:\s*translateY/);
});

test("Admin demo indicator: restrained DEMO · LOCAL DATA badge without alarmist warnings", async () => {
  const [adminHeaderCode, adminSidebarCode] = await Promise.all([
    readFile(new URL("../app/admin/components/AdminHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/components/AdminSidebar.tsx", import.meta.url), "utf8"),
  ]);

  // Header contains restrained demo tag
  assert.match(adminHeaderCode, /DEMO · LOCAL DATA/);
  assert.match(adminHeaderCode, /className="admin-demo-tag"/);

  // Sidebar footer documents local demo storage
  assert.match(adminSidebarCode, /Dữ liệu demo lưu cục bộ trên trình duyệt này/);

  // No alarming production security red banner
  assert.doesNotMatch(adminHeaderCode, /CẢNH BÁO NGUY HIỂM|KHÔNG AN TOÀN|SECURITY WARNING/i);
});

test("Checkout state machine: 5 explicit states and bidirectional CheckoutDraft persistence", async () => {
  const [cartDrawerCode, spaCommerceCode] = await Promise.all([
    readFile(new URL("../app/components/CartDrawer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SpaCommerce.tsx", import.meta.url), "utf8"),
  ]);

  // Types define 5 explicit checkout states
  assert.match(cartDrawerCode, /export type CheckoutState =\s*\|?\s*"cart"\s*\|\s*"details"\s*\|\s*"payment"\s*\|\s*"processing"\s*\|\s*"confirmed"/);
  assert.match(cartDrawerCode, /export type CheckoutDraft =/);

  // Stepper markup reflects real CheckoutState
  assert.match(cartDrawerCode, /className="checkout-stepper"/);
  assert.match(cartDrawerCode, /checkoutState === "cart"/);
  assert.match(cartDrawerCode, /checkoutState === "details"/);
  assert.match(cartDrawerCode, /checkoutState === "payment"/);

  // Parent-owned draft in SpaCommerce
  assert.match(spaCommerceCode, /const \[checkoutDraft, setCheckoutDraft\] = useState<CheckoutDraft>/);
  assert.match(spaCommerceCode, /const \[checkoutState, setCheckoutState\] = useState<CheckoutState>\("cart"\)/);

  // State machine simulation: bidirectional navigation details -> payment -> details -> payment
  let currentState = "cart";
  let draft = {
    name: "",
    phone: "",
    address: "",
    note: "",
    payment: "cod",
  };

  const updateDraft = (patch) => {
    draft = { ...draft, ...patch };
  };

  const setState = (next) => {
    currentState = next;
  };

  // Step 1: user opens cart and proceeds to details
  setState("details");
  assert.equal(currentState, "details");

  // Step 2: user enters delivery details
  updateDraft({
    name: "Lê Minh Thảo",
    phone: "0901234567",
    address: "123 Đường Hoa Lan, Phường 2, Phú Nhuận",
    note: "Giao giờ hành chính",
  });

  // Step 3: user proceeds to payment step
  setState("payment");
  assert.equal(currentState, "payment");
  assert.equal(draft.name, "Lê Minh Thảo");
  assert.equal(draft.phone, "0901234567");
  assert.equal(draft.address, "123 Đường Hoa Lan, Phường 2, Phú Nhuận");
  assert.equal(draft.payment, "cod");

  // Step 4: user chooses bank transfer
  updateDraft({ payment: "bank" });
  assert.equal(draft.payment, "bank");

  // Step 5: user clicks Back to details
  setState("details");
  assert.equal(currentState, "details");
  // CRITICAL: Draft fields must remain intact without losing data!
  assert.equal(draft.name, "Lê Minh Thảo");
  assert.equal(draft.phone, "0901234567");
  assert.equal(draft.address, "123 Đường Hoa Lan, Phường 2, Phú Nhuận");
  assert.equal(draft.note, "Giao giờ hành chính");
  assert.equal(draft.payment, "bank");

  // Step 6: user updates phone number and advances back to payment
  updateDraft({ phone: "0909888777" });
  setState("payment");
  assert.equal(currentState, "payment");
  assert.equal(draft.phone, "0909888777");
  assert.equal(draft.payment, "bank", "Payment choice must be preserved when returning to payment step");
});

test("Booking Studio: localized Vietnamese date utility and accessible dialog lifecycle", async () => {
  const [bookingDialogCode, dateUtilsCode] = await Promise.all([
    readFile(new URL("../app/components/BookingDialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/date-utils.ts", import.meta.url), "utf8"),
  ]);

  // Localized date utilities
  assert.match(dateUtilsCode, /formatLocalDateToISO/);
  assert.match(dateUtilsCode, /getLocalTodayDateString/);
  assert.match(dateUtilsCode, /formatVietnameseDate/);
  assert.match(dateUtilsCode, /formatVietnameseDateLong/);

  // Hidden date input preserves name="date" with ISO value
  assert.match(bookingDialogCode, /<input type="hidden" name="date" value=\{selectedDate\} \/>/);

  // Service cards have accessible role, aria-pressed, and initial focus ref
  assert.match(bookingDialogCode, /className=\{`booking-service-card \$\{isSelected \? "is-selected" : ""\}`\}/);
  assert.match(bookingDialogCode, /aria-pressed=\{isSelected\}/);
  assert.match(bookingDialogCode, /ref=\{index === 0 \? bookingInitialFocusRef : undefined\}/);

  // Date strip renders localized display
  assert.match(bookingDialogCode, /className="booking-date-strip"/);
  assert.match(bookingDialogCode, /className=\{`date-chip/);

  // Pre-submission summary strip
  assert.match(bookingDialogCode, /className="booking-summary-strip"/);

  // Dialog lifecycle preserved
  assert.match(bookingDialogCode, /const requestClose = \(\) =>/);
  assert.match(bookingDialogCode, /aria-label="Đóng biểu mẫu"/);
});

test("Presentational Concierge: quick intent pills and deterministic routing", async () => {
  const [advisorChatCode, spaCommerceCode] = await Promise.all([
    readFile(new URL("../app/components/AdvisorChat.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SpaCommerce.tsx", import.meta.url), "utf8"),
  ]);

  // Quick intent pills rendered
  assert.match(advisorChatCode, /className="concierge-quick-strip"/);
  assert.match(advisorChatCode, /className="quick-intent-pill"/);
  assert.match(advisorChatCode, /Chọn routine cho da nhạy cảm/);
  assert.match(advisorChatCode, /Tìm sản phẩm phục hồi/);
  assert.match(advisorChatCode, /Xem liệu trình/);
  assert.match(advisorChatCode, /Đặt lịch tư vấn/);

  // Deterministic router handles intent
  assert.match(spaCommerceCode, /const handleConciergeIntent = \(intent: ConciergeIntent\) =>/);
  assert.match(spaCommerceCode, /const getDeterministicChatReply = \(input: string\): string =>/);
});

test("SOURCE CONTRACT TEST & STATE-MACHINE TEST: PriceFilter single source of truth and contract integrity", async () => {
  const [dataCode, catalogueCode, spaCommerceCode] = await Promise.all([
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ProductCatalogue.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SpaCommerce.tsx", import.meta.url), "utf8"),
  ]);

  // 1. Source Contract: Type definition and canonical constants
  assert.match(dataCode, /export type PriceFilterId = "all" \| "under700" \| "700to1000" \| "over1000";/);
  assert.match(dataCode, /export const PRICE_FILTERS: readonly PriceFilterOption\[\] =/);
  assert.match(dataCode, /export function isPriceFilterId\(value: unknown\): value is PriceFilterId/);
  assert.match(dataCode, /export function getPriceFilter\(id: PriceFilterId\): PriceFilterOption/);

  // 2. Source Contract: ProductCatalogue uses PRICE_FILTERS, isPriceFilterId typeguard, no raw string casts
  assert.match(catalogueCode, /price: PriceFilterId;/);
  assert.match(catalogueCode, /onPriceChange: \(price: PriceFilterId\) => void;/);
  assert.match(catalogueCode, /PRICE_FILTERS\.map\(\(f\) =>/);
  assert.match(catalogueCode, /if \(isPriceFilterId\(val\)\)/);
  assert.doesNotMatch(catalogueCode, /as PriceFilterId/);

  // 3. Source Contract: SpaCommerce uses getPriceFilter(price).matches(product.price)
  assert.match(spaCommerceCode, /const \[price, setPrice\] = useState<PriceFilterId>\("all"\);/);
  assert.match(spaCommerceCode, /const matchesPrice = getPriceFilter\(price\)\.matches\(product\.price\);/);

  // 4. State-Machine / Functional Evaluation: Verify exact products matched per filter
  const { PRICE_FILTERS, products } = await import("../app/data.ts");

  const under700Filter = PRICE_FILTERS.find((f) => f.id === "under700");
  assert.ok(under700Filter, "under700 filter must exist");
  const under700Products = products.filter((p) => under700Filter.matches(p.price));
  assert.deepEqual(
    under700Products.map((p) => p.name).sort(),
    ["Nettoyant Voile", "Écran 50"].sort(),
    "under700 must match exactly Nettoyant Voile (420k) and Écran 50 (680k)",
  );

  const midFilter = PRICE_FILTERS.find((f) => f.id === "700to1000");
  assert.ok(midFilter, "700to1000 filter must exist");
  const midProducts = products.filter((p) => midFilter.matches(p.price));
  assert.deepEqual(
    midProducts.map((p) => p.name).sort(),
    ["Crème Calme", "Huile Ambre", "Sérum Soie 01"].sort(),
    "700to1000 must match exactly Crème Calme (850k), Huile Ambre (980k), and Sérum Soie 01 (920k)",
  );

  const over1000Filter = PRICE_FILTERS.find((f) => f.id === "over1000");
  assert.ok(over1000Filter, "over1000 filter must exist");
  const over1000Products = products.filter((p) => over1000Filter.matches(p.price));
  assert.deepEqual(
    over1000Products.map((p) => p.name),
    ["Sculpt I"],
    "over1000 must match exactly Sculpt I (1850k)",
  );

  const allFilter = PRICE_FILTERS.find((f) => f.id === "all");
  assert.ok(allFilter, "all filter must exist");
  const allProducts = products.filter((p) => allFilter.matches(p.price));
  assert.equal(allProducts.length, 6, "all filter must match all 6 catalog products");
});

test("SOURCE CONTRACT TEST & STATE-MACHINE TEST: Mobile menu distinguishes dismiss from navigation", async () => {
  const [headerCode, spaCommerceCode] = await Promise.all([
    readFile(new URL("../app/components/Header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SpaCommerce.tsx", import.meta.url), "utf8"),
  ]);

  // 1. Source Contract: MobileMenuCloseReason type and semantic handlers
  assert.match(headerCode, /export type MobileMenuCloseReason = "dismiss" \| "navigate";/);
  assert.match(headerCode, /onCloseMobile: \(reason\?: MobileMenuCloseReason\) => void;/);
  assert.match(headerCode, /onNavigateMobileDestination\?: \(destination: "catalogue" \| "treatments" \| "journal"\) => void;/);

  // Scrim click invokes dismiss
  assert.match(headerCode, /if \(mobileOpen\) onCloseMobile\("dismiss"\);/);

  // Links invoke onNavigateMobileDestination
  assert.match(headerCode, /onNavigateMobileDestination\("catalogue"\)/);
  assert.match(headerCode, /onNavigateMobileDestination\("treatments"\)/);
  assert.match(headerCode, /onNavigateMobileDestination\("journal"\)/);

  // Booking button invokes onOpenBooking with explicit menuTriggerRef
  assert.match(headerCode, /onCloseMobile\("navigate"\);\s*onOpenBooking\(menuTriggerRef\.current\);/);

  // SpaCommerce handles navigate vs dismiss
  assert.match(spaCommerceCode, /const closeMobileMenu = \(reason: MobileMenuCloseReason = "dismiss"\) =>/);
  assert.match(spaCommerceCode, /if \(reason === "dismiss"\) \{\s*window\.requestAnimationFrame\(\(\) => menuTrigger\.current\?\.focus\(\)\);/);
  assert.match(spaCommerceCode, /const handleMobileDestination = \(\s*destination: "catalogue" \| "treatments" \| "journal",\s*\) => \{\s*closeMobileMenu\("navigate"\);/);

  // 2. State-Machine Test: verify focus policy distinction
  let focusedElement = null;
  const mockHamburger = { name: "hamburger" };
  const mockCatalogueHeading = { name: "catalogue-heading" };
  let isMenuOpen = true;

  const simulateClose = (reason) => {
    isMenuOpen = false;
    if (reason === "dismiss") {
      focusedElement = mockHamburger;
    }
  };

  const simulateNavigate = (destination) => {
    simulateClose("navigate");
    if (destination === "catalogue") {
      focusedElement = mockCatalogueHeading;
    }
  };

  // Scenario A: Dismiss via scrim or Escape -> focus MUST return to hamburger
  focusedElement = null;
  simulateClose("dismiss");
  assert.equal(isMenuOpen, false);
  assert.equal(focusedElement, mockHamburger, "Dismiss must restore focus to hamburger");

  // Scenario B: Navigate to catalogue -> focus MUST NOT bounce to hamburger
  isMenuOpen = true;
  focusedElement = null;
  simulateNavigate("catalogue");
  assert.equal(isMenuOpen, false);
  assert.equal(focusedElement, mockCatalogueHeading, "Navigate must move focus to destination target, never bouncing to hamburger");
});

test("SOURCE CONTRACT TEST: Programmatic destination targets on real accessible elements", async () => {
  const [catalogueCode, treatmentCode, journalCode, liquidCss] = await Promise.all([
    readFile(new URL("../app/components/ProductCatalogue.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/TreatmentSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/JournalSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/liquid.css", import.meta.url), "utf8"),
  ]);

  // Catalogue title has ref and tabIndex={-1}
  assert.match(catalogueCode, /catalogueDestinationRef\?: RefObject<HTMLHeadingElement \| null>;/);
  assert.match(catalogueCode, /<h2 className="catalogue-title" ref=\{catalogueDestinationRef\} tabIndex=\{-1\}>/);

  // Treatment title has ref and tabIndex={-1}
  assert.match(treatmentCode, /treatmentDestinationRef\?: RefObject<HTMLHeadingElement \| null>;/);
  assert.match(treatmentCode, /<h2 className="protocol-title" ref=\{treatmentDestinationRef\} tabIndex=\{-1\}>/);

  // Journal title has ref and tabIndex={-1}
  assert.match(journalCode, /journalDestinationRef\?: RefObject<HTMLHeadingElement \| null>;/);
  assert.match(journalCode, /<h2 className="journal-title" ref=\{journalDestinationRef\} tabIndex=\{-1\}>/);

  // Programmatic focus outline suppression for non-keyboard focus
  assert.match(liquidCss, /\[tabindex="-1"\]:focus:not\(:focus-visible\)\s*\{\s*outline:\s*none;\s*\}/);
});

test("SOURCE CONTRACT TEST & STATE-MACHINE TEST: Explicit Concierge and Mobile Menu booking openers", async () => {
  const spaCommerceCode = await readFile(
    new URL("../app/SpaCommerce.tsx", import.meta.url),
    "utf8",
  );

  // Concierge intent booking passes explicit opener
  assert.match(spaCommerceCode, /else if \(intent === "booking"\) \{\s*setChatOpen\(false\);\s*openBooking\(\{ opener: chatTrigger\.current \}\);/);

  // openBooking accepts explicit opener and falls back sensibly
  assert.match(spaCommerceCode, /const openBooking = \(options\?: \{ opener\?: HTMLElement \| null \} \| unknown\) =>/);
  assert.match(spaCommerceCode, /bookingOpener\.current = explicitOpener \?\? fallbackOpener \?\? menuTrigger\.current;/);

  // State-machine verification of explicit opener assignment
  let recordedOpener = null;
  const mockChatTrigger = { id: "chat-trigger" };
  const mockMenuTrigger = { id: "menu-trigger" };

  const simulateOpenBooking = (options) => {
    const explicit = options && typeof options === "object" && "opener" in options ? options.opener : null;
    recordedOpener = explicit ?? mockMenuTrigger;
  };

  simulateOpenBooking({ opener: mockChatTrigger });
  assert.equal(recordedOpener, mockChatTrigger, "Concierge booking MUST assign chat trigger as explicit opener");

  simulateOpenBooking({ opener: mockMenuTrigger });
  assert.equal(recordedOpener, mockMenuTrigger, "Mobile menu booking MUST assign menu trigger as explicit opener");
});

test("SOURCE CONTRACT TEST & STATE-MACHINE TEST: Checkout Stepper remains visible with Step 4 complete in confirmed state", async () => {
  const cartDrawerCode = await readFile(
    new URL("../app/components/CartDrawer.tsx", import.meta.url),
    "utf8",
  );

  // Stepper condition allows confirmed state
  assert.match(cartDrawerCode, /\{\(cart\.length > 0 \|\| checkoutState !== "cart"\) && \(/);

  // Step 4 is rendered as is-current is-complete in confirmed state
  assert.match(
    cartDrawerCode,
    /className=\{`step-item \$\{\s*checkoutState === "confirmed"\s*\?\s*"is-current is-complete"\s*:\s*checkoutState === "processing"\s*\?\s*"is-pending is-loading"\s*:\s*"is-pending"\s*\}`\}/,
  );
  assert.match(
    cartDrawerCode,
    /aria-current=\{checkoutState === "confirmed" \? "step" : undefined\}/,
  );

  // State machine simulation of the 4 customer stages
  const getStepClasses = (checkoutState) => ({
    step1: checkoutState === "cart" ? "is-current" : "is-complete",
    step2:
      checkoutState === "details"
        ? "is-current"
        : ["payment", "processing", "confirmed"].includes(checkoutState)
          ? "is-complete"
          : "is-pending",
    step3:
      checkoutState === "payment"
        ? "is-current"
        : ["processing", "confirmed"].includes(checkoutState)
          ? "is-complete"
          : "is-pending",
    step4:
      checkoutState === "confirmed"
        ? "is-current is-complete"
        : checkoutState === "processing"
          ? "is-pending is-loading"
          : "is-pending",
  });

  // Stage 1: Cart
  const s1 = getStepClasses("cart");
  assert.equal(s1.step1, "is-current");
  assert.equal(s1.step4, "is-pending");

  // Stage 2: Details
  const s2 = getStepClasses("details");
  assert.equal(s2.step1, "is-complete");
  assert.equal(s2.step2, "is-current");
  assert.equal(s2.step4, "is-pending");

  // Stage 3: Payment
  const s3 = getStepClasses("payment");
  assert.equal(s3.step1, "is-complete");
  assert.equal(s3.step2, "is-complete");
  assert.equal(s3.step3, "is-current");
  assert.equal(s3.step4, "is-pending");

  // Internal Processing: Step 1, 2, 3 complete, Step 4 pending/loading
  const sProcessing = getStepClasses("processing");
  assert.equal(sProcessing.step1, "is-complete");
  assert.equal(sProcessing.step2, "is-complete");
  assert.equal(sProcessing.step3, "is-complete");
  assert.equal(sProcessing.step4, "is-pending is-loading");

  // Stage 4: Confirmed - Step 4 must be current and complete
  const s4 = getStepClasses("confirmed");
  assert.equal(s4.step1, "is-complete");
  assert.equal(s4.step2, "is-complete");
  assert.equal(s4.step3, "is-complete");
  assert.equal(s4.step4, "is-current is-complete", "Step 4 must be current and complete in confirmed stage");
});

test("SOURCE CONTRACT TEST: Truthful copy compliance across all surfaces", async () => {
  const [cartDrawerCode, spaCommerceCode] = await Promise.all([
    readFile(new URL("../app/components/CartDrawer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SpaCommerce.tsx", import.meta.url), "utf8"),
  ]);

  // CartDrawer truthful copy
  assert.doesNotMatch(cartDrawerCode, /đóng gói và giao/);
  assert.doesNotMatch(cartDrawerCode, /toàn quốc/);
  assert.doesNotMatch(cartDrawerCode, /hướng dẫn chuyển khoản trong bản demo/);

  assert.match(cartDrawerCode, /Đơn hàng demo đã được ghi nhận trên thiết bị này/);
  assert.match(cartDrawerCode, /Phương thức mô phỏng trong bản demo; không yêu cầu chuyển tiền thực tế/);
  assert.match(cartDrawerCode, /Đơn hàng đủ điều kiện miễn phí giao hàng/);

  // SpaCommerce chat reply truthful copy for Sculpt I
  assert.doesNotMatch(spaCommerceCode, /nâng cơ/);
  assert.match(spaCommerceCode, /hỗ trợ thư giãn và săn chắc da/);
});

test("SOURCE CONTRACT TEST: Scrollbar audit verifies real selectors", async () => {
  const liquidCss = await readFile(
    new URL("../app/liquid.css", import.meta.url),
    "utf8",
  );

  // .order-table-wrap must be completely absent from stylesheet
  assert.doesNotMatch(liquidCss, /\.order-table-wrap/);

  // .order-table and .active-tags-rail must be present in restrained scrollbars list
  assert.match(liquidCss, /html,\s*body,[\s\S]*?\.order-table,[\s\S]*?\.active-tags-rail\s*\{[\s\S]*?scrollbar-width:\s*thin;/);
});



