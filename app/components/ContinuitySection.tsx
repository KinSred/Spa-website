"use client";

import { Package, Sparkles } from "lucide-react";

export function ContinuitySection() {
  return (
    <section className="continuity" aria-label="Triết lý chăm sóc">
      <div className="continuity-intro">
        <p>Điểm khác biệt của TĨNH</p>
        <h2>Shop và phòng trị liệu cùng đọc một câu chuyện về làn da.</h2>
      </div>
      <div className="continuity-flow" aria-label="Quy trình chăm sóc kết hợp">
        <article>
          <Package size={24} aria-hidden="true" />
          <span>Mang về nhà</span>
          <h3>Routine vừa đủ</h3>
          <p>Sản phẩm được lọc theo da, nhu cầu và khoảng giá bạn chọn.</p>
        </article>
        <span className="flow-rule" aria-hidden="true" />
        <article>
          <Sparkles size={24} aria-hidden="true" />
          <span>Thực hiện tại spa</span>
          <h3>Liệu trình có ngữ cảnh</h3>
          <p>Chuyên viên xem lại routine và ghi chú sau mỗi buổi hẹn.</p>
        </article>
      </div>
    </section>
  );
}
