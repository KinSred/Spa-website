"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { formatMoney, type Product } from "../../data";

export default function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    const saved = window.localStorage.getItem("tinh-cart");
    let cart: { id: number; quantity: number }[] = [];
    if (saved) {
      try {
        cart = JSON.parse(saved);
      } catch {
        cart = [];
      }
    }
    const existing = cart.find((line) => line.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: product.id, quantity });
    }
    window.localStorage.setItem("tinh-cart", JSON.stringify(cart));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  };

  return (
    <main className="detail-page">
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
            priority
            sizes="(min-width: 960px) 48vw, 100vw"
          />
          {product.stock <= 5 && <figcaption>Chỉ còn {product.stock} sản phẩm mẫu</figcaption>}
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
            <div className="quantity-control detail-quantity">
              <button
                type="button"
                aria-label="Giảm số lượng"
                disabled={quantity === 1}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Tăng số lượng"
                onClick={() => setQuantity((current) => current + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className={`detail-add ${added ? "is-success" : ""}`}
              type="button"
              onClick={addToCart}
            >
              {added ? <Check size={18} /> : <ShoppingBag size={18} />}
              {added ? "Đã thêm vào giỏ" : `Thêm · ${formatMoney(product.price * quantity)}`}
            </button>
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
