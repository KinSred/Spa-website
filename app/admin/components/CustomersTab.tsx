"use client";

import Link from "next/link";
import { Check, CircleUserRound, UsersRound } from "lucide-react";

export type AdminCustomer = {
  id: string;
  name: string;
  lastVisit: string;
  orders: number;
  note: string;
};

type CustomersTabProps = {
  customers: AdminCustomer[];
  onUpdateCustomerNote: (id: string, note: string) => void;
  onSaveCustomerNote: (id: string, note: string) => void;
  savedNoteId: string | null;
};

export function CustomersTab({
  customers,
  onUpdateCustomerNote,
  onSaveCustomerNote,
  savedNoteId,
}: CustomersTabProps) {
  return (
    <section className="admin-list-section">
      <header>
        <div>
          <span>Khách hàng & ghi chú</span>
          <strong>Hồ sơ chăm sóc nội bộ</strong>
        </div>
      </header>
      <div className="customer-list">
        {customers.map((customer) => (
          <article key={customer.id}>
            <header>
              <span className="customer-avatar">
                <CircleUserRound size={21} aria-hidden="true" />
              </span>
              <div>
                <strong>{customer.name}</strong>
                <small>
                  {customer.id} · {customer.orders} đơn · ghé gần nhất{" "}
                  {customer.lastVisit}
                </small>
              </div>
            </header>
            <label>
              <span>Ghi chú nội bộ</span>
              <textarea
                value={customer.note}
                onChange={(event) =>
                  onUpdateCustomerNote(customer.id, event.target.value)
                }
              />
            </label>
            <button
              className={savedNoteId === customer.id ? "is-saved" : ""}
              type="button"
              onClick={() => onSaveCustomerNote(customer.id, customer.note)}
            >
              {savedNoteId === customer.id ? (
                <>
                  <Check size={16} aria-hidden="true" />
                  Đã lưu
                </>
              ) : (
                "Lưu ghi chú"
              )}
            </button>
          </article>
        ))}
        {!customers.length && (
          <div className="admin-empty-state">
            <UsersRound size={22} aria-hidden="true" />
            <strong>Chưa có hồ sơ khách hàng.</strong>
            <span>Hồ sơ được tạo khi storefront nhận đơn hoặc lịch hẹn.</span>
            <Link href="/">Mở cửa hàng</Link>
          </div>
        )}
      </div>
    </section>
  );
}
