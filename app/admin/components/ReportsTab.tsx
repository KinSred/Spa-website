"use client";

import { FileSpreadsheet } from "lucide-react";
import { formatMoney } from "../../data";
import { type CommerceAppointment, type CommerceOrder } from "../../commerce-storage";

type RevenueDay = {
  day: string;
  value: number;
};

type ReportsTabProps = {
  orders: CommerceOrder[];
  appointments: CommerceAppointment[];
  totalRevenue: number;
  revenue: RevenueDay[];
  peakRevenue: number;
  onExportExcel: () => void;
};

export function ReportsTab({
  orders,
  appointments,
  totalRevenue,
  revenue,
  peakRevenue,
  onExportExcel,
}: ReportsTabProps) {
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Chờ xác nhận",
  );

  return (
    <section className="report-page">
      <header>
        <div>
          <span>Báo cáo cơ bản</span>
          <h2>Doanh thu và vận hành hiện tại</h2>
          <p>
            Đơn phát sinh trên storefront được đưa vào bảng đơn hàng và file xuất.
          </p>
        </div>
        <button type="button" onClick={onExportExcel}>
          <FileSpreadsheet size={18} aria-hidden="true" />
          Xuất báo cáo Excel
        </button>
      </header>

      <div className="report-summary">
        <article>
          <span>Doanh thu sản phẩm</span>
          <strong>{formatMoney(totalRevenue)}</strong>
          <p>{orders.length} đơn hàng đã ghi nhận</p>
        </article>
        <article>
          <span>Yêu cầu dịch vụ</span>
          <strong>{appointments.length}</strong>
          <p>{pendingAppointments.length} lịch đang chờ xác nhận</p>
        </article>
      </div>

      <div
        className="report-table-region"
        role="region"
        aria-label="Bảng doanh thu theo kỳ, có thể cuộn ngang"
        tabIndex={0}
      >
        <table className="report-breakdown">
          <caption className="sr-only">
            Doanh thu và tỷ trọng theo sáu ngày gần nhất
          </caption>
          <thead>
            <tr>
              <th scope="col">Kỳ</th>
              <th scope="col">Doanh thu</th>
              <th scope="col">Tỷ trọng</th>
            </tr>
          </thead>
          <tbody>
            {revenue.map((item) => (
              <tr key={item.day}>
                <th scope="row">{item.day}</th>
                <td>
                  <strong>{formatMoney(item.value)}</strong>
                </td>
                <td>
                  <span className="report-share">
                    <i
                      aria-hidden="true"
                      style={
                        {
                          "--share-scale": item.value / peakRevenue,
                        } as React.CSSProperties
                      }
                    />
                    <small>
                      {totalRevenue
                        ? Math.round((item.value / totalRevenue) * 100)
                        : 0}
                      %
                    </small>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
