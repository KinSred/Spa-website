"use client";

import { RefObject, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus, RotateCcw, Search, Sparkles, X } from "lucide-react";
import {
  formatMoney,
  getPriceFilter,
  isPriceFilterId,
  PRICE_FILTERS,
  type PriceFilterId,
  type Product,
} from "../data";
import { ProductCard } from "./ProductCard";

type ProductCatalogueProps = {
  catalogueDestinationRef?: RefObject<HTMLHeadingElement | null>;
  products: Product[];
  query: string;
  onQueryChange: (query: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  skin: string;
  onSkinChange: (skin: string) => void;
  skinOptions: string[];
  concern: string;
  onConcernChange: (concern: string) => void;
  concernSelectRef: RefObject<HTMLSelectElement | null>;
  concernOptions: string[];
  price: PriceFilterId;
  onPriceChange: (price: PriceFilterId) => void;
  priceSelectRef: RefObject<HTMLSelectElement | null>;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  cart: Array<{ product: Product; quantity: number }>;
  addedProductId: number | null;
  onAddToCart: (product: Product) => void;
};

export function ProductCatalogue({
  catalogueDestinationRef,
  products,
  query,
  onQueryChange,
  searchInputRef,
  skin,
  onSkinChange,
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
  const defaultSkinChipRef = useRef<HTMLButtonElement | null>(null);

  const returnFilterFocus = (control: { focus: () => void } | null) => {
    window.requestAnimationFrame(() => control?.focus());
  };

  // Flagship featured product (when no search query narrows the view)
  const isDefaultView = !query.trim() && skin === "Tất cả" && concern === "Tất cả nhu cầu" && price === "all";
  const featuredProduct = isDefaultView && products.length > 0 ? products[0] : null;
  const gridProducts = isDefaultView && products.length > 0 ? products.slice(1) : products;

  const featuredInCart = featuredProduct
    ? cart.find((line) => line.product.id === featuredProduct.id)?.quantity ?? 0
    : 0;
  const featuredJustAdded = featuredProduct ? addedProductId === featuredProduct.id : false;
  const featuredAtLimit = featuredProduct ? featuredInCart >= featuredProduct.stock : false;

  return (
    <section className="catalogue-editorial" id="catalogue" aria-label="Bộ sưu tập sản phẩm">
      {/* Section Header with Integrated Discovery Controls */}
      <header className="catalogue-head catalogue-merchandising-head">
        <div className="catalogue-head-top">
          <div className="catalogue-head-text">
            <div className="catalogue-head-meta">
              <span className="catalogue-badge">BỘ SƯU TẬP TẠI NHÀ</span>
              <span className="catalogue-roman">III · FORMULATIONS</span>
            </div>
            <h2 className="catalogue-title" ref={catalogueDestinationRef} tabIndex={-1}>
              Chọn theo làn da hôm nay.
            </h2>
            <p className="catalogue-subtitle">
              Mỹ phẩm và thiết bị được chọn theo tình trạng da, nhu cầu và ngân sách.
            </p>
          </div>

          <span className="catalogue-count-badge" aria-live="polite" aria-atomic="true">
            {products.length} công thức sẵn có
          </span>
        </div>

        {/* Integrated Merchandising Discovery Bar */}
        <div className="catalogue-filter-bar catalogue-integrated-controls">
          {/* Skin Type Category Quick Chips */}
          <div className="filter-chips-rail" role="group" aria-label="Lọc theo loại da">
            {skinOptions.map((opt) => {
              const active = skin === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={active}
                  ref={opt === "Tất cả" ? defaultSkinChipRef : undefined}
                  className={`filter-chip ${active ? "is-active" : ""}`}
                  onClick={() => onSkinChange(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Secondary Filters & Search Bar */}
          <div className="catalogue-tools-row">
            <label className="search-box">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Tìm sản phẩm</span>
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Tìm theo tên hoặc hoạt chất..."
              />
            </label>

            <div className="select-box-wrap">
              <label className="select-box">
                <span className="sr-only">Nhu cầu</span>
                <select
                  ref={concernSelectRef}
                  value={concern}
                  onChange={(e) => onConcernChange(e.target.value)}
                >
                  {concernOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </label>

              <label className="select-box">
                <span className="sr-only">Mức giá</span>
                <select
                  ref={priceSelectRef}
                  value={price}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isPriceFilterId(val)) {
                      onPriceChange(val);
                    }
                  }}
                >
                  {PRICE_FILTERS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Reset Action */}
            <button
              className="reset-btn"
              type="button"
              disabled={!hasActiveFilters}
              onClick={onResetFilters}
              aria-label="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw size={15} aria-hidden="true" />
              <span>Đặt lại</span>
            </button>
          </div>
        </div>
      </header>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="active-tags-rail" aria-label="Bộ lọc đang áp dụng">
          {query.trim() && (
            <button
              type="button"
              className="active-tag"
              onClick={() => {
                onQueryChange("");
                returnFilterFocus(searchInputRef.current);
              }}
            >
              <span>Tìm: “{query}”</span>
              <X size={14} aria-hidden="true" />
            </button>
          )}
          {skin !== "Tất cả" && (
            <button
              type="button"
              className="active-tag"
              onClick={() => {
                onSkinChange("Tất cả");
                returnFilterFocus(defaultSkinChipRef.current);
              }}
            >
              <span>{skin}</span>
              <X size={14} aria-hidden="true" />
            </button>
          )}
          {concern !== "Tất cả nhu cầu" && (
            <button
              type="button"
              className="active-tag"
              onClick={() => {
                onConcernChange("Tất cả nhu cầu");
                returnFilterFocus(concernSelectRef.current);
              }}
            >
              <span>{concern}</span>
              <X size={14} aria-hidden="true" />
            </button>
          )}
          {price !== "all" && (
            <button
              type="button"
              className="active-tag"
              onClick={() => {
                onPriceChange("all");
                returnFilterFocus(priceSelectRef.current);
              }}
            >
              <span>{getPriceFilter(price).tagLabel}</span>
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* Featured Formulation Landmark (When in default overview mode) */}
      {featuredProduct && (
        <article className="featured-landmark-card">
          <div className="landmark-visual">
            <Link
              href={`/san-pham/${featuredProduct.slug}`}
              className="landmark-image-link"
              aria-label={`Xem chi tiết ${featuredProduct.name}`}
            >
              <Image
                src={featuredProduct.image}
                alt={`${featuredProduct.name}, ${featuredProduct.note}`}
                width={800}
                height={600}
                unoptimized
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
              />
              <span className="landmark-badge">FORMULATION SPOTLIGHT</span>
            </Link>
          </div>

          <div className="landmark-content">
            <div className="landmark-kicker">
              <span>CÔNG THỨC TIÊU BIỂU · {featuredProduct.category.toUpperCase()}</span>
              <small>{featuredProduct.note}</small>
            </div>

            <h3 className="landmark-title">
              <Link href={`/san-pham/${featuredProduct.slug}`}>
                {featuredProduct.name}
              </Link>
            </h3>

            <p className="landmark-desc">{featuredProduct.description}</p>

            <div className="landmark-ingredients">
              <span className="ingredients-label">HOẠT CHẤT TRỌNG TÂM:</span>
              <div className="ingredients-pills">
                {featuredProduct.ingredients.map((ing) => (
                  <span key={ing} className="ingredient-pill">
                    <Sparkles size={12} aria-hidden="true" />
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="landmark-footer">
              <div className="landmark-pricing">
                <span className="price-label">Giá niêm yết</span>
                <strong className="landmark-price">
                  {formatMoney(featuredProduct.price)}
                </strong>
              </div>

              <button
                className={`landmark-add-btn ${featuredJustAdded ? "is-added" : ""}`}
                type="button"
                disabled={featuredAtLimit}
                onClick={() => onAddToCart(featuredProduct)}
              >
                {featuredAtLimit ? (
                  "Hết hàng"
                ) : featuredJustAdded ? (
                  <>
                    <Check size={18} aria-hidden="true" />
                    Đã lưu vào giỏ
                  </>
                ) : (
                  <>
                    <Plus size={18} aria-hidden="true" />
                    Thêm vào giỏ
                  </>
                )}
              </button>
            </div>
          </div>
        </article>
      )}

      {/* Main Curated Product Grid */}
      {products.length > 0 ? (
        <div className="catalogue-curated-grid">
          {gridProducts.map((product, idx) => {
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
                index={isDefaultView ? idx + 1 : idx}
              />
            );
          })}

          {/* Atelier Monograph Interlude Card embedded in grid rhythm */}
          {isDefaultView && (
            <aside className="catalogue-manifesto-card" aria-hidden="true">
              <span className="manifesto-tag">NGUYÊN LÝ BÀO CHẾ</span>
              <blockquote>
                “Làn da không cần mười bước phức tạp. Một hàng rào da khỏe bắt đầu
                từ việc dừng lại đúng lúc.”
              </blockquote>
              <cite>Atelier TĨNH · Ghi chú chuyên đề</cite>
            </aside>
          )}
        </div>
      ) : (
        <div className="catalogue-empty" role="status">
          <p>Không tìm thấy sản phẩm phù hợp với bộ lọc đã chọn.</p>
          <button className="primary-action" type="button" onClick={onResetFilters}>
            Xem toàn bộ bộ sưu tập
          </button>
        </div>
      )}
    </section>
  );
}
