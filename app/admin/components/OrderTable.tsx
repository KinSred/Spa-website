"use client";

import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { formatMoney } from "../../data";
import { type CommerceOrder } from "../../commerce-storage";

type OrderTableProps = {
  orders: CommerceOrder[];
  onAdvance: (id: string) => void;
  limit?: number;
};

export function OrderTable({ orders, onAdvance, limit }: OrderTableProps) {
  const displayedOrders = limit ? orders.slice(0, limit) : orders;

  if (!displayedOrders.length) {
    return (
      <div className="admin-empty-state">
        <ShoppingBag size={22} aria-hidden="true" />
        <strong>Chưa có đơn hàng.</strong>
        <span>Đơn được tạo từ giỏ hàng sẽ xuất hiện tại đây.</span>
        <Link href="/">Mở cửa hàng</Link>
      </div>
    );
  }

  return (
    <div
      className="order-table"
      role="region"
      aria-label="Bảng đơn hàng, có thể cuộn ngang"
      tabIndex={0}
    >
      <table>
        <caption className="sr-only">
          Danh sách đơn hàng, khách hàng, tổng tiền, trạng thái và thao tác
        </caption>
        <thead>
          <tr>
            <th scope="col">Mã đơn</th>
            <th scope="col">Khách hàng</th>
            <th scope="col">Tổng</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {displayedOrders.map((order) => (
            <tr key={order.id}>
              <th scope="row" data-label="Mã đơn">
                {order.id}
              </th>
              <td data-label="Khách hàng">{order.customer}</td>
              <td data-label="Tổng">{formatMoney(order.total)}</td>
              <td data-label="Trạng thái">
                <span
                  className={`status-badge status-${order.status
                    .toLocaleLowerCase("vi")
                    .replaceAll(" ", "-")}`}
                  aria-live="polite"
                >
                  {order.status}
                </span>
              </td>
              <td data-label="Thao tác">
                <button
                  type="button"
                  disabled={order.status === "Hoàn tất"}
                  aria-label={
                    order.status === "Hoàn tất"
                      ? `${order.id} đã hoàn tất`
                      : `Chuyển ${order.id} sang bước tiếp theo`
                  }
                  onClick={() => onAdvance(order.id)}
                >
                  {order.status === "Hoàn tất" ? "Đã xong" : "Chuyển bước"}
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
