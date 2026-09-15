# TĨNH Skin Atelier — Spa Commerce

![TĨNH Spa Commerce](public/og.png)

Website thương mại dành cho spa, kết hợp hai hành trình trong cùng một trải
nghiệm: mua sản phẩm chăm sóc da và đặt lịch tư vấn/liệu trình. Dự án được xây
dựng như một sản phẩm portfolio hoàn chỉnh, gồm storefront, trang sản phẩm và
khu quản trị vận hành.

## Điểm nổi bật

### Khách hàng

- Trang chủ thương hiệu theo phong cách luxury editorial và liquid glass.
- Danh mục sản phẩm với tìm kiếm, lọc theo loại da, nhu cầu và mức giá.
- Trang chi tiết sản phẩm, giỏ hàng, điều chỉnh số lượng và mã giảm giá
  `TINH10`.
- Checkout nhiều bước, hỗ trợ COD hoặc chuyển khoản và tạo mã đơn hàng.
- Chọn liệu trình, đặt lịch tư vấn và nhận mã lịch hẹn.
- Thư viện kiến thức chăm da và khung chat tư vấn nhanh.
- Responsive cho mobile, tablet và desktop; hỗ trợ reduced motion và điều
  hướng bàn phím.

### Quản trị

- Theo dõi đơn hàng và thay đổi trạng thái xử lý.
- Quản lý lịch hẹn, trạng thái xác nhận và hoàn tất liệu trình.
- Quản lý tồn kho, trạng thái hiển thị sản phẩm và cảnh báo sắp hết hàng.
- Tổng hợp hồ sơ khách hàng từ hoạt động mua hàng/đặt lịch và lưu ghi chú.
- Báo cáo doanh thu cơ bản theo dữ liệu hiện có.
- Xuất danh sách đơn hàng sang tệp `.xls` mở được bằng Excel.

## Luồng dữ liệu hiện tại

Storefront và trang quản trị được kết nối trong cùng trình duyệt. Đơn hàng,
lịch hẹn, tồn kho và ghi chú khách hàng được lưu bằng `localStorage`, vì vậy dữ
liệu vẫn còn sau khi tải lại trang trên cùng thiết bị.

Đây là bản front-end bàn giao có thể chạy và trình diễn đầy đủ các luồng. Để
vận hành thương mại trên nhiều thiết bị/người dùng, cần kết nối thêm database,
xác thực quản trị, cổng thanh toán và nhà cung cấp chat/SMS thực tế.

## Công nghệ

- Next.js App Router trên Vinext/Vite.
- React 19 và TypeScript strict mode.
- Cloudflare Worker-compatible build.
- CSS token system riêng, không phụ thuộc UI framework.
- Lucide React cho icon giao diện.
- Node.js `>= 22.13.0`.

## Chạy tại máy

```bash
npm install
npm run dev
```

Mở địa chỉ được in trong terminal. Các route chính:

- `/` — storefront.
- `/san-pham/serum-phuc-hoi-soie-01` — ví dụ trang chi tiết sản phẩm.
- `/admin` — khu quản trị.
- `/admin?tab=orders` — đơn hàng.
- `/admin?tab=appointments` — lịch hẹn.

## Kiểm tra chất lượng

```bash
npm run typecheck
npm run lint
npm test
```

`npm test` tạo production build và kiểm tra HTML render của storefront, trang
sản phẩm, trang quản trị, stylesheet, persistence và reduced-motion rules.

## Production build

```bash
npm run build
npm start
```

Build được xuất theo cấu trúc tương thích Cloudflare Worker. Cấu hình Sites nằm
trong `.openai/hosting.json`; không commit secret hoặc tệp `.env` vào repository.

## Cấu trúc chính

```text
app/
├── SpaCommerce.tsx              Storefront và các luồng mua/đặt lịch
├── commerce-storage.ts          Lớp lưu dữ liệu dùng chung
├── liquid.css                   Lớp giao diện và responsive
├── admin/AdminDashboard.tsx     Khu quản trị
└── san-pham/[slug]/              Trang chi tiết sản phẩm
public/                          Hình ảnh thương hiệu và sản phẩm
tests/                           Kiểm tra production render
worker/                          Cloudflare Worker entry
tokens.css                       Design tokens dùng chung
design.md                        Quy chuẩn thiết kế của dự án
```

## Ghi chú bàn giao

- Khu quản trị `/admin` hiện hoạt động như một demo / local operations console (`DEMO · LOCAL DATA`).
- Cơ chế xác thực (Authentication), phiên đăng nhập (Session) và phân quyền vai trò (RBAC) **cố ý chưa triển khai** trong bản frontend này và thuộc phạm vi công việc backend/security tiếp theo.
- Dữ liệu mặc định của quản trị là trạng thái rỗng; các bản ghi xuất hiện sau khi người dùng tạo đơn hoặc đặt lịch trên thiết bị này.
- Danh mục sản phẩm hiện được định nghĩa chuẩn xác trong `app/data.ts`.
- Mã giảm giá mẫu `TINH10` giảm 10% trong luồng checkout.
- Ảnh, tên thương hiệu và nội dung sản phẩm trong repository được tạo cho dự án portfolio này.
