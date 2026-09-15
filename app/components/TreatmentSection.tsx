"use client";

import Image from "next/image";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { RefObject } from "react";
import { formatMoney, services } from "../data";

type TreatmentSectionProps = {
  treatmentDestinationRef?: RefObject<HTMLHeadingElement | null>;
  selectedServiceId: string;
  onSelectService: (id: string) => void;
  onChooseServiceAndBook: (id: string) => void;
};

export function TreatmentSection({
  treatmentDestinationRef,
  selectedServiceId,
  onSelectService,
  onChooseServiceAndBook,
}: TreatmentSectionProps) {
  const activeService =
    services.find((service) => service.id === selectedServiceId) ?? services[0];

  return (
    <section
      className="treatment-editorial-suite treatment-section"
      id="treatments"
      aria-label="Liệu trình phòng cabine"
    >
      <div className="protocol-container">
        {/* Header Monograph */}
        <header className="protocol-monograph treatment-copy">
          <div className="protocol-meta-rail">
            <span className="protocol-kicker">NGHI THỨC PHÒNG CABINE</span>
            <span className="protocol-index-roman">IV · CABINE PROTOCOLS</span>
          </div>
          <h2 className="protocol-title" ref={treatmentDestinationRef} tabIndex={-1}>
            Đặt một buổi, mang về một kế hoạch.
          </h2>
          <p className="protocol-lead">
            Mỗi lịch hẹn bắt đầu bằng việc quan sát da và xem lại routine hiện tại. Liệu trình
            tập trung vào làm sạch dịu, làm mát và hỗ trợ củng cố màng ẩm tự nhiên.
          </p>
        </header>

        {/* Recomposed Protocol Suite Layout: Index (Left) + Selected Narrative (Right) */}
        <div className="protocol-experience-grid">
          {/* Protocol Index Menu */}
          <div className="protocol-index-panel" aria-label="Danh mục liệu trình">
            <span className="index-panel-title">CHỌN NGHI THỨC</span>
            <div className="protocol-index-list" role="tablist" aria-label="Danh sách liệu trình">
              {services.map((service, idx) => {
                const isSelected = selectedServiceId === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`protocol-index-item ${isSelected ? "is-selected" : ""}`}
                    onClick={() => onSelectService(service.id)}
                  >
                    <div className="index-item-num">0{idx + 1}</div>
                    <div className="index-item-info">
                      <strong className="index-item-name">{service.name}</strong>
                      <span className="index-item-meta">
                        <Clock size={13} aria-hidden="true" />
                        <span>{service.duration}</span>
                        <span className="meta-sep">·</span>
                        <span>{formatMoney(service.price)}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Cabine Visual Accent */}
            <figure className="protocol-index-figure">
              <Image
                src="/consultation.webp"
                alt="Chuyên viên TĨNH kiểm tra tình trạng da trong buổi tư vấn"
                width={1280}
                height={956}
                unoptimized
                loading="lazy"
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
              <figcaption>Cabine Atelier TĨNH · Không gian riêng tư 1:1</figcaption>
            </figure>
          </div>

          {/* Selected Treatment Narrative Pane */}
          <article className="protocol-narrative-card">
            <div className="narrative-badge-row">
              <span className="narrative-tag">
                <Sparkles size={13} aria-hidden="true" />
                ĐANG CHỌN
              </span>
              <span className="narrative-duration">{activeService.duration}</span>
            </div>

            <h3 className="narrative-service-title">{activeService.name}</h3>
            <p className="narrative-desc">{activeService.description}</p>

            <div className="narrative-ritual-steps">
              <span className="steps-title">TRÌNH TỰ BUỔI HẸN</span>
              <div className="ritual-step">
                <span className="step-count">01</span>
                <div>
                  <strong>Quan sát tình trạng da &amp; routine</strong>
                  <p>Làm sạch dịu nhẹ và trao đổi về các thói quen chăm sóc hằng ngày.</p>
                </div>
              </div>
              <div className="ritual-step">
                <span className="step-count">02</span>
                <div>
                  <strong>Chăm sóc phục hồi màng ẩm</strong>
                  <p>Làm dịu, cấp ẩm và hỗ trợ bề mặt da với công thức chuyên biệt.</p>
                </div>
              </div>
              <div className="ritual-step">
                <span className="step-count">03</span>
                <div>
                  <strong>Hướng dẫn chăm sóc tiếp nối</strong>
                  <p>Chuyên viên tóm tắt các lưu ý để duy trì cảm giác cân bằng tại nhà.</p>
                </div>
              </div>
            </div>

            <div className="narrative-action-bar">
              <div className="narrative-pricing">
                <span className="price-lead-label">Chi phí</span>
                <strong className="narrative-price">{formatMoney(activeService.price)}</strong>
              </div>
              <button
                className="protocol-book-btn"
                type="button"
                onClick={() => onChooseServiceAndBook(activeService.id)}
              >
                <Calendar size={17} aria-hidden="true" />
                <span>Đặt lịch liệu trình này</span>
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

