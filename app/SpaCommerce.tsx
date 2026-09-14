"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { products, services, type Product } from "./data";
import {
  commerceStorageKeys,
  createCommerceId,
  prependCommerceAppointment,
  prependCommerceOrder,
} from "./commerce-storage";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ContinuitySection } from "./components/ContinuitySection";
import { ProductCatalogue } from "./components/ProductCatalogue";
import { TreatmentSection } from "./components/TreatmentSection";
import { JournalSection } from "./components/JournalSection";
import { Footer } from "./components/Footer";
import { CartDrawer, type CheckoutState } from "./components/CartDrawer";
import { BookingDialog } from "./components/BookingDialog";
import { AdvisorChat } from "./components/AdvisorChat";
import { MobileBookingBar } from "./components/MobileBookingBar";
import { Toast, type ToastMessage } from "./components/Toast";

type CartLine = {
  product: Product;
  quantity: number;
};

type BookingState = "idle" | "submitting" | "confirmed";

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
  const [messages, setMessages] = useState([
    {
      from: "advisor",
      text: "Chào bạn, mình có thể giúp chọn routine hoặc khung giờ liệu trình.",
    },
  ]);

  const bookingDialog = useRef<HTMLDialogElement>(null);
  const bookingService = useRef<HTMLSelectElement>(null);
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
          const requested = Number(line.quantity);
          if (!product || !Number.isFinite(requested) || requested <= 0) return [];
          return [
            {
              product,
              quantity: Math.min(product.stock, Math.max(1, Math.floor(requested))),
            },
          ];
        });
      } catch {
        window.localStorage.removeItem("tinh-cart");
      }
    }

    const frame = window.requestAnimationFrame(() => {
      setCatalogProducts(availableProducts);
      setCart(initialCart);
      setCartHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    window.localStorage.setItem(
      "tinh-cart",
      JSON.stringify(
        cart.map((line) => ({ id: line.product.id, quantity: line.quantity })),
      ),
    );
  }, [cart, cartHydrated]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("cart") !== "open") return;
    url.searchParams.delete("cart");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    const frame = window.requestAnimationFrame(() => {
      setCartOpen(true);
      window.requestAnimationFrame(() => cartClose.current?.focus());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const node = navSentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavCompact(!entry.isIntersecting),
      { threshold: 0.01 },
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
        (price === "under700" && product.price < 700000) ||
        (price === "700to1000" &&
          product.price >= 700000 &&
          product.price <= 1000000) ||
        (price === "over1000" && product.price > 1000000);
      return matchesSearch && matchesSkin && matchesConcern && matchesPrice;
    });
  }, [catalogProducts, concern, price, query, skin]);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );
  const discount = couponValid ? subtotal * 0.1 : 0;
  const hasActiveFilters =
    Boolean(query.trim()) ||
    skin !== "Tất cả" ||
    concern !== "Tất cả nhu cầu" ||
    price !== "all";

  const announce = (message: string, tone: ToastMessage["tone"] = "status") => {
    setToast({ id: Date.now(), message, tone });
  };

  const closeCommerceSurfaces = () => {
    setCartOpen(false);
    setMobileOpen(false);
    setMegaOpen(false);
    setChatOpen(false);
    if (bookingDialog.current?.open) {
      bookingDialog.current.close();
    }
  };

  const openCart = () => {
    setMobileOpen(false);
    setMegaOpen(false);
    setChatOpen(false);
    if (cart.length) {
      setCheckoutState("cart");
      setLastOrderId(null);
    }
    setCartOpen(true);
    window.requestAnimationFrame(() => cartClose.current?.focus());
  };

  const closeCart = () => {
    setCartOpen(false);
    if (checkoutState === "confirmed") {
      setCheckoutState("cart");
      setLastOrderId(null);
    }
    cartTrigger.current?.focus();
  };

  const toggleMobileMenu = () => {
    const next = !mobileOpen;
    closeCommerceSurfaces();
    setMobileOpen(next);
    if (next) {
      window.requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(".mobile-menu a, .mobile-menu button")?.focus(),
      );
    }
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    menuTrigger.current?.focus();
  };

  const toggleChat = () => {
    const next = !chatOpen;
    closeCommerceSurfaces();
    setChatOpen(next);
    if (next) window.requestAnimationFrame(() => chatInput.current?.focus());
    else chatTrigger.current?.focus();
  };

  const closeChat = () => {
    setChatOpen(false);
    chatTrigger.current?.focus();
  };

  const addToCart = (product: Product) => {
    setCart((current) => {
      const line = current.find((item) => item.product.id === product.id);
      if (line) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.product.stock, item.quantity + 1),
              }
            : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
    setAddedProductId(product.id);
    setBagPulse(false);
    window.requestAnimationFrame(() => setBagPulse(true));
    if (addedTimeout.current !== null) window.clearTimeout(addedTimeout.current);
    if (bagTimeout.current !== null) window.clearTimeout(bagTimeout.current);
    addedTimeout.current = window.setTimeout(() => setAddedProductId(null), 1800);
    bagTimeout.current = window.setTimeout(() => setBagPulse(false), 520);
  };

  const updateQuantity = (id: number, delta: number) => {
    const removesFocusedLine =
      delta < 0 && cart.find((line) => line.product.id === id)?.quantity === 1;
    setCart((current) =>
      current
        .map((line) =>
          line.product.id === id
            ? {
                ...line,
                quantity: Math.min(
                  line.product.stock,
                  Math.max(0, line.quantity + delta),
                ),
              }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
    if (removesFocusedLine) {
      window.requestAnimationFrame(() => cartClose.current?.focus());
    }
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

  const submitCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.length) return;
    const form = new FormData(event.currentTarget);
    const orderId = createCommerceId("DH");
    const total = subtotal - discount;
    setCheckoutState("processing");
    if (checkoutTimeout.current !== null) window.clearTimeout(checkoutTimeout.current);
    checkoutTimeout.current = window.setTimeout(() => {
      prependCommerceOrder({
        id: orderId,
        customer: String(form.get("name") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
        address: String(form.get("address") || "").trim(),
        payment: form.get("payment") === "bank" ? "bank" : "cod",
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
    bookingOpener.current = active.closest(".mobile-menu")
      ? menuTrigger.current
      : active.closest(".mega-panel")
        ? megaTrigger.current
        : active;
    closeCommerceSurfaces();
    setBookingState("idle");
    setBookingReference(null);
    bookingDialog.current?.showModal();
    window.requestAnimationFrame(() => bookingService.current?.focus());
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
    const service = services.find((item) => item.id === serviceId) ?? services[0];
    const appointmentId = createCommerceId("LH");
    setBookingState("submitting");
    if (bookingTimeout.current !== null) window.clearTimeout(bookingTimeout.current);
    bookingTimeout.current = window.setTimeout(() => {
      prependCommerceAppointment({
        id: appointmentId,
        customer: String(values.get("name") || "").trim(),
        phone: String(values.get("phone") || "").trim(),
        serviceId: service.id,
        service: service.name,
        date: String(values.get("date") || ""),
        time: String(values.get("time") || ""),
        note: String(values.get("note") || "").trim(),
        status: "Chờ xác nhận",
        createdAt: new Date().toISOString(),
      });
      setBookingReference(appointmentId);
      setBookingState("confirmed");
      form.reset();
    }, 680);
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
      setMessages((current) => [
        ...current,
        {
          from: "advisor",
          text: "Mình đã nhận được câu hỏi. Với da nhạy cảm, bạn có thể bắt đầu từ Soie 01 hoặc đặt buổi soi da 45 phút.",
        },
      ]);
    }, 500);
  };

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText("TINH10");
      setCouponCopied(true);
      if (copyTimeout.current !== null) window.clearTimeout(copyTimeout.current);
      copyTimeout.current = window.setTimeout(() => setCouponCopied(false), 1800);
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
        coupon={coupon}
        onCouponChange={handleCouponChange}
        couponValid={couponValid}
        onApplyCoupon={applyCoupon}
        subtotal={subtotal}
        discount={discount}
        checkoutState={checkoutState}
        onSetCheckoutState={setCheckoutState}
        onSubmitCheckout={submitCheckout}
        lastOrderId={lastOrderId}
        aria-modal="true"
        inert={!cartOpen}
      />

      <BookingDialog
        bookingDialogRef={bookingDialog}
        bookingServiceRef={bookingService}
        bookingState={bookingState}
        bookingReference={bookingReference}
        selectedServiceId={selectedServiceId}
        onSelectServiceId={setSelectedServiceId}
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
        messagesEndRef={messagesEnd}
      />

      <MobileBookingBar onOpenBooking={openBooking} />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
