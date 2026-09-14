"use client";

import Link from "next/link";
import { CalendarDays, Check } from "lucide-react";
import { type CommerceAppointment } from "../../commerce-storage";

type AppointmentsTabProps = {
  appointments: CommerceAppointment[];
  onConfirmAppointment: (id: string) => void;
};

const formatAppointmentDate = (value: string) => {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}` : value;
};

export function AppointmentsTab({
  appointments,
  onConfirmAppointment,
}: AppointmentsTabProps) {
  return (
    <section className="admin-list-section">
      <header>
        <div>
          <span>Lịch hẹn</span>
          <strong>Yêu cầu mới nhất</strong>
        </div>
      </header>
      <div className="appointment-list">
        {appointments.map((appointment) => (
          <article key={appointment.id}>
            <div className="appointment-time">
              <span>{appointment.id}</span>
              <strong>
                {formatAppointmentDate(appointment.date)} · {appointment.time}
              </strong>
            </div>
            <div className="appointment-client">
              <strong>{appointment.customer}</strong>
              <span>{appointment.service}</span>
            </div>
            <span
              className={`status-badge ${
                appointment.status === "Đã xác nhận" ? "status-complete" : ""
              }`}
              aria-live="polite"
            >
              {appointment.status}
            </span>
            <button
              type="button"
              disabled={appointment.status === "Đã xác nhận"}
              onClick={() => onConfirmAppointment(appointment.id)}
            >
              <Check size={16} aria-hidden="true" />
              {appointment.status === "Đã xác nhận" ? "Đã xác nhận" : "Xác nhận"}
            </button>
          </article>
        ))}
        {!appointments.length && (
          <div className="admin-empty-state">
            <CalendarDays size={22} aria-hidden="true" />
            <strong>Chưa có yêu cầu lịch hẹn.</strong>
            <span>Lịch khách gửi từ storefront sẽ xuất hiện tại đây.</span>
            <Link href="/">Mở cửa hàng</Link>
          </div>
        )}
      </div>
    </section>
  );
}
