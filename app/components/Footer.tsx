"use client";

import { ArrowUpRight, Calendar } from "lucide-react";

type FooterProps = {
  mobileOpen: boolean;
  onOpenBooking: () => void;
};

export function Footer({ mobileOpen, onOpenBooking }: FooterProps) {
  return (
    <footer
      className={`footer-architectural ${mobileOpen ? "is-dimmed" : ""}`}
      aria-label="Thông tin và điều hướng"
      aria-hidden={mobileOpen ? true : undefined}
      inert={mobileOpen ? true : undefined}
    >
      {/* Top Statement & Invitation Banner */}
      <div className="footer-manifesto-row">
        <div className="manifesto-text-wrap">
          <span className="manifesto-badge">TĨNH SKIN ATELIER</span>
          <p className="footer-statement">
            Một điểm dừng tĩnh lặng cho làn da giữa nhịp sống đô thị.
          </p>
        </div>

        <button
          className="footer-reserve-btn"
          type="button"
          onClick={onOpenBooking}
        >
          <Calendar size={18} aria-hidden="true" />
          <span>Đặt lịch tư vấn atelier</span>
          <ArrowUpRight size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Structured Architectural Directory Grid */}
      <div className="footer-directory-grid">
        {/* Cabine Services */}
        <div className="directory-column">
          <span className="directory-heading">LIỆU TRÌNH ATELIER</span>
          <ul className="directory-list">
            <li><a href="#treatments">Soi da &amp; Thiết kế routine (45 phút)</a></li>
            <li><a href="#treatments">Calme - Phục hồi hàng rào da (75 phút)</a></li>
            <li><a href="#treatments">Clarté - Làm sạch chuyên sâu (90 phút)</a></li>
            <li><button type="button" onClick={onOpenBooking}>Đặt lịch trực tuyến</button></li>
          </ul>
        </div>

        {/* Formulations Navigation */}
        <div className="directory-column">
          <span className="directory-heading">CÔNG THỨC CHĂM DA</span>
          <ul className="directory-list">
            <li><a href="#catalogue">Sérum Soie 01 · Phục hồi</a></li>
            <li><a href="#catalogue">Nettoyant Voile · Làm sạch dịu</a></li>
            <li><a href="#catalogue">Crème Calme · Dưỡng ẩm khóa màng</a></li>
            <li><a href="#catalogue">Huile Ambre · Dầu dưỡng khô</a></li>
            <li><a href="#catalogue">Écran 50 · Kem chống nắng</a></li>
            <li><a href="#catalogue">Sculpt I · Thiết bị massage mặt</a></li>
          </ul>
        </div>

        {/* Philosophy & Journal */}
        <div className="directory-column">
          <span className="directory-heading">TRIẾT LÝ & KIẾN THỨC</span>
          <ul className="directory-list">
            <li><a href="#journal">Góc nhìn chuyên đề</a></li>
            <li><a href="#journal">Chăm sóc màng ẩm tự nhiên</a></li>
            <li><a href="#journal">Nguyên tắc tối giản hoạt chất</a></li>
            <li><span>Hướng dẫn chăm sóc tiếp nối</span></li>
          </ul>
        </div>
      </div>

      {/* Base Architectural Signature & Copyright */}
      <div className="footer-base-rail">
        <div className="footer-signature">
          <span className="signature-brand">TĨNH</span>
          <span className="signature-sub">skin atelier</span>
        </div>
        <p className="copyright-text">
          © {new Date().getFullYear()} TĨNH Skin Atelier. Chăm sóc da khoa học và phục hồi màng ẩm tự nhiên.
        </p>
      </div>
    </footer>
  );
}
