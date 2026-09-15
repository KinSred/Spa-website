"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Compass,
  Droplets,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatMoney, type Product } from "../../data";

export default function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addedQuantity, setAddedQuantity] = useState<number | null>(null);
  const addedTimeout = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (addedTimeout.current !== null) window.clearTimeout(addedTimeout.current);
    },
    [],
  );

  const addToCart = () => {
    const saved = window.localStorage.getItem("tinh-cart");
    let cart: { id: number; quantity: number }[] = [];
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed)) throw new Error("Invalid cart payload");
        cart = parsed.flatMap((candidate) => {
          if (!candidate || typeof candidate !== "object") return [];
          const line = candidate as { id?: unknown; quantity?: unknown };
          const id = Number(line.id);
          const savedQuantity = Number(line.quantity);
          if (!Number.isFinite(id) || !Number.isFinite(savedQuantity) || savedQuantity <= 0) {
            return [];
          }
          return [{ id, quantity: Math.floor(savedQuantity) }];
        });
      } catch {
        cart = [];
      }
    }
    const existing = cart.find((line) => line.id === product.id);
    let addedNow = quantity;
    if (existing) {
      const before = Math.min(product.stock, Math.max(0, existing.quantity));
      existing.quantity = Math.min(product.stock, before + quantity);
      addedNow = existing.quantity - before;
    } else {
      addedNow = Math.min(product.stock, quantity);
      cart.push({ id: product.id, quantity: addedNow });
    }
    window.localStorage.setItem("tinh-cart", JSON.stringify(cart));
    setAdded(true);
    setAddedQuantity(addedNow);
    if (addedTimeout.current !== null) window.clearTimeout(addedTimeout.current);
    addedTimeout.current = window.setTimeout(() => {
      setAdded(false);
      setAddedQuantity(null);
    }, 2500);
  };

  const itemIndex = String(product.id).padStart(2, "0");
  const detailLabel =
    product.category === "Thiết bị"
      ? "Đặc điểm chính"
      : "Thành phần trọng tâm";

  return (
    <main className="pdp-experience">
      {/* Architectural Breadcrumb Header */}
      <header className="pdp-header-bar">
        <div className="pdp-header-container">
          <nav className="pdp-breadcrumb" aria-label="Đường dẫn trang">
            <Link className="pdp-brand-mark" href="/" aria-label="TĨNH - Về trang chủ">
              TĨNH <span>atelier</span>
            </Link>
            <span className="pdp-breadcrumb-sep">/</span>
            <Link className="pdp-breadcrumb-link" href="/#catalogue">
              Cửa hàng
            </Link>
            <span className="pdp-breadcrumb-sep">/</span>
            <span className="pdp-breadcrumb-current">{product.category}</span>
          </nav>

          <Link className="pdp-back-action" href="/#catalogue">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Trở lại cửa hàng</span>
          </Link>
        </div>
      </header>

      {/* Main Luxury Commerce Showcase */}
      <section className="pdp-layout-grid" aria-label={`Chi tiết sản phẩm ${product.name}`}>
        {/* Left Column: Visual Stage & Ritual Narrative */}
        <div className="pdp-visual-column">
          <div className="pdp-image-stage">
            <div className="pdp-image-frame">
              <Image
                src={product.image}
                alt={`${product.name}, ${product.note}`}
                width={800}
                height={1000}
                unoptimized
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="pdp-badge-stamp">
                <span>FORMULATION</span>
                <strong>{itemIndex}</strong>
              </div>
            </div>

            <div className="pdp-stage-caption">
              <span className="caption-label">QUY CÁCH ĐÓNG GÓI</span>
              <span className="caption-val">{product.note}</span>
            </div>
          </div>

          {/* Sensory Ritual Monograph Card */}
          <div className="pdp-ritual-monograph">
            <div className="monograph-header">
              <Clock size={16} aria-hidden="true" />
              <h3>Hướng dẫn sử dụng tại nhà</h3>
            </div>
            <p className="monograph-usage">{product.usage}</p>
          </div>
        </div>

        {/* Right Column: Formulation Identity & Purchase Architecture */}
        <div className="pdp-commercial-column">
          {/* Identity Block */}
          <div className="pdp-identity-block">
            <div className="pdp-meta-ribbon">
              <span className="pdp-category-tag">{product.category}</span>
              <span className="pdp-meta-dot">·</span>
              <span className="pdp-skin-target">Dành cho: {product.skin.join(", ")}</span>
            </div>

            <h1 className="pdp-title">{product.name}</h1>
            <p className="pdp-sensory-sub">{product.note}</p>

            <div className="pdp-pricing-row">
              <div className="pdp-price-group">
                <span className="price-lead-label">Giá</span>
                <strong className="pdp-main-price">{formatMoney(product.price)}</strong>
              </div>

              <div className="pdp-stock-badge">
                {product.stock <= 5 ? (
                  <span className="stock-warning">Chỉ còn {product.stock} sản phẩm</span>
                ) : (
                  <span className="stock-available">Còn hàng ({product.stock})</span>
                )}
              </div>
            </div>
          </div>

          {/* Purchase Action Box */}
          <div className="pdp-action-box">
            <div className="pdp-action-row">
              <div
                className="pdp-stepper-control"
                role="group"
                aria-label={`Số lượng ${product.name}`}
              >
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  disabled={quantity === 1}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  <Minus size={15} aria-hidden="true" />
                </button>
                <output aria-live="polite">{quantity}</output>
                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  disabled={quantity >= product.stock}
                  onClick={() =>
                    setQuantity((current) => Math.min(product.stock, current + 1))
                  }
                >
                  <Plus size={15} aria-hidden="true" />
                </button>
              </div>

              <button
                className={`pdp-add-button ${added ? "is-added" : ""}`}
                type="button"
                disabled={product.stock === 0}
                onClick={addToCart}
              >
                {product.stock === 0 ? (
                  <span>Hết hàng</span>
                ) : added ? (
                  <>
                    <Check size={18} aria-hidden="true" />
                    <span>{addedQuantity === 0 ? "Đã chọn tối đa" : "Đã thêm vào giỏ"}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} aria-hidden="true" />
                    <span>Thêm · {formatMoney(product.price * quantity)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Dynamic Cart Feedback */}
            <div className="pdp-feedback-banner">
              <span role="status" aria-live="polite">
                {added
                  ? addedQuantity && addedQuantity > 0
                    ? `${addedQuantity} sản phẩm vừa được lưu trong giỏ.`
                    : "Giỏ đã đạt số lượng tồn kho hiện có."
                  : quantity >= product.stock
                    ? `Đã chọn tối đa ${product.stock} sản phẩm còn lại.`
                    : `Chọn số lượng trước khi thêm vào giỏ.`}
              </span>
              {added && (
                <Link className="pdp-cart-link" href="/?cart=open">
                  Xem giỏ hàng
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>

          {/* Formulation & Ingredient Dossier */}
          <div className="pdp-dossier-accordion">
            <div className="dossier-section">
              <h2 className="dossier-heading">Mô tả công thức</h2>
              <p className="dossier-text">{product.description}</p>
            </div>

            <div className="dossier-section">
              <h2 className="dossier-heading">{detailLabel}</h2>
              <ul className="dossier-ingredient-grid">
                {product.ingredients.map((ingredient) => (
                  <li key={ingredient} className="dossier-ingredient-pill">
                    <Sparkles size={14} aria-hidden="true" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dossier-section">
              <h2 className="dossier-heading">Thông tin phù hợp</h2>
              <dl className="dossier-specs-list">
                <div className="dossier-spec-row">
                  <dt>
                    <Compass size={14} aria-hidden="true" />
                    Loại da
                  </dt>
                  <dd>{product.skin.join(" · ")}</dd>
                </div>
                <div className="dossier-spec-row">
                  <dt>
                    <ShieldCheck size={14} aria-hidden="true" />
                    Nhu cầu chăm sóc
                  </dt>
                  <dd>{product.concern.join(" · ")}</dd>
                </div>
                <div className="dossier-spec-row">
                  <dt>
                    <Droplets size={14} aria-hidden="true" />
                    Đặc điểm sản phẩm
                  </dt>
                  <dd>{product.note}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Atelier Consultation Bridge */}
          <Link className="pdp-consultation-card" href="/#treatments">
            <div className="consult-text">
              <strong>Tham khảo dịch vụ Soi da &amp; thiết kế routine</strong>
              <p>Phân tích bề mặt da, thói quen và xây routine có thể mua theo từng bước. Xem lịch tư vấn tại phòng cabine.</p>
            </div>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
