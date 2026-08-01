import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

async function htmlFor(pathname) {
  const response = await render(pathname);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

test("renders the luxury storefront with its stylesheet and two care paths", async () => {
  const html = await htmlFor("/");

  assert.match(html, /<html[^>]*lang="vi"/i);
  assert.match(html, /TĨNH/);
  assert.match(html, /Một nghi thức, hai cách chăm da\./);
  assert.match(html, /id="catalogue"/);
  assert.match(html, /id="treatments"/);
  assert.match(html, /href="[^"]+\.css[^"]*"/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("renders the operational admin workbench", async () => {
  const html = await htmlFor("/admin");

  assert.match(html, /TĨNH Spa Commerce/);
  assert.match(html, /Tổng quan/);
  assert.match(html, /Doanh thu tháng/);
  assert.match(html, /Xuất Excel/);
  assert.match(html, /Dữ liệu mẫu/);
});

test("renders a product detail route with purchase and consultation paths", async () => {
  const html = await htmlFor("/san-pham/serum-phuc-hoi-soie-01");

  assert.match(html, /Soie 01/);
  assert.match(html, /Thêm ·/);
  assert.match(html, /Xem lịch tư vấn/);
  assert.match(html, /Trở lại cửa hàng/);
});

test("keeps design tokens, overlay safety and reduced motion in source", async () => {
  const [css, tokens, storefront, admin] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../tokens.css", import.meta.url), "utf8"),
    readFile(new URL("../app/SpaCommerce.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminDashboard.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(css, /@import "\.\.\/tokens\.css"/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /transition-all/);
  assert.match(tokens, /--color-accent:/);
  assert.match(tokens, /--dur-long:\s*460ms/);
  assert.match(storefront, /inert=\{!cartOpen\}/);
  assert.match(storefront, /aria-modal="true"/);
  assert.match(admin, /inert=\{isMobileLayout && !mobileNav\}/);
});
