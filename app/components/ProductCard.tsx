"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { formatMoney, type Product } from "../data";

type ProductCardProps = {
  product: Product;
  quantityInCart: number;
  justAdded: boolean;
  onAddToCart: (product: Product) => void;
};

export function ProductCard({
  product,
  quantityInCart,
  justAdded,
  onAddToCart,
}: ProductCardProps) {
  const atStockLimit = quantityInCart >= product.stock;

  return (
    <article className="product-card">
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
          unoptimized
          loading="lazy"
          sizes="(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        {product.stock <= 5 && <span className="stock-warning-badge">Sắp hết</span>}
      </Link>
      <div className="product-meta">
        <div className="product-info">
          <p className="product-category">{product.category}</p>
          <h3 className="product-title">
            <Link href={`/san-pham/${product.slug}`}>{product.name}</Link>
          </h3>
          <small className="product-note">{product.note}</small>
        </div>
        <strong className="product-price">{formatMoney(product.price)}</strong>
      </div>
      <button
        className={`add-button ${justAdded ? "is-success" : ""}`}
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
        {atStockLimit ? "Đã đủ tồn kho" : justAdded ? "Đã thêm" : "Thêm vào giỏ"}
        {atStockLimit || justAdded ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Plus size={16} aria-hidden="true" />
        )}
      </button>
    </article>
  );
}
