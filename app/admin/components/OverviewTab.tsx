"use client";

import {
  ArrowDownToLine,
  ChevronRight,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { formatMoney, type Product } from "../../data";
import { type CommerceAppointment, type CommerceOrder } from "../../commerce-storage";
import { OrderTable } from "./OrderTable";
import { type AdminTab } from "./AdminSidebar";

type RevenueDay = {
  day: string;
  value: number;
};

type OverviewTabProps = {
  orders: CommerceOrder[];
  appointments: CommerceAppointment[];
  inventory: Array<Product & { visible?: boolean }>;
  totalRevenue: number;
  revenue: RevenueDay[];
  peakRevenue: number;
  onAdvanceOrder: (id: string) => void;
  onSelectTab: (tab: AdminTab) => void;
  onExportExcel: () => void;
};

export function OverviewTab({
  orders,
  appointments,
  inventory,
  totalRevenue,
  revenue,
  peakRevenue,
  onAdvanceOrder,
  onSelectTab,
  onExportExcel,
}: OverviewTabProps) {
  const lowStock = inventory.filter((product) => product.stock <= 5);
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Chờ xác nhận",
  );
  const activeOrders = orders.filter((order) => order.status !== "Hoàn tất");

  return (
    <>
      <section className="admin-intro">
        <div>
          <p>Dữ liệu vận hành · cập nhật trên thiết bị này</p>
          <h2>{pendingAppointments.length} lịch hẹn đang chờ xác nhận.</h2>
        </div>
        <button
          type="button"
          onClick={onExportExcel}
          aria-label="Xuất dữ liệu đơn hàng sang tệp Excel"
        >
          <ArrowDownToLine size={18} aria-hidden="true" />
          Xuất Excel
        </button>
      </section>

      <section className="metric-grid" aria-label="Chỉ số tổng quan">
        <article className="metric-featured">
          <span>Doanh thu ghi nhận</span>
          <strong>{formatMoney(totalRevenue)}</strong>
          <p>
            <TrendingUp size={16} aria-hidden="true" />
            {orders.length} đơn hàng trong hệ thống
          </p>
        </article>
        <article>
          <span>Đơn hàng</span>
          <strong>{orders.length}</strong>
          <p>{activeOrders.length} đơn đang xử lý</p>
        </article>
        <article>
          <span>Lịch hẹn</span>
          <strong>{appointments.length}</strong>
          <p>{pendingAppointments.length} lịch chờ xác nhận</p>
        </article>
        <article className="metric-warning">
          <span>Sắp hết hàng</span>
          <strong>{lowStock.length}</strong>
          <button type="button" onClick={() => onSelectTab("products")}>
            Xem tồn kho
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </article>
      </section>

      <section className="overview-grid">
        <figure className="revenue-card">
          <header>
            <div>
              <span>Doanh thu theo kỳ</span>
              <strong>{formatMoney(totalRevenue)}</strong>
            </div>
            <p>Đơn vị: triệu ₫</p>
          </header>
          <div className="bar-chart" aria-hidden="true">
            {revenue.map((item) => (
              <div key={item.day}>
                <span>
                  {item.value
                    ? (item.value / 1000000).toLocaleString("vi-VN", {
                        maximumFractionDigits: 1,
                      })
                    : "0"}
                </span>
                <i
                  style={
                    { "--bar-scale": item.value / peakRevenue } as React.CSSProperties
                  }
                />
                <small>{item.day}</small>
              </div>
            ))}
          </div>
          <figcaption className="sr-only">
            Doanh thu thực tế từ đơn hàng đã lưu trong sáu ngày gần nhất.
          </figcaption>
          <ul className="sr-only">
            {revenue.map((item) => (
              <li key={item.day}>
                Ngày {item.day}: {formatMoney(item.value)}
              </li>
            ))}
          </ul>
        </figure>

        <article className="low-stock-card">
          <header>
            <div>
              <span>Tồn kho cần chú ý</span>
              <strong>{lowStock.length} sản phẩm</strong>
            </div>
            <TriangleAlert size={20} aria-hidden="true" />
          </header>
          <div>
            {lowStock.map((product) => (
              <button
                type="button"
                key={product.id}
                onClick={() => onSelectTab("products")}
              >
                <span>{product.name}</span>
                <strong>{product.stock} còn lại</strong>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            ))}
            {!lowStock.length && (
              <p className="stock-healthy-note">Tất cả sản phẩm đều đủ tồn kho.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-list-section">
        <header>
          <div>
            <span>Đơn hàng gần đây</span>
            <strong>Mới nhất</strong>
          </div>
          <button type="button" onClick={() => onSelectTab("orders")}>
            Xem tất cả
          </button>
        </header>
        <OrderTable orders={orders} onAdvance={onAdvanceOrder} limit={4} />
      </section>
    </>
  );
}
