"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, Calendar, Sparkles } from "lucide-react";

type HeroProps = {
  onOpenBooking: () => void;
};

export function Hero({ onOpenBooking }: HeroProps) {
  return (
    <section className="hero-editorial" aria-label="Giới thiệu TĨNH Skin Atelier">
      {/* Atelier Top Context Rail */}
      <div className="hero-top-rail">
        <div className="atelier-stamp">
          <span>TĨNH SKIN ATELIER</span>
        </div>
        <span className="atelier-hours">
          Chăm sóc da &amp; Liệu trình chuyên sâu
        </span>
      </div>

      {/* Main Asymmetric Editorial Canvas */}
      <div className="hero-canvas">
        {/* Left Column: Typographic Masthead & Dual Care Pathways */}
        <div className="hero-masthead">
          <div className="hero-kicker-group">
            <span className="hero-kicker-tag">HỒ SƠ CHĂM SÓC TOÀN DIỆN</span>
            <span className="hero-kicker-index">ATELIER DOSSIER</span>
          </div>

          <h1 className="hero-heading">
            Chăm da, không chia đôi.
          </h1>

          <p className="hero-lead">
            Sự kết hợp hài hòa giữa chăm sóc tại nhà và liệu trình tại atelier.
            Mua đúng sản phẩm cho chu trình hàng ngày; đặt đúng liệu trình cho
            những khi làn da cần chăm sóc chuyên sâu.
          </p>

          {/* Dual Care Index Pathways */}
          <div className="hero-dual-pathways" aria-label="Hai nhánh chăm sóc">
            <a className="pathway-card pathway-products" href="#catalogue">
              <div className="pathway-content">
                <span className="pathway-num">NHÁNH I · TẠI NHÀ</span>
                <strong className="pathway-title">Sản phẩm tuyển chọn</strong>
                <p className="pathway-desc">
                  6 công thức tập trung phục hồi hàng rào lipid và làm sạch dịu.
                </p>
              </div>
              <span className="pathway-action" aria-hidden="true">
                Khám phá
                <ArrowDown size={15} />
              </span>
            </a>

            <button
              className="pathway-card pathway-spa"
              type="button"
              onClick={onOpenBooking}
            >
              <div className="pathway-content">
                <span className="pathway-num">NHÁNH II · ATELIER</span>
                <strong className="pathway-title">Liệu trình phòng cabine</strong>
                <p className="pathway-desc">
                  Soi da 1:1, phục hồi Calme và làm sạch lỗ chân lông chuyên sâu.
                </p>
              </div>
              <span className="pathway-action" aria-hidden="true">
                Đặt lịch
                <ArrowUpRight size={15} />
              </span>
            </button>
          </div>

          {/* Editorial Commitments */}
          <div className="hero-commitments" aria-label="Cam kết của TĨNH">
            <div>
              <Sparkles size={16} aria-hidden="true" />
              <span>Tối giản nồng độ hoạt chất</span>
            </div>
            <div>
              <Calendar size={16} aria-hidden="true" />
              <span>Đồng hành chăm sóc cá nhân hóa</span>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Photography & Vignette */}
        <div className="hero-visual-frame">
          <figure className="hero-portrait">
            <Image
              src="/hero-treatment.webp"
              alt="Chuyên viên nhỏ serum trong một buổi chăm sóc da tại TĨNH"
              width={1600}
              height={833}
              unoptimized
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
            <figcaption className="hero-visual-caption">
              <span className="caption-tag">CABINE 01</span>
              <strong className="caption-title">Nghi thức Calme · 75 phút</strong>
              <small>Làm dịu và củng cố màng ẩm tự nhiên</small>
            </figcaption>
          </figure>

          {/* Floating Atelier Metadata Dossier */}
          <aside className="hero-vignette-card">
            <span className="vignette-label">GHI CHÚ ATELIER</span>
            <p className="vignette-quote">
              “Một làn da khỏe không đòi hỏi nhiều tầng dưỡng, mà cần sự nhất
              quán giữa việc dưỡng mỗi tối và chăm sóc định kỳ.”
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
