"use client";

type MobileBookingBarProps = {
  onOpenBooking: () => void;
};

export function MobileBookingBar({ onOpenBooking }: MobileBookingBarProps) {
  return (
    <aside className="mobile-booking-bar" aria-label="Thanh đặt lịch nhanh">
      <span>Tư vấn da · từ 350.000 ₫</span>
      <button type="button" onClick={onOpenBooking}>
        Đặt lịch
      </button>
    </aside>
  );
}
