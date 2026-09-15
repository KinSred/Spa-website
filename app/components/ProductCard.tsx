"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Plus, Sparkles } from "lucide-react";
import { formatMoney, type Product } from "../data";

type ProductCardProps = {
  product: Product;
  quantityInCart: number;
  justAdded: boolean;
  onAddToCart: (product: Product) => void;
  index?: number;
};

export function ProductCard({
  product,
  quantityInCart,
  justAdded,
  onAddToCart,
  index = 0,
}: ProductCardProps) {
  const atStockLimit = quantityInCart >= product.stock;
  const itemIndex = String(index + 1).padStart(2, "0");

  return (
    <article className="formulation-item product-card-editorial">
      {/* Visual Presentation Dock */}
      <div className="item-visual-dock card-stage">
        <Link
          className="item-image-anchor card-image-link"
          href={`/san-pham/${product.slug}`}
          aria-label={`Xem chi tiết ${product.name}`}
        >
          <div className="item-image-wrapper card-image-wrap">
            <Image
              src={product.image}
              alt={`${product.name}, ${product.note}`}
              width={600}
              height={800}
              unoptimized
              loading="lazy"
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
            />
          </div>

          {/* Editorial Index Stamp */}
          <span className="item-numeral-stamp card-index-stamp">
            <span>FORMULE</span>
            <strong>{itemIndex}</strong>
          </span>

          {/* Availability or Texture Status */}
          {product.stock <= 5 ? (
            <span className="item-stock-pill card-stock-pill">Chỉ còn {product.stock}</span>
          ) : (
            <span className="item-texture-pill card-texture-pill">{product.note.split("·")[1]?.trim() || product.note}</span>
          )}
        </Link>
      </div>

      {/* Formulation Monograph Body */}
      <div className="item-monograph-body card-dossier">
        <div className="item-taxonomy-rail card-meta-rail">
          <span className="item-category card-category">{product.category}</span>
          <span className="item-taxonomy-sep" aria-hidden="true">/</span>
          <span className="item-skin-target card-skin-target">{product.skin[0]}</span>
        </div>

        <h3 className="item-title card-title">
          <Link href={`/san-pham/${product.slug}`}>{product.name}</Link>
        </h3>

        <div className="item-actives-list card-key-ingredients">
          <Sparkles size={13} aria-hidden="true" />
          <span>{product.ingredients.slice(0, 2).join(" · ")}</span>
        </div>

        <div className="item-purchase-strip card-foot">
          <div className="item-price-block card-pricing">
            <span className="price-label">Giá niêm yết</span>
            <strong className="price-value">{formatMoney(product.price)}</strong>
          </div>

          <button
            className={`item-action-button card-action-btn ${justAdded ? "is-added" : ""}`}
            type="button"
            disabled={atStockLimit}
            onClick={() => onAddToCart(product)}
            aria-label={
              atStockLimit
                ? `${product.name} đã đạt giới hạn tồn kho`
                : justAdded
                  ? `Đã thêm ${product.name} vào giỏ`
                  : `Thêm ${product.name} vào giỏ hàng`
            }
          >
            {atStockLimit ? (
              "Hết hàng"
            ) : justAdded ? (
              <>
                <Check size={16} aria-hidden="true" />
                Đã thêm
              </>
            ) : (
              <>
                <Plus size={16} aria-hidden="true" />
                Thêm vào giỏ
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
