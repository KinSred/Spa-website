"use client";

import { ArrowRight, Calendar, Check, Clock3, Sparkles, X } from "lucide-react";
import { FormEvent, RefObject } from "react";
import { formatMoney, services } from "../data";
import {
  formatVietnameseDate,
  formatVietnameseDateLong,
  getUpcomingDates,
} from "../date-utils";

export type BookingState = "idle" | "submitting" | "confirmed";

export type BookingOpenOptions = { opener?: HTMLElement | null };

export const CANONICAL_TIME_SLOTS = [
  "09:00–11:00",
  "11:00–13:00",
  "14:00–16:00",
  "16:00–18:00",
  "18:00–20:00",
];

type BookingDialogProps = {
  bookingDialogRef: RefObject<HTMLDialogElement | null>;
  bookingInitialFocusRef: RefObject<HTMLButtonElement | null>;
  bookingState: BookingState;
  bookingReference: string | null;
  selectedServiceId: string;
  onSelectServiceId: (id: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  onSubmitBooking: (event: FormEvent<HTMLFormElement>) => void;
  onCloseDialog: () => void;
};

export function BookingDialog({
  bookingDialogRef,
  bookingInitialFocusRef,
  bookingState,
  bookingReference,
  selectedServiceId,
  onSelectServiceId,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  onSubmitBooking,
  onCloseDialog,
}: BookingDialogProps) {
  const requestClose = () => {
    const dialog = bookingDialogRef.current;
    if (dialog && typeof dialog.close === "function") {
      dialog.close();
    } else {
      onCloseDialog();
    }
  };

  const currentService =
    services.find((item) => item.id === selectedServiceId) ?? services[0];

  const dateOptions = getUpcomingDates(10);

  return (
    <dialog
      className="booking-dialog studio-booking-modal"
      ref={bookingDialogRef}
      aria-labelledby="booking-title"
      aria-describedby="booking-description"
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      onClose={onCloseDialog}
    >
      <form
        method="dialog"
        onSubmit={onSubmitBooking}
        aria-busy={bookingState === "submitting"}
      >
        <header className="booking-modal-header">
          <div>
            <span className="booking-kicker">TĨNH APPOINTMENT STUDIO</span>
            <h2 id="booking-title">Chọn một khoảng dành cho làn da.</h2>
            <p id="booking-description">
              Khung giờ tư vấn và chăm sóc chuyên sâu tại phòng cabine.
            </p>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Đóng biểu mẫu"
            onClick={requestClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {bookingState === "confirmed" ? (
          <div className="booking-confirmation studio-booking-confirmed" role="status">
            <span className="confirmation-icon" aria-hidden="true">
              <Check size={26} />
            </span>
            <p className="confirmation-lead">Yêu cầu lịch đã được ghi nhận</p>
            <h3 className="confirmation-code">{bookingReference}</h3>

            <div className="confirmation-dossier">
              <div className="dossier-row">
                <span>Liệu trình:</span>
                <strong>{currentService.name}</strong>
              </div>
              <div className="dossier-row">
                <span>Thời lượng:</span>
                <span>{currentService.duration}</span>
              </div>
              <div className="dossier-row">
                <span>Ngày hẹn:</span>
                <strong>{formatVietnameseDate(selectedDate)}</strong>
              </div>
              <div className="dossier-row">
                <span>Khung giờ:</span>
                <strong>{selectedTime}</strong>
              </div>
              <div className="dossier-row">
                <span>Trạng thái:</span>
                <span className="status-badge">Chờ xác nhận</span>
              </div>
            </div>

            <small className="confirmation-note">
              Thông tin đã được lưu lại trên thiết bị này. Bạn chưa cần thanh toán trước.
            </small>

            <button
              className="primary-action"
              type="button"
              onClick={requestClose}
            >
              Hoàn tất
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="booking-body-flow">
            {/* Hidden form values preserving standard FormData contracts */}
            <input type="hidden" name="service" value={selectedServiceId} />
            <input type="hidden" name="date" value={selectedDate} />
            <input type="hidden" name="time" value={selectedTime} />

            {/* Step 1: Select Service */}
            <section className="booking-step-section" aria-label="1. Chọn liệu trình">
              <div className="step-section-heading">
                <span className="step-tag">BƯỚC 01</span>
                <h3>Chọn liệu trình</h3>
              </div>
              <div
                className="booking-service-cards"
                role="group"
                aria-label="Danh sách liệu trình"
              >
                {services.map((service, index) => {
                  const isSelected = selectedServiceId === service.id;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      ref={index === 0 ? bookingInitialFocusRef : undefined}
                      className={`booking-service-card ${isSelected ? "is-selected" : ""}`}
                      aria-pressed={isSelected}
                      onClick={() => onSelectServiceId(service.id)}
                    >
                      <div className="card-meta-line">
                        <strong className="service-name">{service.name}</strong>
                        <span className="service-duration">{service.duration}</span>
                      </div>
                      <p className="service-desc">{service.description}</p>
                      <div className="card-footer-line">
                        <span className="service-fee">{formatMoney(service.price)}</span>
                        {isSelected && (
                          <span className="selection-badge" aria-label="Đang chọn">
                            <Check size={14} aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Select Date (Localized dd/mm/yyyy) */}
            <section className="booking-step-section" aria-label="2. Chọn ngày mong muốn">
              <div className="step-section-heading">
                <span className="step-tag">BƯỚC 02</span>
                <div className="step-title-row">
                  <h3>Ngày mong muốn</h3>
                  <span className="current-date-preview">
                    {formatVietnameseDateLong(selectedDate)}
                  </span>
                </div>
              </div>
              <div
                className="booking-date-strip"
                role="group"
                aria-label="Lựa chọn ngày hẹn theo lịch Việt"
              >
                {dateOptions.map((opt) => {
                  const isSelected = selectedDate === opt.iso;
                  return (
                    <button
                      key={opt.iso}
                      type="button"
                      className={`date-chip ${isSelected ? "is-selected" : ""} ${
                        opt.isToday ? "is-today" : ""
                      }`}
                      aria-pressed={isSelected}
                      onClick={() => onSelectDate(opt.iso)}
                    >
                      <span className="date-weekday">{opt.weekday}</span>
                      <strong className="date-num">{opt.display}</strong>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 3: Select Time Window */}
            <section className="booking-step-section" aria-label="3. Chọn khung giờ">
              <div className="step-section-heading">
                <span className="step-tag">BƯỚC 03</span>
                <h3>Khung giờ tiếp đón</h3>
              </div>
              <div
                className="booking-time-grid"
                role="group"
                aria-label="Khung giờ tiếp đón"
              >
                {CANONICAL_TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot-btn ${isSelected ? "is-selected" : ""}`}
                      aria-pressed={isSelected}
                      onClick={() => onSelectTime(slot)}
                    >
                      <Clock3 size={15} aria-hidden="true" />
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 4: Customer Details */}
            <section className="booking-step-section" aria-label="4. Thông tin liên hệ">
              <div className="step-section-heading">
                <span className="step-tag">BƯỚC 04</span>
                <h3>Thông tin người hẹn</h3>
              </div>
              <div className="booking-inputs-grid">
                <label className="booking-field">
                  <span>Họ và tên</span>
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Nguyễn An"
                  />
                  <small>Tên dùng để đón tiếp tại atelier.</small>
                </label>
                <label className="booking-field">
                  <span>Số điện thoại</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    inputMode="tel"
                    pattern="[0-9+\s]{9,14}"
                    placeholder="090 123 4567"
                  />
                  <small>Dùng để xác nhận thông tin lịch hẹn.</small>
                </label>
                <label className="booking-field full-width">
                  <span>Ghi chú cho chuyên viên (không bắt buộc)</span>
                  <textarea
                    name="note"
                    placeholder="Tình trạng da hiện tại hoặc điều bạn muốn chuyên viên lưu ý…"
                  />
                  <small>Không cần ghi chép lịch sử y khoa nhạy cảm tại đây.</small>
                </label>
              </div>
            </section>

            {/* Pre-submission Summary */}
            <div className="booking-summary-strip" aria-label="Tóm tắt yêu cầu hẹn">
              <div className="summary-left">
                <Sparkles size={16} aria-hidden="true" />
                <div>
                  <strong>{currentService.name}</strong>
                  <span>
                    {formatVietnameseDate(selectedDate)} · {selectedTime} · {currentService.duration}
                  </span>
                </div>
              </div>
              <div className="summary-right">
                <span className="summary-price-label">Dự tính:</span>
                <strong className="summary-price">{formatMoney(currentService.price)}</strong>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <footer className="booking-modal-footer">
              <p className="booking-policy-note">
                <Calendar size={15} aria-hidden="true" />
                Yêu cầu lịch chưa phải xác nhận cuối cùng. Bạn chưa cần thanh toán.
              </p>
              <button
                className="primary-action"
                type="submit"
                disabled={bookingState === "submitting"}
              >
                {bookingState === "submitting" ? "Đang ghi nhận…" : "Gửi yêu cầu lịch"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </footer>
          </div>
        )}
      </form>
    </dialog>
  );
}
