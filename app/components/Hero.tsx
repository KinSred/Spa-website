"use client";

import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";

type HeroProps = {
  onOpenBooking: () => void;
};

export function Hero({ onOpenBooking }: HeroProps) {
  return (
    <section className="hero-editorial" aria-label="Giới thiệu TĨNH Skin Atelier">
      <div className="hero-dominant-grid">
        <div className="hero-editorial-copy">
          <span className="hero-eyebrow">CHĂM SÓC DA &amp; LIỆU TRÌNH ATELIER</span>
          <h1 className="hero-headline">
            Chăm da, không chia đôi.
          </h1>
          <p className="hero-summary">
            Sự nhất quán giữa các bước dưỡng tinh gọn tại nhà và những buổi chăm sóc
            chuyên sâu định kỳ tại atelier. Không chạy theo xu hướng hoạt chất quá tải;
            ưu tiên phục hồi và duy trì màng ẩm tự nhiên.
          </p>
          <div className="hero-actions">
            <a className="hero-cta-primary" href="#catalogue">
              <span>Khám phá sản phẩm</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <button
              className="hero-cta-secondary"
              type="button"
              onClick={onOpenBooking}
            >
              <Calendar size={16} aria-hidden="true" />
              <span>Đặt lịch tư vấn</span>
            </button>
          </div>
        </div>

        <figure className="hero-figure">
          <div className="hero-image-wrap">
            <Image
              src="/hero-treatment.webp"
              alt="Chuyên viên nhỏ serum trong một buổi chăm sóc da tại TĨNH"
              width={1600}
              height={833}
              unoptimized
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <figcaption className="hero-caption">
            Nghi thức Calme tại atelier · Phục hồi hàng rào màng ẩm tự nhiên
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

