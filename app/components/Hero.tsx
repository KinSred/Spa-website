"use client";

import Image from "next/image";
import { ArrowRight, CircleUserRound } from "lucide-react";

type HeroProps = {
  onOpenBooking: () => void;
};

export function Hero({ onOpenBooking }: HeroProps) {
  return (
    <>
      <section className="hero hero-marquee">
        <figure className="hero-media">
          <Image
            src="/hero-treatment.webp"
            alt="Chuyên viên nhỏ serum trong một buổi chăm sóc da tại TĨNH"
            width={1600}
            height={833}
            unoptimized
            priority
            sizes="100vw"
          />
          <figcaption>
            Nghi thức phục hồi · 75 phút · Đặt theo lịch hẹn
          </figcaption>
        </figure>
        <div className="hero-copy">
          <p className="hero-kicker">TĨNH Skin Atelier</p>
          <h1>Chăm da, không chia đôi.</h1>
          <p className="hero-service-note">
            Mỹ phẩm tuyển chọn · Liệu trình theo lịch · Hồ sơ da liền mạch
          </p>
        </div>
      </section>

      <section className="hero-decision" aria-label="Bắt đầu chăm sóc">
        <div className="hero-decision-copy">
          <span>Chăm tại nhà × Chăm tại spa</span>
          <p>
            Mua đúng sản phẩm cho những ngày ở nhà. Đặt đúng liệu trình cho
            những lúc làn da cần một bàn tay có chuyên môn.
          </p>
        </div>
        <div className="hero-actions">
          <a className="primary-action" href="#catalogue">
            Chọn sản phẩm
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <button className="text-action" type="button" onClick={onOpenBooking}>
            Đặt lịch tư vấn
          </button>
        </div>
        <div className="hero-note">
          <CircleUserRound size={20} aria-hidden="true" />
          <span>Routine mua tại shop được lưu cùng ghi chú của chuyên viên.</span>
        </div>
      </section>
    </>
  );
}
