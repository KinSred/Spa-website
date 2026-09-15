"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, RefObject } from "react";
import { formatMoney, type Product } from "../data";

export type CartLine = {
  product: Product;
  quantity: number;
};

export type CheckoutState = "cart" | "details" | "payment" | "processing" | "confirmed";

export type CheckoutDraft = {
  name: string;
  phone: string;
  address: string;
  payment: "cod" | "bank";
  note?: string;
};

type CartDrawerProps = {
  cartOpen: boolean;
  onCloseCart: () => void;
  cartCloseRef: RefObject<HTMLButtonElement | null>;
  cart: CartLine[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveLine: (id: number) => void;
  coupon: string;
  onCouponChange: (coupon: string) => void;
  couponValid: boolean;
  onApplyCoupon: () => void;
  subtotal: number;
  discount: number;
  checkoutState: CheckoutState;
  onSetCheckoutState: (state: CheckoutState) => void;
  checkoutDraft: CheckoutDraft;
  onUpdateDraft: (updates: Partial<CheckoutDraft>) => void;
  onSubmitCheckout: (event: FormEvent<HTMLFormElement>) => void;
  lastOrderId: string | null;
  "aria-modal"?: boolean | "true" | "false";
  inert?: boolean;
};

const FREE_SHIPPING_THRESHOLD = 1200000;

export function CartDrawer({
  cartOpen,
  onCloseCart,
  cartCloseRef,
  cart,
  onUpdateQuantity,
  onRemoveLine,
  coupon,
  onCouponChange,
  couponValid,
  onApplyCoupon,
  subtotal,
  discount,
  checkoutState,
  onSetCheckoutState,
  checkoutDraft,
  onUpdateDraft,
  onSubmitCheckout,
  lastOrderId,
  "aria-modal": ariaModal = "true",
  inert,
}: CartDrawerProps) {
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingLabel = isFreeShipping ? "Miễn phí" : "Xác nhận khi xử lý đơn";

  const trapFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!cartOpen || event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleDetailsProceed = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkoutDraft.name.trim() || !checkoutDraft.phone.trim() || !checkoutDraft.address.trim()) {
      return;
    }
    onSetCheckoutState("payment");
  };

  return (
    <>
      <aside
        className={`cart-drawer ${cartOpen ? "is-open" : ""}`}
        id="shopping-cart"
        role="dialog"
        aria-modal={ariaModal}
        aria-labelledby="cart-title"
        aria-hidden={!cartOpen}
        inert={inert ?? !cartOpen}
        onKeyDown={trapFocus}
      >
        <header className="cart-drawer-header">
          <div>
            <span className="cart-kicker" id="cart-title">GIỎ HÀNG TĨNH</span>
            <strong className="cart-header-status">
              {checkoutState === "details"
                ? "Thông tin nhận hàng"
                : checkoutState === "payment"
                  ? "Phương thức thanh toán"
                  : checkoutState === "processing"
                    ? "Đang ghi nhận đơn"
                    : checkoutState === "confirmed"
                      ? "Đơn hàng hoàn tất"
                      : `${cartCount} sản phẩm đã chọn`}
            </strong>
          </div>
          <button
            className="icon-button"
            type="button"
            ref={cartCloseRef}
            aria-label="Đóng giỏ hàng"
            onClick={onCloseCart}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {/* Real Customer Progression Stepper */}
        {(cart.length > 0 || checkoutState !== "cart") && (
          <nav className="checkout-stepper" aria-label="Tiến trình đặt hàng">
            <ol className="stepper-track">
              <li
                className={`step-item ${checkoutState === "cart" ? "is-current" : "is-complete"}`}
                aria-current={checkoutState === "cart" ? "step" : undefined}
              >
                <span className="step-number">1</span>
                <span className="step-name">Giỏ hàng</span>
              </li>
              <li
                className={`step-item ${
                  checkoutState === "details"
                    ? "is-current"
                    : checkoutState === "payment" ||
                        checkoutState === "processing" ||
                        checkoutState === "confirmed"
                      ? "is-complete"
                      : "is-pending"
                }`}
                aria-current={checkoutState === "details" ? "step" : undefined}
              >
                <span className="step-number">2</span>
                <span className="step-name">Nhận hàng</span>
              </li>
              <li
                className={`step-item ${
                  checkoutState === "payment"
                    ? "is-current"
                    : checkoutState === "processing" || checkoutState === "confirmed"
                      ? "is-complete"
                      : "is-pending"
                }`}
                aria-current={checkoutState === "payment" ? "step" : undefined}
              >
                <span className="step-number">3</span>
                <span className="step-name">Thanh toán</span>
              </li>
              <li
                className={`step-item ${
                  checkoutState === "confirmed"
                    ? "is-current is-complete"
                    : checkoutState === "processing"
                      ? "is-pending is-loading"
                      : "is-pending"
                }`}
                aria-current={checkoutState === "confirmed" ? "step" : undefined}
              >
                <span className="step-number">4</span>
                <span className="step-name">Hoàn tất</span>
              </li>
            </ol>
          </nav>
        )}

        <div className={`cart-lines cart-state-${checkoutState}`}>
          {/* STATE 5: CONFIRMED */}
          {checkoutState === "confirmed" ? (
            <div className="checkout-confirmation" role="status">
              <span className="confirmation-mark" aria-hidden="true">
                <BadgeCheck size={32} />
              </span>
              <p className="confirmation-title">Đơn hàng đã được ghi nhận</p>
              <h3 className="confirmation-id">{lastOrderId}</h3>

              <div className="confirmation-dossier">
                <div className="dossier-row">
                  <span>Người nhận:</span>
                  <strong>{checkoutDraft.name}</strong>
                </div>
                <div className="dossier-row">
                  <span>Số điện thoại:</span>
                  <span>{checkoutDraft.phone}</span>
                </div>
                <div className="dossier-row">
                  <span>Địa chỉ giao:</span>
                  <span>{checkoutDraft.address}</span>
                </div>
                <div className="dossier-row">
                  <span>Hình thức:</span>
                  <span>
                    {checkoutDraft.payment === "bank"
                      ? "Chuyển khoản (Demo)"
                      : "Thanh toán khi nhận hàng (COD)"}
                  </span>
                </div>
              </div>

              <p className="confirmation-truth-note">
                Đơn hàng demo đã được ghi nhận trên thiết bị này. Mã đơn hàng được tạo để theo dõi trong quy trình vận hành mô phỏng.
              </p>

              <div className="confirmation-actions">
                <button
                  type="button"
                  className="continue-shopping-btn"
                  onClick={onCloseCart}
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          ) : checkoutState === "processing" ? (
            /* STATE 4: PROCESSING */
            <div className="checkout-processing" role="status" aria-live="polite">
              <span className="spinner-indicator" aria-hidden="true" />
              <h3>Đang ghi nhận đơn hàng</h3>
              <p>Thông tin nhận hàng đang được lưu trên thiết bị này…</p>
            </div>
          ) : checkoutState === "payment" ? (
            /* STATE 3: PAYMENT METHOD */
            <form className="checkout-form payment-step-form" onSubmit={onSubmitCheckout}>
              <div className="step-nav-bar">
                <button
                  className="checkout-back"
                  type="button"
                  onClick={() => onSetCheckoutState("details")}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Quay lại thông tin người nhận
                </button>
              </div>

              {/* Recipient Summary Card */}
              <div className="recipient-review-card">
                <div className="review-header">
                  <strong>Thông tin giao nhận</strong>
                  <button
                    type="button"
                    className="edit-recipient-btn"
                    onClick={() => onSetCheckoutState("details")}
                  >
                    Thay đổi
                  </button>
                </div>
                <p className="recipient-line">
                  <strong>{checkoutDraft.name}</strong> · {checkoutDraft.phone}
                </p>
                <p className="address-line">{checkoutDraft.address}</p>
                {checkoutDraft.note && (
                  <p className="note-line">Ghi chú: {checkoutDraft.note}</p>
                )}
              </div>

              {/* Payment Selector */}
              <fieldset className="payment-options">
                <legend>Phương thức thanh toán</legend>
                <label className={`payment-option ${checkoutDraft.payment === "cod" ? "is-active" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={checkoutDraft.payment === "cod"}
                    onChange={() => onUpdateDraft({ payment: "cod" })}
                  />
                  <Banknote size={20} aria-hidden="true" />
                  <div className="option-copy">
                    <strong>Khi nhận hàng (COD)</strong>
                    <small>Kiểm tra bưu kiện và thanh toán tiền mặt trực tiếp cho bên giao nhận.</small>
                  </div>
                </label>

                <label className={`payment-option ${checkoutDraft.payment === "bank" ? "is-active" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={checkoutDraft.payment === "bank"}
                    onChange={() => onUpdateDraft({ payment: "bank" })}
                  />
                  <CreditCard size={20} aria-hidden="true" />
                  <div className="option-copy">
                    <strong>Chuyển khoản ngân hàng (Mô phỏng)</strong>
                    <small>Phương thức mô phỏng trong bản demo; không yêu cầu chuyển tiền thực tế.</small>
                  </div>
                </label>
              </fieldset>

              {/* Truthful Total Summary */}
              <div className="checkout-payment-summary">
                <dl className="summary-breakdown">
                  <div>
                    <dt>Tiền hàng</dt>
                    <dd>{formatMoney(subtotal)}</dd>
                  </div>
                  {couponValid && (
                    <div>
                      <dt>Giảm giá (TINH10)</dt>
                      <dd>-{formatMoney(discount)}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Vận chuyển</dt>
                    <dd>{shippingLabel}</dd>
                  </div>
                  <div className="total-row">
                    <dt>
                      {isFreeShipping ? "Tổng thanh toán" : "Ước tính tiền hàng"}
                    </dt>
                    <dd>{formatMoney(subtotal - discount)}</dd>
                  </div>
                </dl>
              </div>

              <button className="checkout-button primary-action" type="submit">
                Hoàn tất đặt hàng
                <ArrowRight size={18} aria-hidden="true" />
              </button>

              <p className="checkout-security-notice">
                <BadgeCheck size={16} aria-hidden="true" />
                Đơn hàng được lưu trên trình duyệt trong phiên bản bàn giao này.
              </p>
            </form>
          ) : checkoutState === "details" ? (
            /* STATE 2: DETAILS */
            <form className="checkout-form" onSubmit={handleDetailsProceed}>
              <div className="step-nav-bar">
                <button
                  className="checkout-back"
                  type="button"
                  onClick={() => onSetCheckoutState("cart")}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Trở lại danh sách sản phẩm
                </button>
              </div>

              <label className="checkout-field">
                <span>Họ và tên người nhận</span>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  value={checkoutDraft.name}
                  onChange={(e) => onUpdateDraft({ name: e.target.value })}
                  placeholder="Nguyễn An"
                />
                <small>Tên ghi trên kiện hàng.</small>
              </label>

              <label className="checkout-field">
                <span>Số điện thoại nhận hàng</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="[0-9+\s]{9,14}"
                  required
                  value={checkoutDraft.phone}
                  onChange={(e) => onUpdateDraft({ phone: e.target.value })}
                  placeholder="090 123 4567"
                />
                <small>Dùng để bên giao nhận liên hệ khi phát hàng.</small>
              </label>

              <label className="checkout-field">
                <span>Địa chỉ giao hàng</span>
                <textarea
                  name="address"
                  autoComplete="street-address"
                  required
                  value={checkoutDraft.address}
                  onChange={(e) => onUpdateDraft({ address: e.target.value })}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                />
                <small>Địa chỉ nhận kiện mỹ phẩm.</small>
              </label>

              <label className="checkout-field">
                <span>Ghi chú giao hàng (không bắt buộc)</span>
                <input
                  name="note"
                  value={checkoutDraft.note ?? ""}
                  onChange={(e) => onUpdateDraft({ note: e.target.value })}
                  placeholder="Giao giờ hành chính, gọi trước khi đến…"
                />
              </label>

              <div className="checkout-details-footer">
                <button className="checkout-button primary-action" type="submit">
                  Tiếp tục: Thanh toán
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </form>
          ) : cart.length ? (
            /* STATE 1: CART ITEMS */
            <div className="cart-items-stack" role="list">
              {cart.map((line) => {
                const atStockCeiling = line.quantity >= line.product.stock;
                return (
                  <article
                    className="cart-line"
                    key={line.product.id}
                    id={`cart-line-${line.product.id}`}
                    role="listitem"
                  >
                    <Image
                      src={line.product.image}
                      alt=""
                      width={90}
                      height={120}
                      unoptimized
                    />
                    <div className="cart-line-details">
                      <div className="cart-line-top">
                        <span className="cart-line-category">
                          {line.product.category}
                        </span>
                        <button
                          type="button"
                          className="cart-remove-btn"
                          aria-label={`Xóa ${line.product.name} khỏi giỏ`}
                          onClick={() => onRemoveLine(line.product.id)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          <span>Xóa</span>
                        </button>
                      </div>

                      <h3 className="cart-line-name">{line.product.name}</h3>
                      <p className="cart-line-price">
                        {formatMoney(line.product.price)}
                      </p>

                      <div className="cart-line-actions">
                        <div
                          className="quantity-control"
                          role="group"
                          aria-label={`Số lượng ${line.product.name}`}
                        >
                          <button
                            type="button"
                            aria-label={`Giảm số lượng ${line.product.name}`}
                            onClick={() => onUpdateQuantity(line.product.id, -1)}
                          >
                            <Minus size={15} aria-hidden="true" />
                          </button>
                          <output aria-live="polite">{line.quantity}</output>
                          <button
                            type="button"
                            aria-label={`Tăng số lượng ${line.product.name}`}
                            disabled={atStockCeiling}
                            onClick={() => onUpdateQuantity(line.product.id, 1)}
                          >
                            <Plus size={15} aria-hidden="true" />
                          </button>
                        </div>

                        {atStockCeiling && (
                          <span className="stock-ceiling-note" role="status">
                            Tối đa ({line.product.stock})
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="empty-cart">
              <ShoppingBag size={32} aria-hidden="true" />
              <h3>Giỏ hàng đang trống</h3>
              <p>Chọn một sản phẩm phù hợp để bắt đầu quy trình chăm da.</p>
              <button
                type="button"
                className="empty-cart-cta"
                onClick={onCloseCart}
              >
                Tiếp tục chọn sản phẩm
              </button>
            </div>
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Trigger */}
        {checkoutState === "cart" && cart.length > 0 && (
          <div className="cart-summary">
            <div className="coupon-row">
              <label>
                <span>Mã ưu đãi</span>
                <input
                  aria-describedby={
                    couponValid ? "coupon-success" : coupon.trim() ? "coupon-hint" : undefined
                  }
                  value={coupon}
                  onChange={(event) => {
                    onCouponChange(event.target.value);
                  }}
                  placeholder="Ví dụ: TINH10"
                />
              </label>
              <button
                type="button"
                className={couponValid ? "is-applied" : ""}
                onClick={onApplyCoupon}
              >
                {couponValid ? (
                  <>
                    <Check size={15} aria-hidden="true" />
                    Đã áp dụng
                  </>
                ) : (
                  "Áp dụng"
                )}
              </button>
            </div>

            {couponValid ? (
              <p className="coupon-success" id="coupon-success" role="status">
                Mã TINH10 đã được áp dụng: giảm 10% tiền hàng.
              </p>
            ) : coupon.trim() ? (
              <p className="coupon-hint" id="coupon-hint">
                Nhấn “Áp dụng” để kích hoạt mã giảm giá.
              </p>
            ) : null}

            <dl className="summary-breakdown">
              <div>
                <dt>Tạm tính</dt>
                <dd>{formatMoney(subtotal)}</dd>
              </div>
              {couponValid && (
                <div>
                  <dt>Giảm 10%</dt>
                  <dd>-{formatMoney(discount)}</dd>
                </div>
              )}
              <div>
                <dt>Vận chuyển</dt>
                <dd className={isFreeShipping ? "free-shipping-tag" : "pending-shipping"}>
                  {shippingLabel}
                </dd>
              </div>
              <div className="total-row">
                <dt>
                  {isFreeShipping ? "Tổng thanh toán" : "Ước tính tiền hàng"}
                </dt>
                <dd>{formatMoney(subtotal - discount)}</dd>
              </div>
            </dl>

            <button
              className="checkout-button primary-action"
              type="button"
              onClick={() => onSetCheckoutState("details")}
            >
              Tiến hành nhận hàng
              <ArrowRight size={18} aria-hidden="true" />
            </button>

            <small className="shipping-note">
              {isFreeShipping
                ? "Đơn hàng đủ điều kiện miễn phí giao hàng."
                : `Miễn phí giao hàng từ ${formatMoney(FREE_SHIPPING_THRESHOLD)}.`}
            </small>
          </div>
        )}
      </aside>
      <button
        className={`drawer-scrim ${cartOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Đóng giỏ hàng"
        aria-hidden={!cartOpen}
        inert={!cartOpen}
        onClick={onCloseCart}
      />
    </>
  );
}
