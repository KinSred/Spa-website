"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { products, services, type Product } from "./data";
import {
  commerceStorageKeys,
  createCommerceId,
  prependCommerceAppointment,
  prependCommerceOrder,
} from "./commerce-storage";
import { getLocalTodayDateString } from "./date-utils";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ContinuitySection } from "./components/ContinuitySection";
import { ProductCatalogue } from "./components/ProductCatalogue";
import { TreatmentSection } from "./components/TreatmentSection";
import { JournalSection } from "./components/JournalSection";
import { Footer } from "./components/Footer";
import {
  CartDrawer,
  type CartLine,
  type CheckoutDraft,
  type CheckoutState,
} from "./components/CartDrawer";
import { BookingDialog, type BookingState } from "./components/BookingDialog";
import {
  AdvisorChat,
  type ChatMessage,
  type ConciergeIntent,
} from "./components/AdvisorChat";
import { MobileBookingBar } from "./components/MobileBookingBar";
import { Toast, type ToastMessage } from "./components/Toast";

const skinOptions = ["Tất cả", "Mọi loại da", "Da khô", "Da dầu", "Da nhạy cảm"];
const concernOptions = [
  "Tất cả nhu cầu",
  "Phục hồi",
  "Cấp ẩm",
  "Thâm sạm",
  "Săn chắc",
];

