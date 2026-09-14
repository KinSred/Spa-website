"use client";

import Image from "next/image";
import { CalendarDays, Check } from "lucide-react";
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
    <section className="treatment-section" id="treatments" aria-label="Liệu trình spa">
      <figure className="treatment-visual">
        <Image
          src="/consultation.webp"
          alt="Chuyên viên TĨNH kiểm tra tình trạng da trong buổi tư vấn"
          width={1280}
          height={956}
          unoptimized
          loading="lazy"
          sizes="(min-width: 960px) 48vw, 100vw"
        />
      </figure>

      <div className="treatment-copy">
        <header>
          <p>Tư vấn & liệu trình</p>
          <h2>Đặt một buổi, mang về một kế hoạch.</h2>
          <span>
            Mỗi lịch hẹn bắt đầu bằng việc xem lại routine hiện tại - kể cả
            sản phẩm không mua tại TĨNH.
          </span>
        </header>

        <div className="service-selector" aria-label="Chọn liệu trình">
          {services.map((service) => {
            const selected = selectedServiceId === service.id;
            return (
              <button
                className={selected ? "is-selected" : ""}
                type="button"
                aria-pressed={selected}
                key={service.id}
                onClick={() => onSelectService(service.id)}
              >
                <span className="service-title-group">
                  <strong>{service.name}</strong>
                  <small>{service.duration}</small>
                </span>
                <span className="service-price-group">
                  {formatMoney(service.price)}
                  {selected && <Check size={16} aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>

        <p className="selected-service-note" aria-live="polite">
          {activeService.description}
        </p>

        <ol className="booking-steps">
          <li>
            <span>01</span>
            <div>
              <h3>Chọn điều bạn cần</h3>
              <p>Tư vấn routine, phục hồi hoặc làm sạch chuyên sâu.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Chọn khung giờ</h3>
              <p>Yêu cầu được lưu ngay để quản trị viên xác nhận.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Giữ hồ sơ da</h3>
              <p>Ghi chú sau buổi hẹn nối tiếp với lịch mua sản phẩm.</p>
            </div>
          </li>
        </ol>

        <button
          className="primary-action"
          type="button"
          onClick={() => onChooseServiceAndBook(selectedServiceId)}
        >
          Chọn lịch phù hợp
          <CalendarDays size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
