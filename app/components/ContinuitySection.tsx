"use client";

import { ArrowRight, Compass, ShieldCheck, Waves } from "lucide-react";

export function ContinuitySection() {
  return (
    <section className="continuity-editorial" aria-label="Hành trình da liền mạch">
      <div className="continuity-header">
        <div className="continuity-tag-group">
          <span className="continuity-badge">TRIẾT LÝ NỐI TIẾP</span>
          <span className="continuity-roman">II · CONTINUITY</span>
        </div>
        <h2 className="continuity-title">
          Từ chai serum trên bàn trang điểm đến phòng trị liệu tại atelier.
        </h2>
        <p className="continuity-sub">
          Chúng tôi không tách rời mỹ phẩm mua về nhà và các buổi hẹn tại phòng
          cabine. Mọi bước chăm sóc đều là các mắt xích thuộc một hành trình duy
          nhất của làn da bạn.
        </p>
      </div>

      <div className="continuity-timeline" aria-label="Ba giai đoạn đồng hành">
        <article className="timeline-stage">
          <div className="stage-top">
            <span className="stage-index">01</span>
            <div className="stage-icon-wrap" aria-hidden="true">
              <Compass size={20} />
            </div>
          </div>
          <span className="stage-kicker">GIAI ĐOẠN I · LỌC ROUTINE</span>
          <h3 className="stage-heading">Chẩn đoán thực tế</h3>
          <p className="stage-body">
            Xem xét tình trạng hàng rào bảo vệ da và các sản phẩm đang dùng. Chỉ
            giữ lại những bước thực sự mang lại giá trị phục hồi, loại bỏ thói
            quen chạy theo hoạt chất mạnh.
          </p>
          <span className="stage-badge">Tại nhà hoặc soi da</span>
        </article>

        <div className="timeline-connector" aria-hidden="true">
          <span className="connector-line" />
          <ArrowRight size={16} />
        </div>

        <article className="timeline-stage is-featured">
          <div className="stage-top">
            <span className="stage-index">02</span>
            <div className="stage-icon-wrap" aria-hidden="true">
              <Waves size={20} />
            </div>
          </div>
          <span className="stage-kicker">GIAI ĐOẠN II · PHÒNG CABINE</span>
          <h3 className="stage-heading">Can thiệp chuyên sâu</h3>
          <p className="stage-body">
            Khi da cần giải tỏa bít tắc sâu hoặc hạ nhiệt sau đợt kích ứng, các
            nghi thức làm mát, mặt nạ lipid và sóng ấm tại atelier đưa dưỡng chất
            vào sâu mà không gây tổn thương mô.
          </p>
          <span className="stage-badge">Tại atelier cabine</span>
        </article>

        <div className="timeline-connector" aria-hidden="true">
          <span className="connector-line" />
          <ArrowRight size={16} />
        </div>

        <article className="timeline-stage">
          <div className="stage-top">
            <span className="stage-index">03</span>
            <div className="stage-icon-wrap" aria-hidden="true">
              <ShieldCheck size={20} />
            </div>
          </div>
          <span className="stage-kicker">GIAI ĐOẠN III · THEO DÕI</span>
          <h3 className="stage-heading">Lưu giữ hồ sơ 1:1</h3>
          <p className="stage-body">
            Ghi chú về phản ứng da sau buổi hẹn được đồng bộ trực tiếp với danh
            sách sản phẩm bạn đang dùng. Lần mua sắm tiếp theo luôn có sự hướng
            dẫn dựa trên tiến triển thực tế.
          </p>
          <span className="stage-badge">Đồng bộ liên tục</span>
        </article>
      </div>
    </section>
  );
}
