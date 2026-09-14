"use client";

import { BookOpen, Clock } from "lucide-react";
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
          <span className="journal-roman">V · MONOGRAPH & ATELIER ESSAYS</span>
        </div>
        <div className="journal-head-title-row">
          <h2 className="journal-title">Góc nhìn về làn da tự phục hồi.</h2>
          <p className="journal-intro">
            Những ghi chép thực tế từ đội ngũ chuyên viên TĨNH về thói quen dưỡng
            da tối giản và chăm sóc màng ẩm tự nhiên.
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

          <h3 className="lead-title">{leadArticle.title}</h3>

          <p className="lead-excerpt">
            {leadArticle.excerpt} Việc bổ sung hoạt chất nồng độ cao liên tục khi
            màng bảo vệ đang mỏng manh thường gây ra phản ứng kích ứng tiềm ẩn. Chúng
            tôi chia sẻ cách nhận biết ngưỡng chịu đựng của da và thời điểm nên
            quay về routine phục hồi cơ bản.
          </p>

          <div className="lead-footer">
            <span className="lead-author">Ghi chép bởi Chuyên viên tư vấn TĨNH</span>
            <span className="lead-edition-note">Ghi chép chuyên đề</span>
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

                <h4 className="side-title">{article.title}</h4>

                <p className="side-excerpt">{article.excerpt}</p>

                <div className="side-tag-row">
                  <span className="side-category-tag">{article.tag}</span>
                  <span className="side-edition-note">Trích yếu chuyên đề</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
