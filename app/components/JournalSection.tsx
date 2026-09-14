"use client";

import { ArrowUpRight, BookOpen, Clock } from "lucide-react";
import { articles } from "../data";

export function JournalSection() {
  const leadArticle = articles[0];
  const sideArticles = articles.slice(1);

  return (
    <section className="journal-editorial" id="journal" aria-label="Tạp chí & Kiến thức">
      {/* Editorial Monograph Header */}
      <header className="journal-head">
        <div className="journal-head-meta">
          <span className="journal-badge">TẠP CHÍ ATELIER</span>
          <span className="journal-roman">V · MONOGRAPH & CLINICAL ESSAYS</span>
        </div>
        <div className="journal-head-title-row">
          <h2 className="journal-title">Góc nhìn về làn da tự phục hồi.</h2>
          <p className="journal-intro">
            Những bài viết ngắn từ đội ngũ chuyên viên TĨNH, ghi chép từ hàng nghìn
            buổi soi da thực tế và các ca phục hồi màng lipid.
          </p>
        </div>
      </header>

      {/* Asymmetric Publication Spread */}
      <div className="journal-spread-grid">
        {/* Dominant Feature Story */}
        <article className="journal-lead-feature">
          <div className="lead-meta-top">
            <span className="lead-tag">
              <BookOpen size={14} aria-hidden="true" />
              {leadArticle.tag} · BÀI ĐỌC CHÍNH
            </span>
            <span className="lead-read-time">
              <Clock size={13} aria-hidden="true" />
              {leadArticle.time}
            </span>
          </div>

          <h3 className="lead-title">
            <a href="#journal">{leadArticle.title}</a>
          </h3>

          <p className="lead-excerpt">
            {leadArticle.excerpt} Việc bổ sung hoạt chất nồng độ cao liên tục khi
            màng bảo vệ đang mỏng manh thường gây ra phản ứng viêm tiềm ẩn. Chúng
            tôi chia sẻ cách nhận biết ngưỡng chịu đựng của da và thời điểm nên
            quay về routine phục hồi 3 bước cơ bản.
          </p>

          <div className="lead-footer">
            <span className="lead-author">Biên soạn bởi Chuyên viên Da liễu TĨNH</span>
            <span className="lead-link-action" aria-hidden="true">
              Đọc toàn văn
              <ArrowUpRight size={16} />
            </span>
          </div>
        </article>

        {/* Secondary Editorial Rail */}
        <div className="journal-side-rail" aria-label="Bài viết tiếp theo">
          <span className="side-rail-label">CÁC CHUYÊN ĐỀ KHÁC</span>

          <div className="side-articles-stack">
            {sideArticles.map((article, idx) => (
              <article key={article.title} className="side-article-item">
                <div className="side-meta">
                  <span className="side-index">CHUYÊN ĐỀ 0{idx + 2}</span>
                  <span className="side-time">{article.time}</span>
                </div>

                <h4 className="side-title">
                  <a href="#journal">{article.title}</a>
                </h4>

                <p className="side-excerpt">{article.excerpt}</p>

                <div className="side-tag-row">
                  <span className="side-category-tag">{article.tag}</span>
                  <span className="side-arrow-link" aria-hidden="true">
                    Đọc tiếp <ArrowUpRight size={14} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
