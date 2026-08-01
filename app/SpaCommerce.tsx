"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleUserRound,
  Clock3,
  Menu,
  MessageCircle,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { articles, formatMoney, products, services, type Product } from "./data";

type CartLine = {
  product: Product;
  quantity: number;
};

type ToastMessage = {
  id: number;
  message: string;
  tone: "status" | "alert";
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
  const [checkingOut, setCheckingOut] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [navCompact, setNavCompact] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [bagPulse, setBagPulse] = useState(false);
  const [chatTyping, setChatTyping] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>("idle");
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
  const mobileMenu = useRef<HTMLElement>(null);
  const megaTrigger = useRef<HTMLButtonElement>(null);
  const chatTrigger = useRef<HTMLButtonElement>(null);
  const chatInput = useRef<HTMLInputElement>(null);
  const messagesEnd = useRef<HTMLSpanElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const skinSelect = useRef<HTMLSelectElement>(null);
  const concernSelect = useRef<HTMLSelectElement>(null);
  const priceSelect = useRef<HTMLSelectElement>(null);
  const addedTimeout = useRef<number | null>(null);
  const bagTimeout = useRef<number | null>(null);
  const copyTimeout = useRef<number | null>(null);
  const checkoutTimeout = useRef<number | null>(null);
  const chatTimeout = useRef<number | null>(null);
  const bookingTimeout = useRef<number | null>(null);
  const bookingConfirmation = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("tinh-cart");
    let initialCart: CartLine[] = [];
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed)) throw new Error("Invalid cart payload");
        initialCart = parsed.flatMap((candidate) => {
          if (!candidate || typeof candidate !== "object") return [];
          const line = candidate as { id?: unknown; quantity?: unknown };
          const product = products.find((item) => item.id === Number(line.id));
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
      setCart(initialCart);
      setCartHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    window.localStorage.setItem(
      "tinh-cart",
      JSON.stringify(cart.map((line) => ({ id: line.product.id, quantity: line.quantity }))),
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

  useEffect(() => {
    if (bookingState === "confirmed") bookingConfirmation.current?.focus();
  }, [bookingState]);

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
    return products.filter((product) => {
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
  }, [concern, price, query, skin]);

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
  };

  const openCart = () => {
    setMobileOpen(false);
    setMegaOpen(false);
    setChatOpen(false);
    setCartOpen(true);
    window.requestAnimationFrame(() => cartClose.current?.focus());
  };

  const closeCart = () => {
    setCartOpen(false);
    cartTrigger.current?.focus();
  };

  const toggleMobileMenu = () => {
    const next = !mobileOpen;
    closeCommerceSurfaces();
    setMobileOpen(next);
    if (next) {
      window.requestAnimationFrame(() =>
        mobileMenu.current?.querySelector<HTMLElement>("a, button")?.focus(),
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

  const trapCartFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!cartOpen || event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const trapMobileMenuFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!mobileOpen || event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
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

  const applyCoupon = () => {
    const valid = coupon.trim().toUpperCase() === "TINH10";
    setCouponValid(valid);
    if (!valid) announce("Mã chưa đúng. Thử TINH10.", "alert");
  };

  const checkout = () => {
    if (!cart.length) return;
    setCheckingOut(true);
    if (checkoutTimeout.current !== null) window.clearTimeout(checkoutTimeout.current);
    checkoutTimeout.current = window.setTimeout(() => {
      setCheckingOut(false);
      setCart([]);
      setCoupon("");
      setCouponValid(false);
      setCartOpen(false);
      cartTrigger.current?.focus();
      announce("Đơn hàng demo đã được tạo để quản trị viên xử lý.");
    }, 700);
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
    bookingDialog.current?.showModal();
    window.requestAnimationFrame(() => bookingService.current?.focus());
  };

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBookingState("submitting");
    if (bookingTimeout.current !== null) window.clearTimeout(bookingTimeout.current);
    bookingTimeout.current = window.setTimeout(() => {
      setBookingState("confirmed");
      form.reset();
    }, 650);
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

  const closeMegaAfterFilter = () => {
    setMegaOpen(false);
    window.requestAnimationFrame(() => megaTrigger.current?.focus());
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

  const returnFilterFocus = (control: HTMLElement | null) => {
    window.requestAnimationFrame(() => control?.focus());
  };

  return (
    <div
      className={`site-shell ${announcementVisible ? "" : "announcement-dismissed"}`}
    >
      <span className="nav-sentinel" ref={navSentinel} aria-hidden="true" />
      <header
        className={`site-header ${navCompact ? "is-compact" : ""} ${announcementVisible ? "" : "is-banner-dismissed"}`}
      >
        <div
          className={`announcement ${announcementVisible ? "" : "is-dismissed"}`}
          aria-hidden={!announcementVisible}
          inert={!announcementVisible}
        >
          <span>Miễn phí giao hàng từ 1.200.000 ₫</span>
          <div>
            <button type="button" onClick={copyCoupon}>
              {couponCopied ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  Đã sao chép
                </>
              ) : (
                "TINH10 · Sao chép mã"
              )}
            </button>
            <button
              className="announcement-close"
              type="button"
              aria-label="Ẩn thông báo ưu đãi"
              onClick={dismissAnnouncement}
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="site-nav">
        <div className="nav-inner">
          <Link
            className="wordmark"
            href="/"
            ref={wordmark}
            aria-label="TĨNH — Trang chủ"
          >
            TĨNH
            <span>skin atelier</span>
          </Link>

          <nav className="desktop-nav" aria-label="Điều hướng chính">
            <button
              className="nav-link"
              type="button"
              ref={megaTrigger}
              aria-expanded={megaOpen}
              aria-controls="product-mega-menu"
              onClick={() => {
                const next = !megaOpen;
                closeCommerceSurfaces();
                setMegaOpen(next);
              }}
            >
              Khám phá
              <ChevronDown
                className={`nav-chevron ${megaOpen ? "is-open" : ""}`}
                size={16}
                aria-hidden="true"
              />
            </button>
            <a className="nav-link" href="#catalogue">
              Sản phẩm
            </a>
            <a className="nav-link" href="#treatments">
              Liệu trình
            </a>
            <a className="nav-link" href="#journal">
              Kiến thức
            </a>
          </nav>

          <div className="nav-actions">
            <Link className="admin-link" href="/admin">
              Quản trị
            </Link>
            <button className="book-link desktop-book" type="button" onClick={openBooking}>
              Đặt lịch
            </button>
            <button
              className={`icon-button bag-button ${bagPulse ? "is-pulsing" : ""}`}
              type="button"
              ref={cartTrigger}
              aria-label={`Mở giỏ hàng, ${cartCount} sản phẩm`}
              aria-expanded={cartOpen}
              aria-controls="shopping-cart"
              onClick={openCart}
            >
              <ShoppingBag size={20} aria-hidden="true" />
              <span>{cartCount}</span>
            </button>
            <button
              className="icon-button mobile-menu-button"
              type="button"
              ref={menuTrigger}
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={toggleMobileMenu}
            >
              {mobileOpen ? (
                <X size={22} aria-hidden="true" />
              ) : (
                <Menu size={22} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`mega-panel ${megaOpen ? "is-open" : ""}`}
          id="product-mega-menu"
          aria-hidden={!megaOpen}
          inert={!megaOpen}
        >
          <div className="mega-inner">
            <div>
              <p className="mega-title">Chọn theo làn da</p>
              <a
                href="#catalogue"
                onClick={() => {
                  setSkin("Da nhạy cảm");
                  closeMegaAfterFilter();
                }}
              >
                <span>Da nhạy cảm</span>
                <small>Phục hồi và giảm quá tải routine</small>
              </a>
              <a
                href="#catalogue"
                onClick={() => {
                  setSkin("Da dầu");
                  closeMegaAfterFilter();
                }}
              >
                <span>Da dầu</span>
                <small>Làm sạch nhẹ, bảo vệ ráo mặt</small>
              </a>
            </div>
            <div>
              <p className="mega-title">Chọn theo nhu cầu</p>
              <a
                href="#catalogue"
                onClick={() => {
                  setConcern("Cấp ẩm");
                  closeMegaAfterFilter();
                }}
              >
                <span>Cấp ẩm</span>
                <small>Cân bằng lại cảm giác khô căng</small>
              </a>
              <a
                href="#catalogue"
                onClick={() => {
                  setConcern("Săn chắc");
                  closeMegaAfterFilter();
                }}
              >
                <span>Săn chắc</span>
                <small>Thiết bị và thao tác tại nhà</small>
              </a>
            </div>
            <button className="mega-feature" type="button" onClick={openBooking}>
              <span>Tư vấn riêng</span>
              <strong>Chưa biết bắt đầu ở đâu?</strong>
              <small>Soi da 45 phút và nhận routine theo ngân sách.</small>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

          <nav
            className={`mobile-menu ${mobileOpen ? "is-open" : ""}`}
            id="mobile-navigation"
            ref={mobileMenu}
            role="dialog"
            aria-modal="true"
            aria-label="Điều hướng di động"
            aria-hidden={!mobileOpen}
            inert={!mobileOpen}
            onKeyDown={trapMobileMenuFocus}
          >
            <a href="#catalogue" onClick={closeMobileMenu}>
              Sản phẩm
            </a>
            <a href="#treatments" onClick={closeMobileMenu}>
              Liệu trình
            </a>
            <a href="#journal" onClick={closeMobileMenu}>
              Kiến thức
            </a>
            <Link href="/admin">Quản trị</Link>
            <button type="button" onClick={openBooking}>
              Đặt lịch tư vấn
            </button>
          </nav>
        </div>
      </header>

      <button
        className={`nav-scrim ${megaOpen || mobileOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Đóng menu"
        aria-hidden={!megaOpen && !mobileOpen}
        inert={!megaOpen && !mobileOpen}
        onClick={() => {
          if (mobileOpen) closeMobileMenu();
          else {
            setMegaOpen(false);
            megaTrigger.current?.focus();
          }
        }}
      />

      <main inert={mobileOpen}>
        <section className="hero">
          <figure className="hero-media">
            <Image
              src="/hero-treatment.webp"
              alt="Chuyên viên nhỏ serum trong một buổi chăm sóc da tại TĨNH"
              width={1600}
              height={833}
              priority
              sizes="100vw"
            />
            <figcaption>
              Nghi thức phục hồi · 75 phút · Đặt theo lịch hẹn
            </figcaption>
          </figure>
          <div className="hero-copy">
            <div className="hero-register" aria-hidden="true">
              <span>01</span>
              <i />
              <span>TĨNH / 2026</span>
            </div>
            <p className="hero-kicker">Mỹ phẩm · Liệu trình · Một hồ sơ da</p>
            <h1>Một nghi thức, hai cách chăm da.</h1>
            <p className="hero-lede">
              Mua đúng sản phẩm cho những ngày ở nhà. Đặt đúng liệu trình cho
              những lúc làn da cần một bàn tay có chuyên môn.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#catalogue">
                Chọn sản phẩm
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <button className="text-action" type="button" onClick={openBooking}>
                Đặt lịch tư vấn
              </button>
            </div>
            <div className="hero-note">
              <CircleUserRound size={20} aria-hidden="true" />
              <span>
                Routine mua tại shop được lưu cùng ghi chú của chuyên viên.
              </span>
            </div>
          </div>
        </section>

        <section className="continuity">
          <div className="continuity-intro">
            <p>Điểm khác biệt của TĨNH</p>
            <h2>Shop và phòng trị liệu cùng đọc một câu chuyện về làn da.</h2>
          </div>
          <div className="continuity-flow" aria-label="Quy trình chăm sóc kết hợp">
            <article>
              <Package size={24} aria-hidden="true" />
              <span>Mang về nhà</span>
              <h3>Routine vừa đủ</h3>
              <p>Sản phẩm được lọc theo da, nhu cầu và khoảng giá bạn chọn.</p>
            </article>
            <span className="flow-rule" aria-hidden="true" />
            <article>
              <Sparkles size={24} aria-hidden="true" />
              <span>Thực hiện tại spa</span>
              <h3>Liệu trình có ngữ cảnh</h3>
              <p>Chuyên viên xem lại routine và ghi chú sau mỗi buổi hẹn.</p>
            </article>
          </div>
        </section>

        <section className="catalogue-section" id="catalogue">
          <header className="section-heading">
            <div>
              <h2>Chọn theo làn da hôm nay.</h2>
              <p>
                Sáu sản phẩm mẫu · giá và tồn kho dùng để trình diễn luồng mua hàng.
              </p>
            </div>
            <span aria-live="polite" aria-atomic="true">
              {filteredProducts.length} kết quả
            </span>
          </header>

          <div className="catalogue-tools">
            <label className="search-field">
              <span className="sr-only">Tìm sản phẩm</span>
              <Search size={18} aria-hidden="true" />
              <input
                ref={searchInput}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tên sản phẩm hoặc nhu cầu"
              />
            </label>
            <label>
              <span className="sr-only">Loại da</span>
              <select
                ref={skinSelect}
                value={skin}
                onChange={(event) => setSkin(event.target.value)}
              >
                {skinOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Nhu cầu</span>
              <select
                ref={concernSelect}
                value={concern}
                onChange={(event) => setConcern(event.target.value)}
              >
                {concernOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Mức giá</span>
              <select
                ref={priceSelect}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              >
                <option value="all">Mọi mức giá</option>
                <option value="under700">Dưới 700.000 ₫</option>
                <option value="700to1000">700.000–1.000.000 ₫</option>
                <option value="over1000">Trên 1.000.000 ₫</option>
              </select>
            </label>
            <button
              className="reset-filter"
              type="button"
              disabled={!hasActiveFilters}
              onClick={resetFilters}
            >
              <SlidersHorizontal size={17} aria-hidden="true" />
              Đặt lại
            </button>
          </div>

          <div
            className={`active-filters ${hasActiveFilters ? "has-items" : ""}`}
            aria-label="Bộ lọc đang dùng"
          >
            {query.trim() && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  returnFilterFocus(searchInput.current);
                }}
              >
                Tìm: {query.trim()}
                <X size={14} aria-hidden="true" />
              </button>
            )}
            {skin !== "Tất cả" && (
              <button
                type="button"
                onClick={() => {
                  setSkin("Tất cả");
                  returnFilterFocus(skinSelect.current);
                }}
              >
                {skin}
                <X size={14} aria-hidden="true" />
              </button>
            )}
            {concern !== "Tất cả nhu cầu" && (
              <button
                type="button"
                onClick={() => {
                  setConcern("Tất cả nhu cầu");
                  returnFilterFocus(concernSelect.current);
                }}
              >
                {concern}
                <X size={14} aria-hidden="true" />
              </button>
            )}
            {price !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setPrice("all");
                  returnFilterFocus(priceSelect.current);
                }}
              >
                {price === "under700"
                  ? "Dưới 700.000 ₫"
                  : price === "700to1000"
                    ? "700.000–1.000.000 ₫"
                    : "Trên 1.000.000 ₫"}
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {filteredProducts.length ? (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const quantityInCart =
                  cart.find((line) => line.product.id === product.id)?.quantity ?? 0;
                const atStockLimit = quantityInCart >= product.stock;
                const justAdded = addedProductId === product.id;

                return (
                  <article className="product-card" key={product.id}>
                  <Link
                    className="product-image"
                    href={`/san-pham/${product.slug}`}
                    aria-label={`Xem chi tiết ${product.name}`}
                  >
                    <Image
                      src={product.image}
                      alt={`${product.name}, sản phẩm ${product.category.toLocaleLowerCase("vi")}`}
                      width={600}
                      height={800}
                      loading="lazy"
                      sizes="(min-width: 960px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                    {product.stock <= 5 && <span>Sắp hết</span>}
                  </Link>
                  <div className="product-meta">
                    <div>
                      <p>{product.category}</p>
                      <h3>
                        <Link href={`/san-pham/${product.slug}`}>{product.name}</Link>
                      </h3>
                      <small>{product.note}</small>
                    </div>
                    <strong>{formatMoney(product.price)}</strong>
                  </div>
                  <button
                    className={`add-button ${justAdded ? "is-success" : ""}`}
                    type="button"
                    disabled={atStockLimit}
                    onClick={() => addToCart(product)}
                  >
                    {atStockLimit ? "Đã đủ tồn kho" : justAdded ? "Đã thêm" : "Thêm vào giỏ"}
                    {atStockLimit || justAdded ? (
                      <Check size={17} aria-hidden="true" />
                    ) : (
                      <Plus size={17} aria-hidden="true" />
                    )}
                  </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-results">
              <Search size={24} aria-hidden="true" />
              <h3>Chưa có sản phẩm khớp bộ lọc.</h3>
              <p>Thử bỏ bớt một tiêu chí hoặc đặt lại toàn bộ bộ lọc.</p>
              <button
                type="button"
                onClick={resetFilters}
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </section>

        <section className="treatment-section" id="treatments">
          <figure>
            <Image
              src="/consultation.webp"
              alt="Chuyên viên TĨNH kiểm tra tình trạng da trong buổi tư vấn"
              width={1280}
              height={956}
              loading="lazy"
              sizes="(min-width: 960px) 48vw, 100vw"
            />
          </figure>
          <div className="treatment-copy">
            <header>
              <p>Tư vấn & liệu trình</p>
              <h2>Đặt một buổi, mang về một kế hoạch.</h2>
              <span>
                Mỗi lịch hẹn bắt đầu bằng việc xem lại routine hiện tại — kể cả
                sản phẩm không mua tại TĨNH.
              </span>
            </header>
            <ol className="booking-steps">
              <li>
                <span>01</span>
                <div>
                  <h3>Chọn điều bạn cần</h3>
                  <p>Tư vấn routine, phục hồi hoặc làm sạch chuyên sâu.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>Chọn khung giờ</h3>
                  <p>Hệ thống giữ yêu cầu; lễ tân gọi lại để xác nhận.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Giữ hồ sơ da</h3>
                  <p>Ghi chú sau buổi hẹn nối tiếp với lịch mua sản phẩm.</p>
                </div>
              </li>
            </ol>
            <button className="primary-action" type="button" onClick={openBooking}>
              Chọn lịch phù hợp
              <CalendarDays size={18} aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="journal-section" id="journal">
          <header className="section-heading">
            <div>
              <h2>Đọc trước khi thêm một bước.</h2>
              <p>Kiến thức ngắn, đủ để ra quyết định chăm da bình tĩnh hơn.</p>
            </div>
            <a href="#journal-list">
              Xem thư viện
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </header>
          <div className="article-list" id="journal-list">
            {articles.map((article) => (
              <article key={article.title}>
                <span>{article.tag}</span>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <a href="#journal-list" aria-label={`Đọc ${article.title}`}>
                  {article.time}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer" inert={mobileOpen}>
        <p className="footer-statement">
          Chăm da tại nhà và tại spa nên là một câu chuyện liền mạch.
        </p>
        <div className="footer-meta">
          <Link className="wordmark footer-wordmark" href="/">
            TĨNH
          </Link>
          <div>
            <a href="#catalogue">Sản phẩm</a>
            <button type="button" onClick={openBooking}>
              Đặt lịch
            </button>
            <Link href="/admin">Quản trị demo</Link>
          </div>
          <span>Portfolio concept · 2026</span>
        </div>
      </footer>

      <aside
        className={`cart-drawer ${cartOpen ? "is-open" : ""}`}
        id="shopping-cart"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!cartOpen}
        inert={!cartOpen}
        onKeyDown={trapCartFocus}
      >
        <header>
          <div>
            <span id="cart-title">Giỏ hàng</span>
            <strong>{cartCount} sản phẩm</strong>
          </div>
          <button
            className="icon-button"
            type="button"
            ref={cartClose}
            aria-label="Đóng giỏ hàng"
            onClick={closeCart}
          >
            <X size={21} aria-hidden="true" />
          </button>
        </header>

        <div className="cart-lines">
          {cart.length ? (
            cart.map((line) => (
              <article className="cart-line" key={line.product.id}>
                <Image
                  src={line.product.image}
                  alt=""
                  width={90}
                  height={120}
                />
                <div>
                  <h3>{line.product.name}</h3>
                  <p>{formatMoney(line.product.price)}</p>
                  <div
                    className="quantity-control"
                    role="group"
                    aria-label={`Số lượng ${line.product.name}`}
                  >
                    <button
                      type="button"
                      aria-label={`Giảm số lượng ${line.product.name}`}
                      onClick={() => updateQuantity(line.product.id, -1)}
                    >
                      <Minus size={15} aria-hidden="true" />
                    </button>
                    <output aria-live="polite">{line.quantity}</output>
                    <button
                      type="button"
                      aria-label={`Tăng số lượng ${line.product.name}`}
                      disabled={line.quantity >= line.product.stock}
                      onClick={() => updateQuantity(line.product.id, 1)}
                    >
                      <Plus size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-cart">
              <ShoppingBag size={28} aria-hidden="true" />
              <h3>Giỏ hàng đang trống.</h3>
              <p>Thêm một sản phẩm để xem luồng đặt hàng demo.</p>
              <button type="button" onClick={closeCart}>
                Tiếp tục chọn
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-summary">
            <div className="coupon-row">
              <label>
                <span>Mã giảm giá</span>
                <input
                  aria-describedby={couponValid ? "coupon-success" : undefined}
                  value={coupon}
                  onChange={(event) => {
                    setCoupon(event.target.value);
                    setCouponValid(false);
                  }}
                  placeholder="Ví dụ: TINH10"
                />
              </label>
              <button type="button" onClick={applyCoupon}>
                {couponValid ? (
                  <>
                    <Check size={15} aria-hidden="true" />
                    Đã áp dụng
                  </>
                ) : (
                  "Áp dụng"
                )}
              </button>
            </div>
            {couponValid && (
              <p className="coupon-success" id="coupon-success" role="status">
                TINH10 đang giảm 10% cho đơn này.
              </p>
            )}
            <dl>
              <div>
                <dt>Tạm tính</dt>
                <dd>{formatMoney(subtotal)}</dd>
              </div>
              {couponValid && (
                <div>
                  <dt>Giảm 10%</dt>
                  <dd>−{formatMoney(discount)}</dd>
                </div>
              )}
              <div className="total-row">
                <dt>Tổng</dt>
                <dd>{formatMoney(subtotal - discount)}</dd>
              </div>
            </dl>
            <button
              className="checkout-button"
              type="button"
              disabled={checkingOut}
              aria-busy={checkingOut}
              onClick={checkout}
            >
              {checkingOut ? "Đang tạo đơn…" : "Đặt hàng demo"}
            </button>
            <small>Chưa kết nối cổng thanh toán trong bản portfolio.</small>
          </div>
        )}
      </aside>
      <button
        className={`drawer-scrim ${cartOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Đóng giỏ hàng"
        aria-hidden={!cartOpen}
        inert={!cartOpen}
        onClick={closeCart}
      />

      <dialog
        className="booking-dialog"
        ref={bookingDialog}
        aria-labelledby="booking-title"
        aria-describedby="booking-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        onClose={() => {
          if (bookingTimeout.current !== null) {
            window.clearTimeout(bookingTimeout.current);
            bookingTimeout.current = null;
          }
          setBookingState("idle");
          bookingOpener.current?.focus();
        }}
      >
        <form
          method="dialog"
          onSubmit={submitBooking}
          aria-busy={bookingState === "submitting"}
        >
          <header>
            <div>
              <span>Đặt lịch</span>
              <h2 id="booking-title">Chọn một khoảng dành cho làn da.</h2>
              <p id="booking-description">
                Gửi yêu cầu trước; lễ tân sẽ gọi lại để chốt giờ chính xác.
              </p>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Đóng biểu mẫu"
              onClick={() => bookingDialog.current?.close()}
            >
              <X size={21} aria-hidden="true" />
            </button>
          </header>
          {bookingState === "confirmed" ? (
            <div className="booking-confirmation" role="status">
              <span>
                <Check size={24} aria-hidden="true" />
              </span>
              <p>Yêu cầu đã được ghi nhận</p>
              <h3 ref={bookingConfirmation} tabIndex={-1}>
                TĨNH sẽ gọi để xác nhận khung giờ.
              </h3>
              <small>
                Bạn chưa cần thanh toán. Mọi thay đổi về dịch vụ có thể trao đổi
                khi lễ tân liên hệ.
              </small>
              <button
                className="primary-action"
                type="button"
                onClick={() => bookingDialog.current?.close()}
              >
                Hoàn tất
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <div className="booking-form-grid">
            <label>
              <span>Liệu trình</span>
              <select ref={bookingService} name="service" required defaultValue="">
                <option value="" disabled>
                  Chọn liệu trình
                </option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} · {formatMoney(service.price)}
                  </option>
                ))}
              </select>
              <small className="field-help">Bạn có thể đổi lựa chọn khi TĨNH gọi xác nhận.</small>
            </label>
            <label>
              <span>Ngày mong muốn</span>
              <input
                name="date"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
              />
              <small className="field-help">Mở lịch từ thứ Hai đến Chủ Nhật.</small>
            </label>
            <label>
              <span>Khung giờ</span>
              <select name="time" required defaultValue="">
                <option value="" disabled>
                  Chọn khung giờ
                </option>
                <option>09:00–11:00</option>
                <option>11:00–13:00</option>
                <option>14:00–16:00</option>
                <option>16:00–18:00</option>
                <option>18:00–20:00</option>
              </select>
              <small className="field-help">Lễ tân sẽ xác nhận giờ bắt đầu chính xác.</small>
            </label>
            <label>
              <span>Họ và tên</span>
              <input name="name" autoComplete="name" required placeholder="Nguyễn An" />
              <small className="field-help">Tên dùng để giữ lịch tại quầy.</small>
            </label>
            <label>
              <span>Số điện thoại</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                inputMode="tel"
                pattern="[0-9+\s]{9,14}"
                placeholder="090 123 4567"
              />
              <small className="field-help">TĨNH chỉ dùng số này để xác nhận lịch.</small>
            </label>
            <label className="full-field">
              <span>Điều bạn muốn chuyên viên biết</span>
              <textarea
                name="note"
                placeholder="Da đang nhạy cảm sau treatment, routine hiện có…"
              />
              <small className="field-help">Không cần ghi thông tin bệnh án nhạy cảm tại đây.</small>
            </label>
              </div>
              <footer>
                <p>
                  <Clock3 size={17} aria-hidden="true" />
                  Yêu cầu lịch chưa phải xác nhận cuối cùng.
                </p>
                <button
                  className="primary-action"
                  type="submit"
                  disabled={bookingState === "submitting"}
                >
                  {bookingState === "submitting" ? "Đang gửi…" : "Gửi yêu cầu lịch"}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </footer>
            </>
          )}
        </form>
      </dialog>

      <div
        className={`chat-panel ${chatOpen ? "is-open" : ""}`}
        id="advisor-chat"
        role="dialog"
        aria-labelledby="advisor-chat-title"
        aria-hidden={!chatOpen}
        inert={!chatOpen}
      >
        <header>
          <div>
            <span className="advisor-dot" aria-hidden="true" />
            <div>
              <strong id="advisor-chat-title">Tư vấn TĨNH</strong>
              <small>Đang trực tuyến · phản hồi demo</small>
            </div>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Đóng chat"
            onClick={closeChat}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div
          className="chat-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((message, index) => (
            <p className={message.from} key={`${message.from}-${index}`}>
              {message.text}
            </p>
          ))}
          {chatTyping && (
            <p className="advisor typing-message">
              <span />
              <span />
              <span />
              <span className="sr-only">Chuyên viên đang nhập</span>
            </p>
          )}
          <span ref={messagesEnd} aria-hidden="true" />
        </div>
        <form onSubmit={sendMessage} aria-busy={chatTyping}>
          <label>
            <span className="sr-only">Nhập câu hỏi</span>
            <input
              ref={chatInput}
              name="message"
              autoComplete="off"
              placeholder="Hỏi về da hoặc lịch hẹn"
            />
          </label>
          <button type="submit" aria-label="Gửi tin nhắn" disabled={chatTyping}>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
      <button
        className="chat-trigger"
        type="button"
        ref={chatTrigger}
        aria-label={chatOpen ? "Đóng tư vấn chat" : "Mở tư vấn chat"}
        aria-expanded={chatOpen}
        aria-controls="advisor-chat"
        onClick={toggleChat}
      >
        {chatOpen ? (
          <X size={21} aria-hidden="true" />
        ) : (
          <MessageCircle size={21} aria-hidden="true" />
        )}
        <span>{chatOpen ? "Đóng" : "Tư vấn"}</span>
      </button>

      <aside className="mobile-booking-bar">
        <span>Tư vấn da · từ 350.000 ₫</span>
        <button type="button" onClick={openBooking}>
          Đặt lịch
        </button>
      </aside>

      {toast && (
        <div
          className={`toast toast-${toast.tone}`}
          role={toast.tone === "alert" ? "alert" : "status"}
          key={toast.id}
        >
          {toast.tone === "alert" ? (
            <X size={18} aria-hidden="true" />
          ) : (
            <Check size={18} aria-hidden="true" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
