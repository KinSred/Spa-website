"use client";

import { RefObject } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { type Product } from "../data";
import { ProductCard } from "./ProductCard";

type ProductCatalogueProps = {
  products: Product[];
  query: string;
  onQueryChange: (query: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  skin: string;
  onSkinChange: (skin: string) => void;
  skinSelectRef: RefObject<HTMLSelectElement | null>;
  skinOptions: string[];
  concern: string;
  onConcernChange: (concern: string) => void;
  concernSelectRef: RefObject<HTMLSelectElement | null>;
  concernOptions: string[];
  price: string;
  onPriceChange: (price: string) => void;
  priceSelectRef: RefObject<HTMLSelectElement | null>;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  cart: Array<{ product: Product; quantity: number }>;
  addedProductId: number | null;
  onAddToCart: (product: Product) => void;
};

export function ProductCatalogue({
  products,
  query,
  onQueryChange,
  searchInputRef,
  skin,
  onSkinChange,
  skinSelectRef,
  skinOptions,
  concern,
  onConcernChange,
  concernSelectRef,
  concernOptions,
  price,
  onPriceChange,
  priceSelectRef,
  hasActiveFilters,
  onResetFilters,
  cart,
  addedProductId,
  onAddToCart,
}: ProductCatalogueProps) {
  const returnFilterFocus = (control: { focus: () => void } | null) => {
    window.requestAnimationFrame(() => control?.focus());
  };

  return (
    <section className="catalogue-section" id="catalogue">
      <header className="section-heading">
        <div>
          <h2>Chọn theo làn da hôm nay.</h2>
          <p>
            Mỹ phẩm và thiết bị được chọn theo tình trạng da, nhu cầu và ngân sách.
          </p>
        </div>
        <span aria-live="polite" aria-atomic="true">
          {products.length} kết quả
        </span>
      </header>

      <div className="catalogue-tools">
        <label className="search-field">
          <span className="sr-only">Tìm sản phẩm</span>
          <Search size={18} aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Tên sản phẩm hoặc nhu cầu"
          />
        </label>
        <label className="select-field">
          <span className="sr-only">Loại da</span>
          <select
            ref={skinSelectRef}
            value={skin}
            onChange={(event) => onSkinChange(event.target.value)}
          >
            {skinOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">Nhu cầu</span>
          <select
            ref={concernSelectRef}
            value={concern}
            onChange={(event) => onConcernChange(event.target.value)}
          >
            {concernOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">Mức giá</span>
          <select
            ref={priceSelectRef}
            value={price}
            onChange={(event) => onPriceChange(event.target.value)}
          >
            <option value="all">Mọi mức giá</option>
            <option value="under700">Dưới 700.000 ₫</option>
            <option value="700to1000">700.000-1.000.000 ₫</option>
            <option value="over1000">Trên 1.000.000 ₫</option>
          </select>
        </label>
        <button
          className="reset-filter"
          type="button"
          disabled={!hasActiveFilters}
          onClick={onResetFilters}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
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
              onQueryChange("");
              returnFilterFocus(searchInputRef.current);
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
              onSkinChange("Tất cả");
              returnFilterFocus(skinSelectRef.current);
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
              onConcernChange("Tất cả nhu cầu");
              returnFilterFocus(concernSelectRef.current);
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
              onPriceChange("all");
              returnFilterFocus(priceSelectRef.current);
            }}
          >
            {price === "under700"
              ? "Dưới 700.000 ₫"
              : price === "700to1000"
                ? "700.000-1.000.000 ₫"
                : "Trên 1.000.000 ₫"}
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {products.length ? (
        <div className="product-grid">
          {products.map((product) => {
            const quantityInCart =
              cart.find((line) => line.product.id === product.id)?.quantity ?? 0;
            const justAdded = addedProductId === product.id;

            return (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={quantityInCart}
                justAdded={justAdded}
                onAddToCart={onAddToCart}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-results">
          <Search size={28} aria-hidden="true" />
          <h3>Chưa có sản phẩm khớp bộ lọc.</h3>
          <p>Thử bỏ bớt một tiêu chí hoặc đặt lại toàn bộ bộ lọc.</p>
          <button type="button" onClick={onResetFilters}>
            Xem tất cả sản phẩm
          </button>
        </div>
      )}
    </section>
  );
}