export default function SpaCommerce() {
  const [query, setQuery] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products);
  const [skin, setSkin] = useState("Tất cả");
  const [concern, setConcern] = useState("Tất cả nhu cầu");
  const [price, setPrice] = useState("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponValid, setCouponValid] = useState(false);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("cart");
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft>({
    name: "",
    phone: "",
    address: "",
    payment: "cod",
    note: "",
  });
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [navCompact, setNavCompact] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [bagPulse, setBagPulse] = useState(false);
  const [chatTyping, setChatTyping] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>("idle");
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getLocalTodayDateString(),
  );
  const [selectedTime, setSelectedTime] = useState<string>("09:00–11:00");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "advisor",
      text: "Xin chào, TĨNH Concierge có thể hỗ trợ bạn tìm kiếm routine phù hợp hoặc thông tin các liệu trình tại atelier.",
    },
  ]);

  const bookingDialog = useRef<HTMLDialogElement>(null);
  const bookingInitialFocusRef = useRef<HTMLButtonElement>(null);
  const bookingOpener = useRef<HTMLElement | null>(null);
  const navSentinel = useRef<HTMLSpanElement>(null);
  const cartTrigger = useRef<HTMLButtonElement>(null);
  const wordmark = useRef<HTMLAnchorElement>(null);
  const cartClose = useRef<HTMLButtonElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const megaTrigger = useRef<HTMLButtonElement>(null);
  const chatTrigger = useRef<HTMLButtonElement>(null);
  const chatInput = useRef<HTMLInputElement>(null);
  const messagesEnd = useRef<HTMLSpanElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const concernSelect = useRef<HTMLSelectElement>(null);
  const priceSelect = useRef<HTMLSelectElement>(null);

  const addedTimeout = useRef<number | null>(null);
  const bagTimeout = useRef<number | null>(null);
  const copyTimeout = useRef<number | null>(null);
  const checkoutTimeout = useRef<number | null>(null);
  const chatTimeout = useRef<number | null>(null);
  const bookingTimeout = useRef<number | null>(null);

  useEffect(() => {
    let availableProducts = products;
    try {
      const storedInventory: unknown = JSON.parse(
        window.localStorage.getItem(commerceStorageKeys.inventory) ?? "[]",
      );
      if (Array.isArray(storedInventory) && storedInventory.length) {
        availableProducts = (
          storedInventory as Array<Product & { visible?: boolean }>
        ).filter((product) => product.visible !== false);
      }
    } catch {
      window.localStorage.removeItem(commerceStorageKeys.inventory);
    }

    const saved = window.localStorage.getItem("tinh-cart");
    let initialCart: CartLine[] = [];
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed)) throw new Error("Invalid cart payload");
        initialCart = parsed.flatMap((candidate) => {
          if (!candidate || typeof candidate !== "object") return [];
          const line = candidate as { id?: unknown; quantity?: unknown };
          const product = availableProducts.find(
            (item) => item.id === Number(line.id),
          );
          const savedQuantity = Number(line.quantity);
          if (
            !product ||
            !Number.isFinite(savedQuantity) ||
            savedQuantity <= 0
          ) {
            return [];
          }
          return [
            {
              product,
              quantity: Math.min(product.stock, Math.floor(savedQuantity)),
            },
          ];
        });
      } catch {
        window.localStorage.removeItem("tinh-cart");
        initialCart = [];
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCatalogProducts(availableProducts);
    setCart(initialCart);
    setCartHydrated(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key === commerceStorageKeys.inventory && event.newValue) {
        try {
          const updated: unknown = JSON.parse(event.newValue);
          if (Array.isArray(updated) && updated.length) {
            setCatalogProducts(
              (
                updated as Array<Product & { visible?: boolean }>
              ).filter((item) => item.visible !== false),
            );
          }
        } catch {
          // ignore corrupted cross-tab inventory
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    window.localStorage.setItem(
      "tinh-cart",
      JSON.stringify(
        cart.map((line) => ({
          id: line.product.id,
          quantity: line.quantity,
        })),
      ),
    );
  }, [cart, cartHydrated]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("cart") !== "open") return;
    url.searchParams.delete("cart");
    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCartOpen(true);
    window.requestAnimationFrame(() => cartClose.current?.focus());
  }, []);

  useEffect(() => {
    const node = navSentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavCompact(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-scroll-locked", cartOpen || mobileOpen);
    return () => document.body.classList.remove("is-scroll-locked");
  }, [cartOpen, mobileOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 60rem)");
    const resetNavigation = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
      else setMegaOpen(false);
    };
    desktop.addEventListener("change", resetNavigation);
    return () => desktop.removeEventListener("change", resetNavigation);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (cartOpen) {
        setCartOpen(false);
        cartTrigger.current?.focus();
      } else if (mobileOpen) {
        setMobileOpen(false);
        menuTrigger.current?.focus();
      } else if (megaOpen) {
        setMegaOpen(false);
        megaTrigger.current?.focus();
      } else if (chatOpen) {
        setChatOpen(false);
        chatTrigger.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cartOpen, chatOpen, megaOpen, mobileOpen]);

  useEffect(() => {
    if (chatOpen) messagesEnd.current?.scrollIntoView({ block: "nearest" });
  }, [chatOpen, chatTyping, messages]);

  useEffect(
    () => () => {
      [
        addedTimeout.current,
        bagTimeout.current,
        copyTimeout.current,
        checkoutTimeout.current,
        chatTimeout.current,
        bookingTimeout.current,
      ].forEach((timeout) => {
        if (timeout !== null) window.clearTimeout(timeout);
      });
    },
    [],
  );

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    return catalogProducts.filter((product) => {
      const matchesSearch =
        !normalized ||
        `${product.name} ${product.category} ${product.concern.join(" ")}`
          .toLocaleLowerCase("vi")
          .includes(normalized);
      const matchesSkin = skin === "Tất cả" || product.skin.includes(skin);
      const matchesConcern =
        concern === "Tất cả nhu cầu" || product.concern.includes(concern);
      const matchesPrice =
        price === "all" ||
        (price === "under-800" && product.price < 800000) ||
        (price === "800-1500" &&
          product.price >= 800000 &&
          product.price <= 1500000) ||
        (price === "above-1500" && product.price > 1500000);

      return matchesSearch && matchesSkin && matchesConcern && matchesPrice;
    });
  }, [catalogProducts, concern, price, query, skin]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    skin !== "Tất cả" ||
    concern !== "Tất cả nhu cầu" ||
    price !== "all";

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );
  const discount = couponValid ? Math.round(subtotal * 0.1) : 0;

  const announce = (message: string, tone: ToastMessage["tone"] = "status") => {
    setToast({ id: Date.now(), message, tone });
  };

  const closeCommerceSurfaces = () => {
    setCartOpen(false);
    setMobileOpen(false);
    setMegaOpen(false);
    setChatOpen(false);
  };

  const openCart = () => {
    closeCommerceSurfaces();
    setCheckoutState("cart");
    setCartOpen(true);
    window.requestAnimationFrame(() => cartClose.current?.focus());
  };

  const closeCart = () => {
    setCartOpen(false);
    setCheckoutState("cart");
    cartTrigger.current?.focus();
  };

  const toggleMobileMenu = () => {
    const next = !mobileOpen;
    closeCommerceSurfaces();
    setMobileOpen(next);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    window.requestAnimationFrame(() => menuTrigger.current?.focus());
  };

  const toggleChat = () => {
    const next = !chatOpen;
    closeCommerceSurfaces();
    setChatOpen(next);
    if (next) {
      window.requestAnimationFrame(() => chatInput.current?.focus());
    }
  };

  const closeChat = () => {
    setChatOpen(false);
    chatTrigger.current?.focus();
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((line) => line.product.id === product.id);
    if (existing && existing.quantity >= product.stock) {
      announce(`Đã đạt giới hạn tồn kho (${product.stock} sản phẩm).`, "alert");
      return;
    }

    setCart((current) => {
      const lineIndex = current.findIndex(
        (line) => line.product.id === product.id,
      );
      if (lineIndex >= 0) {
        return current.map((line, idx) =>
          idx === lineIndex
            ? {
                ...line,
                quantity: Math.min(product.stock, line.quantity + 1),
              }
            : line,
        );
      }
      return [...current, { product, quantity: 1 }];
    });

    setAddedProductId(product.id);
    setBagPulse(true);
    announce(`Đã thêm ${product.name} vào giỏ.`, "status");

    if (addedTimeout.current !== null) window.clearTimeout(addedTimeout.current);
    if (bagTimeout.current !== null) window.clearTimeout(bagTimeout.current);

    addedTimeout.current = window.setTimeout(
      () => setAddedProductId(null),
      1400,
    );
    bagTimeout.current = window.setTimeout(() => setBagPulse(false), 900);
  };

  const updateQuantity = (id: number, delta: number) => {
    const targetLine = cart.find((line) => line.product.id === id);
    if (!targetLine) return;
    const newQty = targetLine.quantity + delta;

    if (newQty <= 0) {
      removeCartLine(id);
      return;
    }

    setCart((current) =>
      current.map((line) =>
        line.product.id === id
          ? {
              ...line,
              quantity: Math.min(line.product.stock, newQty),
            }
          : line,
      ),
    );
  };

  const removeCartLine = (id: number) => {
    const lineIndex = cart.findIndex((line) => line.product.id === id);
    const remaining = cart.filter((line) => line.product.id !== id);
    setCart(remaining);

    // Focus restoration: prefer next remaining line, else previous line, else empty state CTA/close
    window.requestAnimationFrame(() => {
      if (remaining.length === 0) {
        const emptyBtn = document.querySelector<HTMLButtonElement>(".empty-cart-cta");
        if (emptyBtn) emptyBtn.focus();
        else cartClose.current?.focus();
      } else {
        const nextTargetId =
          lineIndex < remaining.length
            ? remaining[lineIndex].product.id
            : remaining[remaining.length - 1].product.id;
        const targetElement = document.querySelector<HTMLElement>(
          `#cart-line-${nextTargetId} .cart-remove-btn, #cart-line-${nextTargetId} .quantity-control button`,
        );
        if (targetElement) {
          targetElement.focus();
        } else {
          cartClose.current?.focus();
        }
      }
    });
  };

  const handleCouponChange = (value: string) => {
    setCoupon(value);
    if (couponValid) {
      setCouponValid(false);
    }
  };

  const applyCoupon = () => {
    const valid = coupon.trim().toUpperCase() === "TINH10";
    setCouponValid(valid);
    if (!valid) announce("Mã chưa đúng. Thử TINH10.", "alert");
  };

  const updateDraft = (updates: Partial<CheckoutDraft>) => {
    setCheckoutDraft((prev) => ({ ...prev, ...updates }));
  };

  const submitCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.length) return;
    const orderId = createCommerceId("DH");
    const total = subtotal - discount;
    setCheckoutState("processing");
    if (checkoutTimeout.current !== null)
      window.clearTimeout(checkoutTimeout.current);
    checkoutTimeout.current = window.setTimeout(() => {
      prependCommerceOrder({
        id: orderId,
        customer: checkoutDraft.name.trim(),
        phone: checkoutDraft.phone.trim(),
        address: checkoutDraft.address.trim(),
        payment: checkoutDraft.payment === "bank" ? "bank" : "cod",
        total,
        status: "Mới",
        createdAt: new Date().toISOString(),
        items: cart.map((line) => ({
          productId: line.product.id,
          name: line.product.name,
          quantity: line.quantity,
          price: line.product.price,
        })),
      });
      setLastOrderId(orderId);
      setCheckoutState("confirmed");
      setCart([]);
      setCoupon("");
      setCouponValid(false);
    }, 760);
  };

  const openBooking = () => {
    const active = document.activeElement as HTMLElement;
    bookingOpener.current = active?.closest?.(".mobile-menu")
      ? menuTrigger.current
      : active?.closest?.(".mega-panel")
        ? megaTrigger.current
        : active;
    closeCommerceSurfaces();
    setBookingState("idle");
    setBookingReference(null);
    bookingDialog.current?.showModal();
    window.requestAnimationFrame(() =>
      bookingInitialFocusRef.current?.focus(),
    );
  };

  const chooseServiceAndBook = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    window.requestAnimationFrame(openBooking);
  };

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const serviceId = String(values.get("service") || selectedServiceId);
    const service =
      services.find((item) => item.id === serviceId) ?? services[0];
    const appointmentId = createCommerceId("LH");
    setBookingState("submitting");
    if (bookingTimeout.current !== null)
      window.clearTimeout(bookingTimeout.current);
    bookingTimeout.current = window.setTimeout(() => {
      prependCommerceAppointment({
        id: appointmentId,
        customer: String(values.get("name") || "").trim(),
        phone: String(values.get("phone") || "").trim(),
        serviceId: service.id,
        service: service.name,
        date: String(values.get("date") || selectedDate),
        time: String(values.get("time") || selectedTime),
        note: String(values.get("note") || "").trim(),
        status: "Chờ xác nhận",
        createdAt: new Date().toISOString(),
      });
      setBookingReference(appointmentId);
      setBookingState("confirmed");
      form.reset();
    }, 680);
  };

  const handleConciergeIntent = (intent: ConciergeIntent) => {
    const isMobile = window.innerWidth < 960;
    if (intent === "sensitive-routine") {
      setSkin("Da nhạy cảm");
      if (isMobile) setChatOpen(false);
      const el = document.getElementById("catalogue");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (intent === "recovery-products") {
      setConcern("Phục hồi");
      if (isMobile) setChatOpen(false);
      const el = document.getElementById("catalogue");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (intent === "treatments") {
      if (isMobile) setChatOpen(false);
      const el = document.getElementById("treatments");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (intent === "booking") {
      setChatOpen(false);
      openBooking();
    }
  };

  const getDeterministicChatReply = (input: string): string => {
    const text = input.toLocaleLowerCase("vi");
    if (
      text.includes("nhạy cảm") ||
      text.includes("kích ứng") ||
      text.includes("đỏ")
    ) {
      return "Với làn da nhạy cảm, bạn có thể tham khảo Sérum Soie 01 (Panthenol 3%, Beta-glucan) và sữa rửa mặt dịu nhẹ Nettoyant Voile. Ngoài ra liệu trình Calme 75 phút tại phòng cabine tập trung làm dịu và củng cố màng ẩm tự nhiên.";
    }
    if (
      text.includes("phục hồi") ||
      text.includes("màng ẩm") ||
      text.includes("barrier")
    ) {
      return "Để củng cố màng bảo vệ da, TĨNH khuyến nghị kết hợp Sérum Soie 01 cùng kem dưỡng Crème Calme (Ceramide complex, Squalane) để khóa ẩm mà không gây cảm giác bí bách.";
    }
    if (
      text.includes("cấp ẩm") ||
      text.includes("khô") ||
      text.includes("bong tróc")
    ) {
      return "Làn da thiếu ẩm có thể sử dụng Sérum Soie 01 vào ban ngày và thêm 2 giọt dầu dưỡng khô Huile Ambre (Meadowfoam, Jojoba) cho chu trình ban đêm.";
    }
    if (
      text.includes("chống nắng") ||
      text.includes("bảo vệ") ||
      text.includes("spf") ||
      text.includes("uv")
    ) {
      return "Kem chống nắng Écran 50 (SPF 50+ PA++++, màng lọc Uvinul A Plus và Tinosorb S) có bề mặt ráo, không để lại vệt trắng, thích hợp bảo vệ da hàng ngày.";
    }
    if (
      text.includes("thiết bị") ||
      text.includes("massage") ||
      text.includes("sculpt") ||
      text.includes("săn chắc")
    ) {
      return "Thiết bị massage mặt Sculpt I có 3 mức sóng ấm và đầu hợp kim y tế, hỗ trợ nâng cơ và thư giãn cơ mặt khi kết hợp cùng serum trượt.";
    }
    if (
      text.includes("liệu trình") ||
      text.includes("spa") ||
      text.includes("cabine") ||
      text.includes("soi da")
    ) {
      return "Atelier hiện cung cấp 3 liệu trình phòng cabine: Soi da & Thiết kế routine (45 phút · 350.000 ₫), Calme phục hồi màng ẩm (75 phút · 1.250.000 ₫) và Clarté làm sạch chuyên sâu (90 phút · 1.580.000 ₫).";
    }
    if (
      text.includes("đặt lịch") ||
      text.includes("hẹn") ||
      text.includes("booking") ||
      text.includes("giờ")
    ) {
      return "Bạn có thể nhấn nút 'Đặt lịch' ở đầu trang hoặc bấm vào gợi ý 'Đặt lịch tư vấn' để chọn ngày và khung giờ đón tiếp thuận tiện.";
    }
    return "TĨNH Concierge là trợ lý gợi ý nhanh trong phiên bản demo. Bạn có thể chọn các gợi ý bên trên hoặc trực tiếp xem các sản phẩm và liệu trình phòng cabine.";
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = String(form.get("message") || "").trim();
    if (!text) return;
    setMessages((current) => [...current, { from: "user", text }]);
    setChatTyping(true);
    event.currentTarget.reset();
    if (chatTimeout.current !== null) window.clearTimeout(chatTimeout.current);
    chatTimeout.current = window.setTimeout(() => {
      setChatTyping(false);
      const reply = getDeterministicChatReply(text);
      setMessages((current) => [
        ...current,
        {
          from: "advisor",
          text: reply,
        },
      ]);
    }, 450);
  };

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText("TINH10");
      setCouponCopied(true);
      if (copyTimeout.current !== null) window.clearTimeout(copyTimeout.current);
      copyTimeout.current = window.setTimeout(
        () => setCouponCopied(false),
        1800,
      );
    } catch {
      announce("Không thể sao chép tự động. Mã là TINH10.", "alert");
    }
  };

  const dismissAnnouncement = () => {
    setAnnouncementVisible(false);
    window.requestAnimationFrame(() => wordmark.current?.focus());
  };

  const resetFilters = () => {
    setQuery("");
    setSkin("Tất cả");
    setConcern("Tất cả nhu cầu");
    setPrice("all");
  };

  return (
    <div
      className={`site-shell ${announcementVisible ? "" : "announcement-dismissed"}`}
    >
      <Header
        announcementVisible={announcementVisible}
        onDismissAnnouncement={dismissAnnouncement}
        couponCopied={couponCopied}
        onCopyCoupon={copyCoupon}
        navCompact={navCompact}
        navSentinelRef={navSentinel}
        wordmarkRef={wordmark}
        megaOpen={megaOpen}
        onToggleMega={() => {
          const next = !megaOpen;
          closeCommerceSurfaces();
          setMegaOpen(next);
        }}
        onCloseMega={() => {
          setMegaOpen(false);
          window.requestAnimationFrame(() => megaTrigger.current?.focus());
        }}
        megaTriggerRef={megaTrigger}
        onFilterSkin={(selectedSkin) => setSkin(selectedSkin)}
        onFilterConcern={(selectedConcern) => setConcern(selectedConcern)}
        onOpenBooking={openBooking}
        cartCount={cartCount}
        cartOpen={cartOpen}
        cartTriggerRef={cartTrigger}
        onOpenCart={openCart}
        bagPulse={bagPulse}
        mobileOpen={mobileOpen}
        onToggleMobile={toggleMobileMenu}
        onCloseMobile={closeMobileMenu}
        menuTriggerRef={menuTrigger}
      />

      <main inert={mobileOpen}>
        <Hero onOpenBooking={openBooking} />

        <ContinuitySection />

        <ProductCatalogue
          products={filteredProducts}
          query={query}
          onQueryChange={setQuery}
          searchInputRef={searchInput}
          skin={skin}
          onSkinChange={setSkin}
          skinOptions={skinOptions}
          concern={concern}
          onConcernChange={setConcern}
          concernSelectRef={concernSelect}
          concernOptions={concernOptions}
          price={price}
          onPriceChange={setPrice}
          priceSelectRef={priceSelect}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
          cart={cart}
          addedProductId={addedProductId}
          onAddToCart={addToCart}
        />

        <TreatmentSection
          selectedServiceId={selectedServiceId}
          onSelectService={setSelectedServiceId}
          onChooseServiceAndBook={chooseServiceAndBook}
        />

        <JournalSection />
      </main>

      <Footer mobileOpen={mobileOpen} onOpenBooking={openBooking} />

      <CartDrawer
        cartOpen={cartOpen}
        onCloseCart={closeCart}
        cartCloseRef={cartClose}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveLine={removeCartLine}
        coupon={coupon}
        onCouponChange={handleCouponChange}
        couponValid={couponValid}
        onApplyCoupon={applyCoupon}
        subtotal={subtotal}
        discount={discount}
        checkoutState={checkoutState}
        onSetCheckoutState={setCheckoutState}
        checkoutDraft={checkoutDraft}
        onUpdateDraft={updateDraft}
        onSubmitCheckout={submitCheckout}
        lastOrderId={lastOrderId}
        aria-modal="true"
        inert={!cartOpen}
      />

      <BookingDialog
        bookingDialogRef={bookingDialog}
        bookingInitialFocusRef={bookingInitialFocusRef}
        bookingState={bookingState}
        bookingReference={bookingReference}
        selectedServiceId={selectedServiceId}
        onSelectServiceId={setSelectedServiceId}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
        onSubmitBooking={submitBooking}
        onCloseDialog={() => {
          if (bookingTimeout.current !== null) {
            window.clearTimeout(bookingTimeout.current);
            bookingTimeout.current = null;
          }
          setBookingState("idle");
          bookingOpener.current?.focus();
        }}
      />

      <AdvisorChat
        chatOpen={chatOpen}
        onToggleChat={toggleChat}
        onCloseChat={closeChat}
        chatTriggerRef={chatTrigger}
        chatInputRef={chatInput}
        messages={messages}
        chatTyping={chatTyping}
        onSendMessage={sendMessage}
        onIntent={handleConciergeIntent}
        messagesEndRef={messagesEnd}
      />

      <MobileBookingBar onOpenBooking={openBooking} />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
