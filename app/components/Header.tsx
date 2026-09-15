"use client";

import Link from "next/link";
import {
  Check,
  ChevronDown,
  Menu,
  ShoppingBag,
  X,
} from "lucide-react";
import { RefObject, useEffect, useRef } from "react";

export type MobileMenuCloseReason = "dismiss" | "navigate";

type HeaderProps = {
  announcementVisible: boolean;
  onDismissAnnouncement: () => void;
  couponCopied: boolean;
  onCopyCoupon: () => void;
  navCompact: boolean;
  navSentinelRef: RefObject<HTMLSpanElement | null>;
  wordmarkRef: RefObject<HTMLAnchorElement | null>;
  megaOpen: boolean;
  onToggleMega: () => void;
  onCloseMega: () => void;
  megaTriggerRef: RefObject<HTMLButtonElement | null>;
  onFilterSkin: (skin: string) => void;
  onFilterConcern: (concern: string) => void;
  onOpenBooking: (explicitOpener?: HTMLElement | null) => void;
  cartCount: number;
  cartOpen: boolean;
  cartTriggerRef: RefObject<HTMLButtonElement | null>;
  onOpenCart: () => void;
  bagPulse: boolean;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onCloseMobile: (reason?: MobileMenuCloseReason) => void;
  onNavigateMobileDestination?: (destination: "catalogue" | "treatments" | "journal") => void;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
};

