"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
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

  return (
    <main className="detail-page detail-view purchase-studio">
      {/* Editorial Navigation Bar */}
      <header className="detail-nav studio-nav">
        <div className="studio-nav-brand">
          <Link className="wordmark" href="/" aria-label="TĨNH - Về trang chủ">
            TĨNH
            <span>skin atelier</span>
          </Link>
          <span className="studio-nav-pill" aria-hidden="true">
            HỒ SƠ CÔNG THỨC · FORMULE {itemIndex}
          </span>
        </div>

        <Link className="back-link" href="/#catalogue">
          <ArrowLeft size={17} aria-hidden="true" />
          Trở lại cửa hàng
        </Link>
      </header>

      {/* Main Luxury Purchase Studio Canvas */}
      <section className="product-detail studio-canvas" aria-label={`Chi tiết sản phẩm ${product.name}`}>
        {/* Left Column: Photo Studio Stage & Formulation Badges */}
        <div className="studio-gallery-stage">
          <figure className="detail-image studio-figure">
            <Image
              src={product.image}
              alt={`${product.name}, ${product.note}`}
              width={700}
              height={900}
              unoptimized
              priority
              sizes="(min-width: 960px) 48vw, 100vw"
            />
            <div className="studio-image-badges" aria-label="Thông tin mẻ điều chế">
              <span className="formulation-stamp">
                DOSSIER · FORMULE {itemIndex}
              </span>
              {product.stock <= 5 ? (
                <figcaption className="studio-stock-alert">
                  Chỉ còn {product.stock} sản phẩm
                </figcaption>
              ) : (
                <span className="studio-stock-ready">
                  Còn {product.stock} sản phẩm
                </span>
              )}
            </div>
          </figure>

          {/* Canonical Formulation Highlights */}
          <div className="studio-formula-highlights" aria-label="Đặc tính công thức">
            <div className="highlight-item">
              <Sparkles size={16} aria-hidden="true" />
              <span>Phù hợp: {product.skin.slice(0, 2).join(" · ")}</span>
            </div>
            <div className="highlight-item">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Mục tiêu: {product.concern[0]}</span>
            </div>
            <div className="highlight-item">
              <Clock size={16} aria-hidden="true" />
              <span>Quy cách: {product.note}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Formulation Monograph & Purchase Console */}
        <div className="detail-copy studio-dossier-console">
          <div className="detail-title studio-title-block">
            <div className="studio-kicker-row">
              <span className="category-kicker">{product.category}</span>
              <span className="skin-match-tag">{product.skin[0]}</span>
            </div>

            <h1 className="studio-product-heading">{product.name}</h1>

            <span className="studio-sensorial-note">{product.note}</span>

            <div className="studio-price-block">
              <span className="price-lead-label">Giá</span>
              <strong className="studio-price-display">{formatMoney(product.price)}</strong>
            </div>
          </div>

          <p className="detail-description studio-description-text">{product.description}</p>

          <dl className="detail-specs studio-specs-grid">
            <div className="spec-item">
              <dt>Phù hợp</dt>
              <dd>{product.skin.join(" · ")}</dd>
            </div>
            <div className="spec-item">
              <dt>Nhu cầu</dt>
              <dd>{product.concern.join(" · ")}</dd>
            </div>
            <div className="spec-item">
              <dt>Cách dùng</dt>
              <dd>{product.usage}</dd>
            </div>
          </dl>

          <div className="ingredient-list studio-ingredients-section">
            <h2>Điểm chính trong công thức</h2>
            <ul className="studio-ingredients-list">
              {product.ingredients.map((ingredient) => (
                <li key={ingredient}>
                  <Check size={16} aria-hidden="true" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tactile Purchase Action Dock */}
          <div className="detail-purchase studio-purchase-dock">
            <div
              className="quantity-control detail-quantity studio-quantity-stepper"
              role="group"
              aria-label={`Số lượng ${product.name}`}
            >
              <button
                type="button"
                aria-label="Giảm số lượng"
                disabled={quantity === 1}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <Minus size={16} aria-hidden="true" />
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
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>

            <button
              className={`detail-add studio-add-cta ${added ? "is-success" : ""}`}
              type="button"
              disabled={product.stock === 0}
              onClick={addToCart}
            >
              {added ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <ShoppingBag size={18} aria-hidden="true" />
              )}
              {added
                ? addedQuantity === 0
                  ? "Đã đủ tồn kho"
                  : "Đã thêm vào giỏ"
                : `Thêm · ${formatMoney(product.price * quantity)}`}
            </button>
          </div>

          {/* Dynamic Cart & Stock Feedback */}
          <div className="detail-purchase-meta studio-purchase-meta">
            <span role="status" aria-live="polite">
              {added
                ? addedQuantity && addedQuantity > 0
                  ? `${addedQuantity} sản phẩm vừa được lưu trong giỏ.`
                  : "Giỏ đã đạt số lượng tồn kho hiện có."
                : quantity >= product.stock
                  ? `Đã chọn tối đa ${product.stock} sản phẩm còn lại.`
                  : `Còn ${product.stock} sản phẩm.`}
            </span>
            {added && (
              <Link className="studio-view-cart-link" href="/?cart=open">
                Xem giỏ hàng
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>

          {/* Atelier Consultation Bridge */}
          <Link className="consult-link studio-consultation-bridge" href="/#treatments">
            <div className="bridge-copy">
              <strong>Chưa chắc sản phẩm phù hợp? Xem lịch tư vấn</strong>
              <p>Chuyên viên TĨNH sẽ soi da và hướng dẫn chu trình kết hợp tại atelier.</p>
            </div>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
