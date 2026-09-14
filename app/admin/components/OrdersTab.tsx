"use client";

import { ArrowDownToLine } from "lucide-react";
import { type CommerceOrder } from "../../commerce-storage";
import { OrderTable } from "./OrderTable";

type OrdersTabProps = {
  orders: CommerceOrder[];
  onAdvanceOrder: (id: string) => void;
  onExportExcel: () => void;
};

export function OrdersTab({
  orders,
  onAdvanceOrder,
  onExportExcel,
}: OrdersTabProps) {
  return (
    <section className="admin-list-section">
      <header>
        <div>
          <span>Đơn hàng</span>
          <strong>Theo dõi trạng thái xử lý</strong>
        </div>
        <button type="button" onClick={onExportExcel}>
          <ArrowDownToLine size={17} aria-hidden="true" />
          Xuất Excel
        </button>
      </header>
      <OrderTable orders={orders} onAdvance={onAdvanceOrder} />
    </section>
  );
}