export function Header({
  announcementVisible,
  onDismissAnnouncement,
  couponCopied,
  onCopyCoupon,
  navCompact,
  navSentinelRef,
  wordmarkRef,
  megaOpen,
  onToggleMega,
  onCloseMega,
  megaTriggerRef,
  onFilterSkin,
  onFilterConcern,
  onOpenBooking,
  cartCount,
  cartOpen,
  cartTriggerRef,
  onOpenCart,
  bagPulse,
  mobileOpen,
  onToggleMobile,
  onCloseMobile,
  onNavigateMobileDestination,
  menuTriggerRef,
}: HeaderProps) {
  const mobileMenuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mobileOpen) {
      window.requestAnimationFrame(() => {
        const firstFocusable = mobileMenuRef.current?.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        firstFocusable?.focus();
      });
    }
  }, [mobileOpen]);

  const trapMobileMenuFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!mobileOpen || event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      <span className="nav-sentinel" ref={navSentinelRef} aria-hidden="true" />
      <header
        className={`site-header ${navCompact ? "is-compact" : ""} ${
          announcementVisible ? "" : "is-banner-dismissed"
        }`}
      >
        <div
          className={`announcement ${announcementVisible ? "" : "is-dismissed"}`}
          aria-hidden={!announcementVisible}
          inert={!announcementVisible}
        >
          <span>Miễn phí giao hàng từ 1.200.000 ₫</span>
          <div className="announcement-actions">
            <button type="button" onClick={onCopyCoupon}>
              {couponCopied ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  Đã sao chép
                </>
              ) : (
                "TINH10 · Sao chép mã"
              )}
            </button>
            <button
              className="announcement-close"
              type="button"
              aria-label="Ẩn thông báo ưu đãi"
              onClick={onDismissAnnouncement}
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="site-nav">
          <div className="nav-inner">
            <Link
              className="wordmark"
              href="/"
              ref={wordmarkRef}
              aria-label="TĨNH - Trang chủ"
            >
              TĨNH
              <span>skin atelier</span>
            </Link>

            <nav className="desktop-nav" aria-label="Điều hướng chính">
              <button
                className="nav-link"
                type="button"
                ref={megaTriggerRef}
                aria-expanded={megaOpen}
                aria-controls="product-mega-menu"
                onClick={onToggleMega}
              >
                Khám phá
                <ChevronDown
                  className={`nav-chevron ${megaOpen ? "is-open" : ""}`}
                  size={16}
                  aria-hidden="true"
                />
              </button>
              <a className="nav-link" href="#catalogue">
                Sản phẩm
              </a>
              <a className="nav-link" href="#treatments">
                Liệu trình
              </a>
              <a className="nav-link" href="#journal">
                Kiến thức
              </a>
            </nav>

            <div className="nav-actions">
              <button
                className="book-link desktop-book"
                type="button"
                onClick={() => onOpenBooking()}
              >
                Đặt lịch
              </button>
              <button
                className={`icon-button bag-button ${bagPulse ? "is-pulsing" : ""}`}
                type="button"
                ref={cartTriggerRef}
                aria-label={`Mở giỏ hàng, ${cartCount} sản phẩm`}
                aria-expanded={cartOpen}
                aria-controls="shopping-cart"
                onClick={onOpenCart}
              >
                <ShoppingBag size={19} aria-hidden="true" />
                <span>{cartCount}</span>
              </button>
              <button
                className="icon-button mobile-menu-button"
                type="button"
                ref={menuTriggerRef}
                aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
                onClick={onToggleMobile}
              >
                {mobileOpen ? (
                  <X size={20} aria-hidden="true" />
                ) : (
                  <Menu size={20} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div
            className={`mega-panel ${megaOpen ? "is-open" : ""}`}
            id="product-mega-menu"
            aria-hidden={!megaOpen}
            inert={!megaOpen}
          >
            <div className="mega-inner">
              <div>
                <p className="mega-title">Chọn theo làn da</p>
                <a
                  href="#catalogue"
                  onClick={() => {
                    onFilterSkin("Da nhạy cảm");
                    onCloseMega();
                  }}
                >
                  <span>Da nhạy cảm</span>
                  <small>Phục hồi và giảm quá tải routine</small>
                </a>
                <a
                  href="#catalogue"
                  onClick={() => {
                    onFilterSkin("Da dầu");
                    onCloseMega();
                  }}
                >
                  <span>Da dầu</span>
                  <small>Làm sạch nhẹ, bảo vệ ráo mặt</small>
                </a>
              </div>
              <div>
                <p className="mega-title">Chọn theo nhu cầu</p>
                <a
                  href="#catalogue"
                  onClick={() => {
                    onFilterConcern("Cấp ẩm");
                    onCloseMega();
                  }}
                >
                  <span>Cấp ẩm</span>
                  <small>Cân bằng lại cảm giác khô căng</small>
                </a>
                <a
                  href="#catalogue"
                  onClick={() => {
                    onFilterConcern("Săn chắc");
                    onCloseMega();
                  }}
                >
                  <span>Săn chắc</span>
                  <small>Thiết bị và thao tác tại nhà</small>
                </a>
              </div>
              <button
                className="mega-feature"
                type="button"
                onClick={() => {
                  onCloseMega();
                  onOpenBooking();
                }}
              >
                <span>Tư vấn riêng</span>
                <strong>Chưa biết bắt đầu ở đâu?</strong>
                <small>Soi da 45 phút và nhận routine theo ngân sách.</small>
              </button>
            </div>
          </div>

          <nav
            className={`mobile-menu ${mobileOpen ? "is-open" : ""}`}
            id="mobile-navigation"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Điều hướng di động"
            aria-hidden={!mobileOpen}
            inert={!mobileOpen}
            onKeyDown={trapMobileMenuFocus}
          >
            <a
              href="#catalogue"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateMobileDestination) {
                  onNavigateMobileDestination("catalogue");
                } else {
                  onCloseMobile("navigate");
                }
              }}
            >
              Sản phẩm
            </a>
            <a
              href="#treatments"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateMobileDestination) {
                  onNavigateMobileDestination("treatments");
                } else {
                  onCloseMobile("navigate");
                }
              }}
            >
              Liệu trình
            </a>
            <a
              href="#journal"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateMobileDestination) {
                  onNavigateMobileDestination("journal");
                } else {
                  onCloseMobile("navigate");
                }
              }}
            >
              Kiến thức
            </a>
            <button
              type="button"
              onClick={() => {
                onCloseMobile("navigate");
                onOpenBooking(menuTriggerRef.current);
              }}
            >
              Đặt lịch tư vấn
            </button>
          </nav>
        </div>
      </header>

      <button
        className={`nav-scrim ${megaOpen || mobileOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Đóng menu"
        aria-hidden={!megaOpen && !mobileOpen}
        inert={!megaOpen && !mobileOpen}
        onClick={() => {
          if (mobileOpen) onCloseMobile("dismiss");
          else onCloseMega();
        }}
      />
    </>
  );
}
