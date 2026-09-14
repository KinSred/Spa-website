"use client";

import { Check, Eye, EyeOff, Minus, Plus, Search } from "lucide-react";
import { formatMoney, type Product } from "../../data";

type InventoryItem = Product & { visible?: boolean };

type ProductsTabProps = {
  inventory: InventoryItem[];
  query: string;
  onQueryChange: (query: string) => void;
  filteredInventory: InventoryItem[];
  productAdded: boolean;
  onAddProductDraft: () => void;
  onAdjustStock: (id: number, delta: number) => void;
  onToggleVisible: (id: number) => void;
};

export function ProductsTab({
  inventory,
  query,
  onQueryChange,
  filteredInventory,
  productAdded,
  onAddProductDraft,
  onAdjustStock,
  onToggleVisible,
}: ProductsTabProps) {
  return (
    <section className="admin-list-section product-management">
      <header>
        <div>
          <span>Danh mục & tồn kho</span>
          <strong>{inventory.length} sản phẩm</strong>
        </div>
        <button type="button" onClick={onAddProductDraft}>
          {productAdded ? (
            <Check size={17} aria-hidden="true" />
          ) : (
            <Plus size={17} aria-hidden="true" />
          )}
          {productAdded ? "Đã thêm bản nháp" : "Thêm sản phẩm"}
        </button>
      </header>
      <label className="admin-search">
        <span className="sr-only">Tìm trong danh mục sản phẩm</span>
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tìm tên hoặc danh mục"
        />
      </label>
      <p className="admin-result-count" aria-live="polite">
        {filteredInventory.length} sản phẩm khớp tìm kiếm
      </p>
      <div className="inventory-list">
        {filteredInventory.map((product) => (
          <article key={product.id}>
            <div className="inventory-name">
              <span>{product.category}</span>
              <strong>{product.name}</strong>
              <small>{formatMoney(product.price)}</small>
            </div>
            <div
              className="stock-control"
              role="group"
              aria-label={`Tồn kho ${product.name}`}
            >
              <button
                type="button"
                aria-label={`Giảm tồn kho ${product.name}`}
                disabled={product.stock === 0}
                onClick={() => onAdjustStock(product.id, -1)}
              >
                <Minus size={15} aria-hidden="true" />
              </button>
              <output
                className={product.stock <= 5 ? "is-low" : ""}
                aria-live="polite"
              >
                {product.stock} tồn
              </output>
              <button
                type="button"
                aria-label={`Tăng tồn kho ${product.name}`}
                onClick={() => onAdjustStock(product.id, 1)}
              >
                <Plus size={15} aria-hidden="true" />
              </button>
            </div>
            <button
              className="visibility-button"
              type="button"
              onClick={() => onToggleVisible(product.id)}
            >
              {product.visible ? (
                <Eye size={17} aria-hidden="true" />
              ) : (
                <EyeOff size={17} aria-hidden="true" />
              )}
              {product.visible ? "Đang bán" : "Bản nháp"}
            </button>
          </article>
        ))}
        {!filteredInventory.length && (
          <div className="admin-empty-state">
            <Search size={22} aria-hidden="true" />
            <strong>Không tìm thấy sản phẩm.</strong>
            <button type="button" onClick={() => onQueryChange("")}>
              Xóa nội dung tìm kiếm
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
