"use client";

import { Menu } from "lucide-react";
import { RefObject } from "react";

type AdminHeaderProps = {
  tabTitle: string;
  onOpenMobileNav: () => void;
  mobileNav: boolean;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
  pageTitleRef: RefObject<HTMLHeadingElement | null>;
};

export function AdminHeader({
  tabTitle,
  onOpenMobileNav,
  mobileNav,
  menuTriggerRef,
  pageTitleRef,
}: AdminHeaderProps) {
  return (
    <header className="admin-topbar">
      <div>
        <button
          className="icon-button admin-menu"
          type="button"
          ref={menuTriggerRef}
          aria-label="Mở điều hướng"
          aria-expanded={mobileNav}
          aria-controls="admin-navigation"
          onClick={onOpenMobileNav}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <div>
          <span>TĨNH Spa Commerce</span>
          <h1 id="admin-page-title" ref={pageTitleRef} tabIndex={-1}>
            {tabTitle}
          </h1>
        </div>
      </div>
      <div className="admin-user">
        <span>DA</span>
        <div>
          <strong>Điều phối TĨNH</strong>
          <small>Quản trị viên</small>
        </div>
      </div>
    </header>
  );
}
