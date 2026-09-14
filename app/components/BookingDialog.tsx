"use client";

import { ArrowRight, Check, Clock3, X } from "lucide-react";
import { FormEvent, RefObject } from "react";
import { formatMoney, services } from "../data";

type BookingState = "idle" | "submitting" | "confirmed";

type BookingDialogProps = {
  bookingDialogRef: RefObject<HTMLDialogElement | null>;
  bookingServiceRef: RefObject<HTMLSelectElement | null>;
  bookingState: BookingState;
  bookingReference: string | null;
  selectedServiceId: string;
  onSelectServiceId: (id: string) => void;
  onSubmitBooking: (event: FormEvent<HTMLFormElement>) => void;
  onCloseDialog: () => void;
};

export function BookingDialog({
  bookingDialogRef,
  bookingServiceRef,
  bookingState,
  bookingReference,
  selectedServiceId,
  onSelectServiceId,
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

  return (
    <dialog
      className="booking-dialog"
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
        <header>
          <div>
            <span>Đặt lịch</span>
            <h2 id="booking-title">Chọn một khoảng dành cho làn da.</h2>
            <p id="booking-description">
              Chọn dịch vụ và khung giờ; yêu cầu sẽ xuất hiện ngay trong khu quản trị.
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
          <div className="booking-confirmation" role="status">
            <span>
              <Check size={24} aria-hidden="true" />
            </span>
            <p>Yêu cầu đã được ghi nhận</p>
            <h3>TĨNH sẽ gọi để xác nhận khung giờ.</h3>
            <strong className="booking-reference">{bookingReference}</strong>
            <small>
              Bạn chưa cần thanh toán. Mọi thay đổi về dịch vụ có thể trao đổi
              khi lễ tân liên hệ.
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
          <>
            <div className="booking-form-grid">
              <label>
                <span>Liệu trình</span>
                <select
                  ref={bookingServiceRef}
                  name="service"
                  required
                  value={selectedServiceId}
                  onChange={(event) => onSelectServiceId(event.target.value)}
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} · {formatMoney(service.price)}
                    </option>
                  ))}
                </select>
                <small className="field-help">
                  Bạn có thể đổi lựa chọn khi TĨNH gọi xác nhận.
                </small>
              </label>
              <label>
                <span>Ngày mong muốn</span>
                <input
                  name="date"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
                <small className="field-help">
                  Mở lịch từ thứ Hai đến Chủ Nhật.
                </small>
              </label>
              <label>
                <span>Khung giờ</span>
                <select name="time" required defaultValue="">
                  <option value="" disabled>
                    Chọn khung giờ
                  </option>
                  <option>09:00-11:00</option>
                  <option>11:00-13:00</option>
                  <option>14:00-16:00</option>
                  <option>16:00-18:00</option>
                  <option>18:00-20:00</option>
                </select>
                <small className="field-help">
                  Lễ tân sẽ xác nhận giờ bắt đầu chính xác.
                </small>
              </label>
              <label>
                <span>Họ và tên</span>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Nguyễn An"
                />
                <small className="field-help">
                  Tên dùng để giữ lịch tại quầy.
                </small>
              </label>
              <label>
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
                <small className="field-help">
                  TĨNH chỉ dùng số này để xác nhận lịch.
                </small>
              </label>
              <label className="full-field">
                <span>Điều bạn muốn chuyên viên biết</span>
                <textarea
                  name="note"
                  placeholder="Da đang nhạy cảm sau treatment, routine hiện có…"
                />
                <small className="field-help">
                  Không cần ghi thông tin bệnh án nhạy cảm tại đây.
                </small>
              </label>
            </div>
            <footer>
              <p>
                <Clock3 size={17} aria-hidden="true" />
                Yêu cầu lịch chưa phải xác nhận cuối cùng.
              </p>
              <button
                className="primary-action"
                type="submit"
                disabled={bookingState === "submitting"}
              >
                {bookingState === "submitting"
                  ? "Đang gửi…"
                  : "Gửi yêu cầu lịch"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </footer>
          </>
        )}
      </form>
    </dialog>
  );
}
