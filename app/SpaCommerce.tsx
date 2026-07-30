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
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponValid, setCouponValid] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [toast, setToast] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "advisor",
      text: "Chào bạn, mình có thể giúp chọn routine hoặc khung giờ liệu trình.",
    },
  ]);
  const bookingDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("tinh-cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { id: number; quantity: number }[];
        const timeout = window.setTimeout(() => {
          setCart(
            parsed
              .map((line) => ({
                product: products.find((product) => product.id === line.id)!,
                quantity: line.quantity,
              }))
              .filter((line) => line.product),
          );
        }, 0);
        return () => window.clearTimeout(timeout);
      } catch {
        window.localStorage.removeItem("tinh-cart");
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "tinh-cart",
      JSON.stringify(cart.map((line) => ({ id: line.product.id, quantity: line.quantity }))),
    );
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

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

  const addToCart = (product: Product) => {
    setCart((current) => {
      const line = current.find((item) => item.product.id === product.id);
      if (line) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
    setToast(`${product.name} đã được thêm vào giỏ.`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((current) =>
      current
        .map((line) =>
          line.product.id === id
            ? { ...line, quantity: Math.max(0, line.quantity + delta) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  const applyCoupon = () => {
    const valid = coupon.trim().toUpperCase() === "TINH10";
    setCouponValid(valid);
    setToast(valid ? "Đã áp dụng TINH10 — giảm 10%." : "Mã chưa đúng. Thử TINH10.");
  };

  const checkout = () => {
    if (!cart.length) return;
    setCheckingOut(true);
    window.setTimeout(() => {
      setCheckingOut(false);
      setCart([]);
      setCartOpen(false);
      setToast("Đơn hàng demo đã được tạo để quản trị viên xử lý.");
    }, 700);
  };

  const openBooking = () => {
    setMobileOpen(false);
    bookingDialog.current?.showModal();
  };

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    bookingDialog.current?.close();
    setToast("Lịch hẹn đã được ghi nhận. TĨNH sẽ gọi xác nhận khung giờ.");
    event.currentTarget.reset();
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = String(form.get("message") || "").trim();
    if (!text) return;
    setMessages((current) => [...current, { from: "user", text }]);
    event.currentTarget.reset();
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          from: "advisor",
          text: "Mình đã nhận được câu hỏi. Với da nhạy cảm, bạn có thể bắt đầu từ Soie 01 hoặc đặt buổi soi da 45 phút.",
        },
      ]);
    }, 500);
  };

  return (
    <div className="site-shell">
      <div className="announcement">
        <span>Miễn phí giao hàng từ 1.200.000 ₫</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText("TINH10");
            setToast("Đã sao chép mã TINH10.");
          }}
        >
          TINH10 · Sao chép mã
        </button>
      </div>

      <header className="site-nav">
        <div className="nav-inner">
          <Link className="wordmark" href="/" aria-label="TĨNH — Trang chủ">
            TĨNH
            <span>skin atelier</span>
          </Link>

          <nav className="desktop-nav" aria-label="Điều hướng chính">
            <button
              className="nav-link"
              type="button"
              aria-expanded={megaOpen}
              aria-controls="product-mega-menu"
              onClick={() => setMegaOpen((open) => !open)}
            >
              Khám phá
              <ChevronDown size={16} aria-hidden="true" />
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
              className="icon-button bag-button"
              type="button"
              aria-label={`Mở giỏ hàng, ${cartCount} sản phẩm`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag size={20} aria-hidden="true" />
              <span>{cartCount}</span>
            </button>
            <button
              className="icon-button mobile-menu-button"
              type="button"
              aria-label="Mở menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div
          className={`mega-panel ${megaOpen ? "is-open" : ""}`}
          id="product-mega-menu"
          aria-hidden={!megaOpen}
        >
          <div className="mega-inner">
            <div>
              <p className="mega-title">Chọn theo làn da</p>
              <a href="#catalogue" onClick={() => setSkin("Da nhạy cảm")}>
                <span>Da nhạy cảm</span>
                <small>Phục hồi và giảm quá tải routine</small>
              </a>
              <a href="#catalogue" onClick={() => setSkin("Da dầu")}>
                <span>Da dầu</span>
                <small>Làm sạch nhẹ, bảo vệ ráo mặt</small>
              </a>
            </div>
            <div>
              <p className="mega-title">Chọn theo nhu cầu</p>
              <a href="#catalogue" onClick={() => setConcern("Cấp ẩm")}>
                <span>Cấp ẩm</span>
                <small>Cân bằng lại cảm giác khô căng</small>
              </a>
              <a href="#catalogue" onClick={() => setConcern("Săn chắc")}>
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

        {mobileOpen && (
          <div className="mobile-menu">
            <a href="#catalogue" onClick={() => setMobileOpen(false)}>
              Sản phẩm
            </a>
            <a href="#treatments" onClick={() => setMobileOpen(false)}>
              Liệu trình
            </a>
            <a href="#journal" onClick={() => setMobileOpen(false)}>
              Kiến thức
            </a>
            <Link href="/admin">Quản trị</Link>
            <button type="button" onClick={openBooking}>
              Đặt lịch tư vấn
            </button>
          </div>
        )}
      </header>

      {megaOpen && (
        <button
          className="nav-scrim"
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMegaOpen(false)}
        />
      )}

      <main>
        <section className="hero">
          <div className="hero-copy">
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
          <figure className="hero-media">
            <Image
              src="/hero-treatment.webp"
              alt="Chuyên viên nhỏ serum trong một buổi chăm sóc da tại TĨNH"
              width={1600}
              height={833}
              priority
              sizes="(min-width: 960px) 54vw, 100vw"
            />
            <figcaption>
              Nghi thức phục hồi · 75 phút · Đặt theo lịch hẹn
            </figcaption>
          </figure>
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
            <span>{filteredProducts.length} kết quả</span>
          </header>

          <div className="catalogue-tools">
            <label className="search-field">
              <span className="sr-only">Tìm sản phẩm</span>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tên sản phẩm hoặc nhu cầu"
              />
            </label>
            <label>
              <span className="sr-only">Loại da</span>
              <select value={skin} onChange={(event) => setSkin(event.target.value)}>
                {skinOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Nhu cầu</span>
              <select
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
              <select value={price} onChange={(event) => setPrice(event.target.value)}>
                <option value="all">Mọi mức giá</option>
                <option value="under700">Dưới 700.000 ₫</option>
                <option value="700to1000">700.000–1.000.000 ₫</option>
                <option value="over1000">Trên 1.000.000 ₫</option>
              </select>
            </label>
            <button
              className="reset-filter"
              type="button"
              onClick={() => {
                setQuery("");
                setSkin("Tất cả");
                setConcern("Tất cả nhu cầu");
                setPrice("all");
              }}
            >
              <SlidersHorizontal size={17} aria-hidden="true" />
              Đặt lại
            </button>
          </div>

          {filteredProducts.length ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
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
                    className="add-button"
                    type="button"
                    onClick={() => addToCart(product)}
                  >
                    Thêm vào giỏ
                    <Plus size={17} aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <Search size={24} aria-hidden="true" />
              <h3>Chưa có sản phẩm khớp bộ lọc.</h3>
              <p>Thử bỏ bớt một tiêu chí hoặc đặt lại toàn bộ bộ lọc.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSkin("Tất cả");
                  setConcern("Tất cả nhu cầu");
                  setPrice("all");
                }}
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

      <footer className="site-footer">
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

      <aside className={`cart-drawer ${cartOpen ? "is-open" : ""}`} aria-hidden={!cartOpen}>
        <header>
          <div>
            <span>Giỏ hàng</span>
            <strong>{cartCount} sản phẩm</strong>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Đóng giỏ hàng"
            onClick={() => setCartOpen(false)}
          >
            <X size={21} />
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
                  <div className="quantity-control">
                    <button
                      type="button"
                      aria-label={`Giảm số lượng ${line.product.name}`}
                      onClick={() => updateQuantity(line.product.id, -1)}
                    >
                      <Minus size={15} />
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Tăng số lượng ${line.product.name}`}
                      onClick={() => updateQuantity(line.product.id, 1)}
                    >
                      <Plus size={15} />
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
              <button type="button" onClick={() => setCartOpen(false)}>
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
                  value={coupon}
                  onChange={(event) => {
                    setCoupon(event.target.value);
                    setCouponValid(false);
                  }}
                  placeholder="Ví dụ: TINH10"
                />
              </label>
              <button type="button" onClick={applyCoupon}>
                Áp dụng
              </button>
            </div>
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
      {cartOpen && (
        <button
          className="drawer-scrim"
          type="button"
          aria-label="Đóng giỏ hàng"
          onClick={() => setCartOpen(false)}
        />
      )}

      <dialog className="booking-dialog" ref={bookingDialog}>
        <form method="dialog" onSubmit={submitBooking}>
          <header>
            <div>
              <span>Đặt lịch</span>
              <h2>Chọn một khoảng dành cho làn da.</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Đóng biểu mẫu"
              onClick={() => bookingDialog.current?.close()}
            >
              <X size={21} />
            </button>
          </header>
          <div className="booking-form-grid">
            <label>
              <span>Liệu trình</span>
              <select name="service" required defaultValue="">
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
            <button className="primary-action" type="submit">
              Gửi yêu cầu lịch
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </footer>
        </form>
      </dialog>

      <div className={`chat-panel ${chatOpen ? "is-open" : ""}`}>
        <header>
          <div>
            <span className="advisor-dot" />
            <div>
              <strong>Tư vấn TĨNH</strong>
              <small>Đang trực tuyến · phản hồi demo</small>
            </div>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Đóng chat"
            onClick={() => setChatOpen(false)}
          >
            <X size={20} />
          </button>
        </header>
        <div className="chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <p className={message.from} key={`${message.from}-${index}`}>
              {message.text}
            </p>
          ))}
        </div>
        <form onSubmit={sendMessage}>
          <label>
            <span className="sr-only">Nhập câu hỏi</span>
            <input name="message" placeholder="Hỏi về da hoặc lịch hẹn" />
          </label>
          <button type="submit" aria-label="Gửi tin nhắn">
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
      <button
        className="chat-trigger"
        type="button"
        aria-label={chatOpen ? "Đóng tư vấn chat" : "Mở tư vấn chat"}
        aria-expanded={chatOpen}
        onClick={() => setChatOpen((open) => !open)}
      >
        {chatOpen ? <X size={21} /> : <MessageCircle size={21} />}
        <span>{chatOpen ? "Đóng" : "Tư vấn"}</span>
      </button>

      <aside className="mobile-booking-bar">
        <span>Tư vấn da · từ 350.000 ₫</span>
        <button type="button" onClick={openBooking}>
          Đặt lịch
        </button>
      </aside>

      {toast && (
        <div className="toast" role="status">
          <Check size={18} aria-hidden="true" />
          {toast}
        </div>
      )}
    </div>
  );
}
