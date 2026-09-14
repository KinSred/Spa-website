"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  FileSpreadsheet,
  LayoutDashboard,
  Package,
  ShoppingBag,
  UsersRound,
  X,
} from "lucide-react";
import { RefObject } from "react";

export type AdminTab =
  | "overview"
  | "products"
  | "orders"
  | "appointments"
  | "customers"
  | "reports";

type AdminSidebarProps = {
  tab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  mobileNav: boolean;
  onCloseMobileNav: () => void;
  sidebarRef: RefObject<HTMLElement | null>;
  isMobileLayout: boolean;
  lowStockCount: number;
  inert?: boolean;
};

export function AdminSidebar({
  tab,
  onSelectTab,
  mobileNav,
  onCloseMobileNav,
  sidebarRef,
  isMobileLayout,
  lowStockCount,
  inert,
}: AdminSidebarProps) {
  const trapSidebarFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!mobileNav || event.key !== "Tab") return;
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
      <aside
        className={`admin-sidebar ${mobileNav ? "is-open" : ""}`}
        id="admin-navigation"
        ref={sidebarRef}
        role={isMobileLayout ? "dialog" : undefined}
        aria-modal={isMobileLayout && mobileNav ? "true" : undefined}
        aria-label={isMobileLayout ? "Điều hướng quản trị" : undefined}
        aria-hidden={isMobileLayout && !mobileNav}
        inert={inert ?? (isMobileLayout && !mobileNav)}
        onKeyDown={trapSidebarFocus}
      >
        <div className="admin-brand">
          <Link className="wordmark" href="/">
            TĨNH
            <span>back office</span>
          </Link>
          <button
            className="icon-button admin-close"
            type="button"
            aria-label="Đóng điều hướng"
            onClick={onCloseMobileNav}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Điều hướng quản trị">
          <button
            className={tab === "overview" ? "is-active" : ""}
            type="button"
            aria-current={tab === "overview" ? "page" : undefined}
            onClick={() => onSelectTab("overview")}
          >
            <LayoutDashboard size={19} aria-hidden="true" />
            Tổng quan
          </button>
          <button
            className={tab === "products" ? "is-active" : ""}
            type="button"
            aria-current={tab === "products" ? "page" : undefined}
            onClick={() => onSelectTab("products")}
          >
            <Package size={19} aria-hidden="true" />
            Sản phẩm
            {lowStockCount > 0 && <span>{lowStockCount}</span>}
          </button>
          <button
            className={tab === "orders" ? "is-active" : ""}
            type="button"
            aria-current={tab === "orders" ? "page" : undefined}
            onClick={() => onSelectTab("orders")}
          >
            <ShoppingBag size={19} aria-hidden="true" />
            Đơn hàng
          </button>
          <button
            className={tab === "appointments" ? "is-active" : ""}
            type="button"
            aria-current={tab === "appointments" ? "page" : undefined}
            onClick={() => onSelectTab("appointments")}
          >
            <CalendarDays size={19} aria-hidden="true" />
            Lịch hẹn
          </button>
          <button
            className={tab === "customers" ? "is-active" : ""}
            type="button"
            aria-current={tab === "customers" ? "page" : undefined}
            onClick={() => onSelectTab("customers")}
          >
            <UsersRound size={19} aria-hidden="true" />
            Khách hàng
          </button>
          <button
            className={tab === "reports" ? "is-active" : ""}
            type="button"
            aria-current={tab === "reports" ? "page" : undefined}
            onClick={() => onSelectTab("reports")}
          >
            <FileSpreadsheet size={19} aria-hidden="true" />
            Báo cáo
          </button>
        </nav>

        <div className="admin-sidebar-foot">
          <p>Không gian vận hành</p>
          <span>Đơn hàng và lịch hẹn được đồng bộ từ storefront</span>
          <Link href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Về cửa hàng
          </Link>
        </div>
      </aside>

      <button
        className={`admin-scrim ${mobileNav ? "is-open" : ""}`}
        type="button"
        aria-label="Đóng điều hướng"
        aria-hidden={!mobileNav}
        inert={!mobileNav}
        onClick={onCloseMobileNav}
      />
    </>
  );
}
