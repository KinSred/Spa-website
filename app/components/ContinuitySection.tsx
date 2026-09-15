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

      <div className="continuity-timeline" aria-label="Ba giai đoạn chăm sóc tiếp nối">
        <article className="timeline-stage">
          <div className="stage-top">
            <span className="stage-index">01</span>
            <div className="stage-icon-wrap" aria-hidden="true">
              <Compass size={20} />
            </div>
          </div>
          <span className="stage-kicker">GIAI ĐOẠN I · LỌC ROUTINE</span>
          <h3 className="stage-heading">Quan sát tình trạng da &amp; routine hiện tại</h3>
          <p className="stage-body">
            Xem xét tình trạng hàng rào bảo vệ da và các sản phẩm đang dùng. Chỉ
            giữ lại những bước thực sự mang lại giá trị phục hồi, loại bỏ thói
            quen chạy theo hoạt chất mạnh.
          </p>
          <span className="stage-badge">Tại nhà hoặc atelier</span>
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
          <h3 className="stage-heading">Chăm sóc phòng cabine</h3>
          <p className="stage-body">
            Khi da cần giải tỏa bít tắc hoặc hạ nhiệt sau đợt kích ứng, các
            nghi thức làm mát, mặt nạ lipid làm dịu và thao tác chăm sóc nhẹ nhàng
            tại atelier hỗ trợ củng cố màng ẩm tự nhiên.
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
          <span className="stage-kicker">GIAI ĐOẠN III · TIẾP NỐI</span>
          <h3 className="stage-heading">Hướng dẫn chăm sóc tiếp nối</h3>
          <p className="stage-body">
            Chuyên viên ghi nhận cảm nhận của bạn sau buổi trị liệu để định hướng
            chu trình dưỡng tại nhà phù hợp, hỗ trợ làn da duy trì sự ổn định lâu dài.
          </p>
          <span className="stage-badge">Chăm sóc tiếp nối</span>
        </article>
      </div>
    </section>
  );
}
