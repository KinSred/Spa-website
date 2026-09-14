"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { FormEvent, RefObject } from "react";
import { formatMoney, type Product } from "../data";

type CartLine = {
  product: Product;
  quantity: number;
};

export type CheckoutState = "cart" | "details" | "processing" | "confirmed";

type CartDrawerProps = {
  cartOpen: boolean;
  onCloseCart: () => void;
  cartCloseRef: RefObject<HTMLButtonElement | null>;
  cart: CartLine[];
  onUpdateQuantity: (id: number, delta: number) => void;
  coupon: string;
  onCouponChange: (coupon: string) => void;
  couponValid: boolean;
  onApplyCoupon: () => void;
  subtotal: number;
  discount: number;
  checkoutState: CheckoutState;
  onSetCheckoutState: (state: CheckoutState) => void;
  onSubmitCheckout: (event: FormEvent<HTMLFormElement>) => void;
  lastOrderId: string | null;
  "aria-modal"?: boolean | "true" | "false";
  inert?: boolean;
};

export function CartDrawer({
  cartOpen,
  onCloseCart,
  cartCloseRef,
  cart,
  onUpdateQuantity,
  coupon,
  onCouponChange,
  couponValid,
  onApplyCoupon,
  subtotal,
  discount,
  checkoutState,
  onSetCheckoutState,
  onSubmitCheckout,
  lastOrderId,
  "aria-modal": ariaModal = "true",
  inert,
}: CartDrawerProps) {
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

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
        <header>
          <div>
            <span id="cart-title">Giỏ hàng</span>
            <strong>
              {checkoutState === "details" || checkoutState === "processing"
                ? "Thông tin nhận hàng"
                : checkoutState === "confirmed"
                  ? "Đơn hàng đã ghi nhận"
                  : `${cartCount} sản phẩm`}
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

        <div className={`cart-lines cart-state-${checkoutState}`}>
          {checkoutState === "confirmed" ? (
            <div className="checkout-confirmation" role="status">
              <span className="confirmation-mark">
                <BadgeCheck size={28} aria-hidden="true" />
              </span>
              <p>Đơn hàng đã được tạo</p>
              <h3>{lastOrderId}</h3>
              <span>
                TĨNH đã lưu đơn vào khu quản trị. Nhân viên có thể tiếp tục xử lý
                trạng thái giao hàng ngay trên dashboard.
              </span>
              <div className="confirmation-actions">
                <Link href="/admin?tab=orders">Xem trong quản trị</Link>
                <button type="button" onClick={onCloseCart}>
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          ) : checkoutState === "processing" ? (
            <div className="checkout-processing" role="status" aria-live="polite">
              <span aria-hidden="true" />
              <h3>Đang ghi nhận đơn hàng</h3>
              <p>Thông tin nhận hàng đang được lưu an toàn trên thiết bị này.</p>
            </div>
          ) : checkoutState === "details" ? (
            <form className="checkout-form" onSubmit={onSubmitCheckout}>
              <button
                className="checkout-back"
                type="button"
                onClick={() => onSetCheckoutState("cart")}
              >
                <ArrowRight size={16} aria-hidden="true" />
                Trở lại giỏ hàng
              </button>
              <label>
                <span>Họ và tên</span>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Nguyễn An"
                />
                <small>Tên người nhận ghi trên đơn hàng.</small>
              </label>
              <label>
                <span>Số điện thoại</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="[0-9+\s]{9,14}"
                  required
                  placeholder="090 123 4567"
                />
                <small>Dùng để xác nhận giao nhận.</small>
              </label>
              <label>
                <span>Địa chỉ giao hàng</span>
                <textarea
                  name="address"
                  autoComplete="street-address"
                  required
                  placeholder="Số nhà, tên đường, phường/xã, tỉnh/thành"
                />
                <small>Ghi đủ thông tin để đơn vị vận chuyển liên hệ.</small>
              </label>
              <fieldset className="payment-options">
                <legend>Thanh toán</legend>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    defaultChecked
                  />
                  <Banknote size={18} aria-hidden="true" />
                  <span>
                    <strong>Khi nhận hàng</strong>
                    <small>Thanh toán trực tiếp cho đơn vị giao nhận.</small>
                  </span>
                </label>
                <label>
                  <input type="radio" name="payment" value="bank" />
                  <CreditCard size={18} aria-hidden="true" />
                  <span>
                    <strong>Chuyển khoản</strong>
                    <small>TĨNH gửi thông tin sau khi xác nhận đơn.</small>
                  </span>
                </label>
              </fieldset>
              <div className="checkout-total">
                <span>Tổng thanh toán</span>
                <strong>{formatMoney(subtotal - discount)}</strong>
              </div>
              <button className="checkout-button" type="submit">
                Xác nhận đặt hàng
                <ArrowRight size={17} aria-hidden="true" />
              </button>
              <p className="checkout-security">
                <BadgeCheck size={16} aria-hidden="true" />
                Thông tin được lưu để vận hành đơn hàng trong phiên bản bàn giao.
              </p>
            </form>
          ) : cart.length ? (
            cart.map((line) => (
              <article className="cart-line" key={line.product.id}>
                <Image
                  src={line.product.image}
                  alt=""
                  width={90}
                  height={120}
                  unoptimized
                />
                <div className="cart-line-details">
                  <h3>{line.product.name}</h3>
                  <p>{formatMoney(line.product.price)}</p>
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
                      disabled={line.quantity >= line.product.stock}
                      onClick={() => onUpdateQuantity(line.product.id, 1)}
                    >
                      <Plus size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-cart">
              <ShoppingBag size={28} aria-hidden="true" />
              <h3>Giỏ hàng đang trống.</h3>
              <p>Chọn một sản phẩm phù hợp để bắt đầu đơn hàng.</p>
              <button type="button" onClick={onCloseCart}>
                Tiếp tục chọn
              </button>
            </div>
          )}
        </div>

        {checkoutState === "cart" && cart.length > 0 && (
          <div className="cart-summary">
            <div className="coupon-row">
              <label>
                <span>Mã giảm giá</span>
                <input
                  aria-describedby={couponValid ? "coupon-success" : undefined}
                  value={coupon}
                  onChange={(event) => {
                    onCouponChange(event.target.value);
                  }}
                  placeholder="Ví dụ: TINH10"
                />
              </label>
              <button type="button" onClick={onApplyCoupon}>
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
            {couponValid && (
              <p className="coupon-success" id="coupon-success" role="status">
                TINH10 đang giảm 10% cho đơn này.
              </p>
            )}
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
              <div className="total-row">
                <dt>Tổng</dt>
                <dd>{formatMoney(subtotal - discount)}</dd>
              </div>
            </dl>
            <button
              className="checkout-button"
              type="button"
              onClick={() => onSetCheckoutState("details")}
            >
              Tiếp tục đặt hàng
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <small className="shipping-note">
              Miễn phí giao hàng cho đơn từ 1.200.000 ₫.
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
