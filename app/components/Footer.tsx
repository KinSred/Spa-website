"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Mail, MapPin, Phone } from "lucide-react";

type FooterProps = {
  mobileOpen: boolean;
  onOpenBooking: () => void;
};

export function Footer({ mobileOpen, onOpenBooking }: FooterProps) {
  return (
    <footer
      className={`footer-architectural ${mobileOpen ? "is-dimmed" : ""}`}
      aria-label="Thông tin liên hệ và điều hướng"
      aria-hidden={mobileOpen ? true : undefined}
      inert={mobileOpen ? true : undefined}
    >
      {/* Top Statement & Invitation Banner */}
      <div className="footer-manifesto-row">
        <div className="manifesto-text-wrap">
          <span className="manifesto-badge">TĨNH SKIN ATELIER · TP. HỒ CHÍ MINH</span>
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

      {/* Structured Directory Grid */}
      <div className="footer-directory-grid">
        {/* Atelier Context Column */}
        <div className="directory-column col-atelier">
          <span className="directory-heading">KHÔNG GIAN TIẾP ĐÓN</span>
          <div className="atelier-contact-block">
            <div className="contact-item">
              <MapPin size={16} aria-hidden="true" />
              <span>Không gian phòng cabine TĨNH · TP. Hồ Chí Minh</span>
            </div>
            <div className="contact-item">
              <Clock size={16} aria-hidden="true" />
              <span>Thứ Hai – Chủ Nhật: 09:00 – 20:00 (Theo lịch hẹn trước)</span>
            </div>
            <div className="contact-item">
              <Phone size={16} aria-hidden="true" />
              <span>Hỗ trợ tư vấn trực tuyến và tiếp đón tại atelier</span>
            </div>
            <div className="contact-item">
              <Mail size={16} aria-hidden="true" />
              <span>Đặt hẹn và tư vấn cá nhân qua hệ thống trực tuyến</span>
            </div>
          </div>
        </div>

        {/* Formulations Navigation */}
        <div className="directory-column">
          <span className="directory-heading">CÔNG THỨC CHĂM DA</span>
          <ul className="directory-list">
            <li><a href="#catalogue">Tinh chất phục hồi (Sérum)</a></li>
            <li><a href="#catalogue">Làm sạch dịu nhẹ (Nettoyant)</a></li>
            <li><a href="#catalogue">Dưỡng ẩm khóa màng (Crème)</a></li>
            <li><a href="#catalogue">Dầu dưỡng thực vật (Huile)</a></li>
            <li><a href="#catalogue">Bảo vệ quang phổ (Écran 50)</a></li>
            <li><a href="#catalogue">Thiết bị nâng cơ (Sculpt I)</a></li>
          </ul>
        </div>

        {/* Cabine Services */}
        <div className="directory-column">
          <span className="directory-heading">LIỆU TRÌNH ATELIER</span>
          <ul className="directory-list">
            <li><a href="#treatments">Soi da &amp; Thiết kế routine (45 phút)</a></li>
            <li><a href="#treatments">Calme - Phục hồi hàng rào (75 phút)</a></li>
            <li><a href="#treatments">Clarté - Làm sạch chuyên sâu (90 phút)</a></li>
            <li><button type="button" onClick={onOpenBooking}>Đặt khung giờ trực tuyến</button></li>
          </ul>
        </div>

        {/* Philosophy & Links */}
        <div className="directory-column">
          <span className="directory-heading">HỒ SƠ & THÔNG TIN</span>
          <ul className="directory-list">
            <li><a href="#journal">Góc nhìn chuyên đề</a></li>
            <li><Link href="/admin">Khu vực quản trị ca trực</Link></li>
            <li><span>Cam kết không hương liệu nhân tạo</span></li>
            <li><span>Triết lý bảo vệ hàng rào da</span></li>
          </ul>
        </div>
      </div>

      {/* Massive Typographic Wordmark Watermark */}
      <div className="footer-watermark-wrap" aria-hidden="true">
        <span className="footer-giant-wordmark">TĨNH</span>
      </div>

      {/* Base Copyright & Disclaimers */}
      <div className="footer-base-rail">
        <p className="copyright-text">
          © {new Date().getFullYear()} TĨNH Skin Atelier. Nghi thức chăm sóc da tối giản & phục hồi hàng rào sinh học.
        </p>
        <span className="legal-notice">
          Chăm sóc da khoa học và phục hồi màng ẩm tự nhiên.
        </span>
      </div>
    </footer>
  );
}
