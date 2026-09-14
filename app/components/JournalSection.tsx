"use client";

import { ArrowRight } from "lucide-react";
import { articles } from "../data";

export function JournalSection() {
  return (
    <section className="journal-section" id="journal" aria-label="Kiến thức chăm sóc da">
      <header className="section-heading">
        <div>
          <h2>Đọc trước khi thêm một bước.</h2>
          <p>Kiến thức ngắn, đủ để ra quyết định chăm da bình tĩnh hơn.</p>
        </div>
        <a href="#journal-list" className="journal-all-link">
          Xem thư viện
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </header>
      <div className="article-list" id="journal-list">
        {articles.map((article) => (
          <article key={article.title}>
            <span className="article-tag">{article.tag}</span>
            <h3 className="article-title">{article.title}</h3>
            <p className="article-excerpt">{article.excerpt}</p>
            <a
              href="#journal-list"
              className="article-read-link"
              aria-label={`Đọc ${article.title}`}
            >
              {article.time}
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
