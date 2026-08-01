"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag } from "lucide-react";
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

  return (
    <main className="detail-page detail-view">
      <header className="detail-nav">
        <Link className="wordmark" href="/">
          TĨNH
          <span>skin atelier</span>
        </Link>
        <Link className="back-link" href="/#catalogue">
          <ArrowLeft size={17} aria-hidden="true" />
          Trở lại cửa hàng
        </Link>
      </header>

      <section className="product-detail">
        <figure className="detail-image">
          <Image
            src={product.image}
            alt={`${product.name}, ${product.note}`}
            width={600}
            height={800}
            unoptimized
            priority
            sizes="(min-width: 960px) 48vw, 100vw"
          />
          {product.stock <= 5 && <figcaption>Chỉ còn {product.stock} sản phẩm</figcaption>}
        </figure>

        <div className="detail-copy">
          <div className="detail-title">
            <p>{product.category}</p>
            <h1>{product.name}</h1>
            <span>{product.note}</span>
            <strong>{formatMoney(product.price)}</strong>
          </div>

          <p className="detail-description">{product.description}</p>

          <dl className="detail-specs">
            <div>
              <dt>Phù hợp</dt>
              <dd>{product.skin.join(" · ")}</dd>
            </div>
            <div>
              <dt>Nhu cầu</dt>
              <dd>{product.concern.join(" · ")}</dd>
            </div>
            <div>
              <dt>Cách dùng</dt>
              <dd>{product.usage}</dd>
            </div>
          </dl>

          <div className="ingredient-list">
            <h2>Điểm chính trong công thức</h2>
            <ul>
              {product.ingredients.map((ingredient) => (
                <li key={ingredient}>
                  <Check size={16} aria-hidden="true" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-purchase">
            <div
              className="quantity-control detail-quantity"
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
              className={`detail-add ${added ? "is-success" : ""}`}
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

          <div className="detail-purchase-meta">
            <span role="status" aria-live="polite">
              {added
                ? addedQuantity && addedQuantity > 0
                  ? `${addedQuantity} sản phẩm vừa được lưu trong giỏ.`
                  : "Giỏ đã đạt số lượng tồn kho hiện có."
                : quantity >= product.stock
                  ? `Đã chọn tối đa ${product.stock} sản phẩm còn lại.`
                  : `${product.stock} sản phẩm đang có sẵn.`}
            </span>
            {added && (
              <Link href="/?cart=open">
                Xem giỏ hàng
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>

          <Link className="consult-link" href="/#treatments">
            Chưa chắc sản phẩm phù hợp? Xem lịch tư vấn
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
