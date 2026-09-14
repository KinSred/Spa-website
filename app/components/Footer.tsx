"use client";

import Link from "next/link";

type FooterProps = {
  mobileOpen: boolean;
  onOpenBooking: () => void;
};

export function Footer({ mobileOpen, onOpenBooking }: FooterProps) {
  return (
    <footer className="site-footer" inert={mobileOpen}>
      <p className="footer-statement">
        Chăm da tại nhà và tại spa nên là một câu chuyện liền mạch.
      </p>
      <div className="footer-meta">
        <Link className="wordmark footer-wordmark" href="/">
          TĨNH
        </Link>
        <div className="footer-links">
          <a href="#catalogue">Sản phẩm</a>
          <button type="button" onClick={onOpenBooking}>
            Đặt lịch
          </button>
          <Link href="/admin">Quản trị</Link>
        </div>
        <span className="footer-copyright">© 2026 TĨNH Skin Atelier</span>
      </div>
    </footer>
  );
}
