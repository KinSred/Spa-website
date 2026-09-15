"use client";

import Image from "next/image";
import { ArrowRight, Calendar, Check, Clock, Sparkles } from "lucide-react";
import { formatMoney, services } from "../data";

type TreatmentSectionProps = {
  selectedServiceId: string;
  onSelectService: (id: string) => void;
  onChooseServiceAndBook: (id: string) => void;
};

export function TreatmentSection({
  selectedServiceId,
  onSelectService,
  onChooseServiceAndBook,
}: TreatmentSectionProps) {
  const activeService =
    services.find((service) => service.id === selectedServiceId) ?? services[0];

  return (
    <section className="treatment-editorial-suite" id="treatments" aria-label="Liệu trình phòng cabine">
      <div className="treatment-suite-grid">
        {/* Left Column: Protocol Monograph & Philosophy */}
        <div className="protocol-monograph">
          <div className="protocol-meta">
            <span className="protocol-badge">NGHI THỨC PHÒNG CABINE</span>
            <span className="protocol-roman">IV · CABINE PROTOCOLS</span>
          </div>

          <h2 className="protocol-title">
            Đặt một buổi, mang về một kế hoạch.
          </h2>

          <p className="protocol-subtext">
            Mỗi lịch hẹn bắt đầu bằng việc xem lại routine hiện tại. Liệu trình
            tập trung vào làm sạch dịu, làm mát và hỗ trợ củng cố màng ẩm tự
            nhiên cho làn da.
          </p>

          {/* Sequential 3-Step Protocol Progress */}
          <div className="protocol-steps-list" aria-label="Các bước trong một buổi hẹn">
            <div className="protocol-step-item">
              <span className="step-num">01</span>
              <div className="step-content">
                <strong>Soi da & phân tích routine hiện tại</strong>
                <p>
                  Quan sát bề mặt da, làm sạch dịu nhẹ và thảo luận về các thói
                  quen chăm sóc hằng ngày.
                </p>
              </div>
            </div>

            <div className="protocol-step-item">
              <span className="step-num">02</span>
              <div className="step-content">
                <strong>Chăm sóc phù hợp theo tình trạng da</strong>
                <p>
                  Thực hiện làm dịu, cấp ẩm hoặc làm sạch lỗ chân lông nhẹ
                  nhàng theo liệu trình đã chọn.
                </p>
              </div>
            </div>

            <div className="protocol-step-item">
              <span className="step-num">03</span>
              <div className="step-content">
                <strong>Định hướng kế hoạch tại nhà</strong>
                <p>
                  Chuyên viên chia sẻ các bước chăm sóc tiếp nối tại nhà để hỗ
                  trợ làn da duy trì trạng thái cân bằng.
                </p>
              </div>
            </div>
          </div>

          <button
            className="protocol-main-cta"
            type="button"
            onClick={() => onChooseServiceAndBook(activeService.id)}
          >
            <Calendar size={18} aria-hidden="true" />
            <span>Chọn lịch phù hợp</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Right Column: Visual Frame & Interactive Service Selector */}
        <div className="protocol-showcase">
          {/* Architectural Cabine Image Frame */}
          <figure className="cabine-visual-frame">
            <Image
              src="/consultation.webp"
              alt="Chuyên viên TĨNH kiểm tra tình trạng da trong buổi tư vấn"
              width={1280}
              height={956}
              unoptimized
              loading="lazy"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
            <figcaption className="cabine-visual-tag">
              <span>CABINE 02 · TĨNH ATELIER</span>
            </figcaption>
          </figure>

          {/* Interactive Service Selector Dossier */}
          <div className="service-dossier-panel" aria-label="Lựa chọn gói dịch vụ">
            <div className="dossier-heading">
              <Sparkles size={16} aria-hidden="true" />
              <span>DANH MỤC DỊCH VỤ HIỆN HÀNH</span>
            </div>

            <div className="service-cards-stack">
              {services.map((service, index) => {
                const isSelected = selectedServiceId === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    className={`service-card-item ${isSelected ? "is-active" : ""}`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectService(service.id)}
                  >
                    <div className="service-item-top">
                      <span className="service-order">0{index + 1}</span>
                      <strong className="service-item-name">{service.name}</strong>
                      <span className="service-duration-badge">
                        <Clock size={13} aria-hidden="true" />
                        {service.duration}
                      </span>
                    </div>

                    <div className="service-item-bottom">
                      <p className="service-item-desc">{service.description}</p>
                      <div className="service-item-pricing">
                        <strong className="service-price">
                          {formatMoney(service.price)}
                        </strong>
                        {isSelected && (
                          <span className="selected-indicator" aria-label="Đang chọn">
                            <Check size={14} aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
