"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Eye,
  EyeOff,
  FileSpreadsheet,
  LayoutDashboard,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  TrendingUp,
  TriangleAlert,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatMoney, products } from "../data";

type AdminTab =
  | "overview"
  | "products"
  | "orders"
  | "appointments"
  | "customers"
  | "reports";

const revenue = [
  { day: "01–05", value: 14.2 },
  { day: "06–10", value: 18.6 },
  { day: "11–15", value: 16.8 },
  { day: "16–20", value: 24.5 },
  { day: "21–25", value: 22.1 },
  { day: "26–31", value: 28.6 },
];

const initialOrders = [
  { id: "DH-240731", customer: "Trần Minh Anh", total: 1650000, status: "Mới" },
  { id: "DH-240730", customer: "Nguyễn Thảo Vy", total: 2480000, status: "Đang gói" },
  { id: "DH-240729", customer: "Lê Khánh Linh", total: 940000, status: "Đã gửi" },
  { id: "DH-240728", customer: "Phạm Ngọc Hà", total: 1440000, status: "Hoàn tất" },
];

const initialAppointments = [
  {
    id: "LH-084",
    customer: "Đỗ Gia Hân",
    service: "Calme — phục hồi",
    time: "01/08 · 10:30",
    status: "Chờ xác nhận",
  },
  {
    id: "LH-083",
    customer: "Vũ Hoài An",
    service: "Soi da & routine",
    time: "01/08 · 14:00",
    status: "Đã xác nhận",
  },
  {
    id: "LH-082",
    customer: "Bùi Thanh Mai",
    service: "Clarté — làm sạch",
    time: "01/08 · 17:30",
    status: "Đã xác nhận",
  },
];

const initialCustomers = [
  {
    id: "KH-201",
    name: "Trần Minh Anh",
    lastVisit: "24/07/2026",
    orders: 4,
    note: "Da dễ đỏ khi đổi thời tiết. Ưu tiên routine tối giản.",
  },
  {
    id: "KH-196",
    name: "Nguyễn Thảo Vy",
    lastVisit: "19/07/2026",
    orders: 2,
    note: "Đang dùng retinoid theo hướng dẫn bác sĩ; không gợi ý peel.",
  },
  {
    id: "KH-183",
    name: "Lê Khánh Linh",
    lastVisit: "02/07/2026",
    orders: 6,
    note: "Ưa kết cấu ráo. Nhắc thoa lại chống nắng khi đi công tác.",
  },
];

const tabLabels: Record<AdminTab, string> = {
  overview: "Tổng quan",
  products: "Sản phẩm",
  orders: "Đơn hàng",
  appointments: "Lịch hẹn",
  customers: "Khách hàng",
  reports: "Báo cáo",
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState(initialOrders);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [customers, setCustomers] = useState(initialCustomers);
  const [inventory, setInventory] = useState(
    products.map((product) => ({ ...product, visible: true })),
  );
  const [saved, setSaved] = useState("");

  const filteredInventory = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    return inventory.filter((product) =>
      `${product.name} ${product.category}`
        .toLocaleLowerCase("vi")
        .includes(normalized),
    );
  }, [inventory, query]);

  const lowStock = inventory.filter((product) => product.stock <= 5);

  const selectTab = (next: AdminTab) => {
    setTab(next);
    setMobileNav(false);
  };

  const adjustStock = (id: number, delta: number) => {
    setInventory((current) =>
      current.map((product) =>
        product.id === id
          ? { ...product, stock: Math.max(0, product.stock + delta) }
          : product,
      ),
    );
  };

  const toggleVisible = (id: number) => {
    setInventory((current) =>
      current.map((product) =>
        product.id === id ? { ...product, visible: !product.visible } : product,
      ),
    );
  };

  const addDemoProduct = () => {
    setInventory((current) => [
      ...current,
      {
        ...products[0],
        id: Math.max(...current.map((product) => product.id)) + 1,
        slug: `san-pham-moi-${current.length + 1}`,
        name: `Sản phẩm nháp ${current.length + 1}`,
        stock: 0,
        visible: false,
      },
    ]);
    setSaved("Đã thêm một sản phẩm nháp.");
  };

  const updateOrderStatus = (id: string) => {
    const next: Record<string, string> = {
      Mới: "Đang gói",
      "Đang gói": "Đã gửi",
      "Đã gửi": "Hoàn tất",
      "Hoàn tất": "Hoàn tất",
    };
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: next[order.status] } : order,
      ),
    );
  };

  const confirmAppointment = (id: string) => {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: "Đã xác nhận" }
          : appointment,
      ),
    );
  };

  const saveCustomerNote = (id: string, note: string) => {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === id ? { ...customer, note } : customer,
      ),
    );
    setSaved(`Đã lưu ghi chú cho ${id}.`);
  };

  const exportExcel = () => {
    const rows = orders
      .map(
        (order) =>
          `<Row><Cell><Data ss:Type="String">${order.id}</Data></Cell><Cell><Data ss:Type="String">${order.customer}</Data></Cell><Cell><Data ss:Type="Number">${order.total}</Data></Cell><Cell><Data ss:Type="String">${order.status}</Data></Cell></Row>`,
      )
      .join("");
    const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Don hang"><Table><Row><Cell><Data ss:Type="String">Mã đơn</Data></Cell><Cell><Data ss:Type="String">Khách hàng</Data></Cell><Cell><Data ss:Type="String">Doanh thu</Data></Cell><Cell><Data ss:Type="String">Trạng thái</Data></Cell></Row>${rows}</Table></Worksheet></Workbook>`;
    const blob = new Blob([workbook], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tinh-spa-bao-cao-07-2026.xls";
    anchor.click();
    URL.revokeObjectURL(url);
    setSaved("Đã xuất báo cáo Excel.");
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="admin-brand">
          <Link className="wordmark" href="/">
            TĨNH
            <span>back office</span>
          </Link>
          <button
            className="icon-button admin-close"
            type="button"
            aria-label="Đóng điều hướng"
            onClick={() => setMobileNav(false)}
          >
            <X size={21} />
          </button>
        </div>
        <nav aria-label="Điều hướng quản trị">
          <button
            className={tab === "overview" ? "is-active" : ""}
            type="button"
            onClick={() => selectTab("overview")}
          >
            <LayoutDashboard size={19} />
            Tổng quan
          </button>
          <button
            className={tab === "products" ? "is-active" : ""}
            type="button"
            onClick={() => selectTab("products")}
          >
            <Package size={19} />
            Sản phẩm
            {lowStock.length > 0 && <span>{lowStock.length}</span>}
          </button>
          <button
            className={tab === "orders" ? "is-active" : ""}
            type="button"
            onClick={() => selectTab("orders")}
          >
            <ShoppingBag size={19} />
            Đơn hàng
          </button>
          <button
            className={tab === "appointments" ? "is-active" : ""}
            type="button"
            onClick={() => selectTab("appointments")}
          >
            <CalendarDays size={19} />
            Lịch hẹn
          </button>
          <button
            className={tab === "customers" ? "is-active" : ""}
            type="button"
            onClick={() => selectTab("customers")}
          >
            <UsersRound size={19} />
            Khách hàng
          </button>
          <button
            className={tab === "reports" ? "is-active" : ""}
            type="button"
            onClick={() => selectTab("reports")}
          >
            <FileSpreadsheet size={19} />
            Báo cáo
          </button>
        </nav>
        <div className="admin-sidebar-foot">
          <p>Không gian demo</p>
          <span>Dữ liệu mẫu · không phải dữ liệu khách thật</span>
          <Link href="/">
            <ArrowLeft size={16} />
            Về cửa hàng
          </Link>
        </div>
      </aside>

      {mobileNav && (
        <button
          className="admin-scrim"
          type="button"
          aria-label="Đóng điều hướng"
          onClick={() => setMobileNav(false)}
        />
      )}

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <button
              className="icon-button admin-menu"
              type="button"
              aria-label="Mở điều hướng"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <div>
              <span>TĨNH Spa Commerce</span>
              <h1>{tabLabels[tab]}</h1>
            </div>
          </div>
          <div className="admin-user">
            <span>DA</span>
            <div>
              <strong>Demo Admin</strong>
              <small>Quản trị viên</small>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {tab === "overview" && (
            <>
              <section className="admin-intro">
                <div>
                  <p>Dữ liệu mẫu · 01–31/07/2026</p>
                  <h2>Hôm nay có 3 lịch hẹn cần theo dõi.</h2>
                </div>
                <button type="button" onClick={exportExcel}>
                  <ArrowDownToLine size={18} />
                  Xuất Excel
                </button>
              </section>

              <section className="metric-grid" aria-label="Chỉ số tổng quan">
                <article className="metric-featured">
                  <span>Doanh thu tháng</span>
                  <strong>{formatMoney(124800000)}</strong>
                  <p>
                    <TrendingUp size={17} />
                    +8,4% so với dữ liệu mẫu tháng trước
                  </p>
                </article>
                <article>
                  <span>Đơn hàng</span>
                  <strong>46</strong>
                  <p>6 đơn đang xử lý</p>
                </article>
                <article>
                  <span>Lịch hẹn</span>
                  <strong>18</strong>
                  <p>3 lịch trong hôm nay</p>
                </article>
                <article className="metric-warning">
                  <span>Sắp hết hàng</span>
                  <strong>{lowStock.length}</strong>
                  <button type="button" onClick={() => selectTab("products")}>
                    Xem tồn kho
                    <ChevronRight size={16} />
                  </button>
                </article>
              </section>

              <section className="overview-grid">
                <article className="revenue-card">
                  <header>
                    <div>
                      <span>Doanh thu theo kỳ</span>
                      <strong>124,8 triệu ₫</strong>
                    </div>
                    <p>Đơn vị: triệu ₫</p>
                  </header>
                  <div className="bar-chart" aria-label="Biểu đồ doanh thu tháng 7">
                    {revenue.map((item) => (
                      <div key={item.day}>
                        <span>{item.value}</span>
                        <i style={{ "--bar-size": `${(item.value / 30) * 100}%` } as React.CSSProperties} />
                        <small>{item.day}</small>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="low-stock-card">
                  <header>
                    <div>
                      <span>Tồn kho cần chú ý</span>
                      <strong>{lowStock.length} sản phẩm</strong>
                    </div>
                    <TriangleAlert size={21} />
                  </header>
                  <div>
                    {lowStock.map((product) => (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => selectTab("products")}
                      >
                        <span>{product.name}</span>
                        <strong>{product.stock} còn lại</strong>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                </article>
              </section>

              <section className="admin-list-section">
                <header>
                  <div>
                    <span>Đơn hàng gần đây</span>
                    <strong>4 đơn mới nhất</strong>
                  </div>
                  <button type="button" onClick={() => selectTab("orders")}>
                    Xem tất cả
                  </button>
                </header>
                <OrderTable orders={orders} onAdvance={updateOrderStatus} />
              </section>
            </>
          )}

          {tab === "products" && (
            <section className="admin-list-section product-management">
              <header>
                <div>
                  <span>Danh mục & tồn kho</span>
                  <strong>{inventory.length} sản phẩm</strong>
                </div>
                <button type="button" onClick={addDemoProduct}>
                  <Plus size={17} />
                  Thêm sản phẩm
                </button>
              </header>
              <label className="admin-search">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm tên hoặc danh mục"
                />
              </label>
              <div className="inventory-list">
                {filteredInventory.map((product) => (
                  <article key={product.id}>
                    <div className="inventory-name">
                      <span>{product.category}</span>
                      <strong>{product.name}</strong>
                      <small>{formatMoney(product.price)}</small>
                    </div>
                    <div className="stock-control">
                      <button
                        type="button"
                        aria-label={`Giảm tồn kho ${product.name}`}
                        disabled={product.stock === 0}
                        onClick={() => adjustStock(product.id, -1)}
                      >
                        <Minus size={15} />
                      </button>
                      <span className={product.stock <= 5 ? "is-low" : ""}>
                        {product.stock} tồn
                      </span>
                      <button
                        type="button"
                        aria-label={`Tăng tồn kho ${product.name}`}
                        onClick={() => adjustStock(product.id, 1)}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <button
                      className="visibility-button"
                      type="button"
                      onClick={() => toggleVisible(product.id)}
                    >
                      {product.visible ? <Eye size={17} /> : <EyeOff size={17} />}
                      {product.visible ? "Đang bán" : "Bản nháp"}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "orders" && (
            <section className="admin-list-section">
              <header>
                <div>
                  <span>Đơn hàng</span>
                  <strong>Theo dõi trạng thái xử lý</strong>
                </div>
                <button type="button" onClick={exportExcel}>
                  <ArrowDownToLine size={17} />
                  Xuất Excel
                </button>
              </header>
              <OrderTable orders={orders} onAdvance={updateOrderStatus} />
            </section>
          )}

          {tab === "appointments" && (
            <section className="admin-list-section">
              <header>
                <div>
                  <span>Lịch hẹn</span>
                  <strong>Ngày 01/08/2026</strong>
                </div>
              </header>
              <div className="appointment-list">
                {appointments.map((appointment) => (
                  <article key={appointment.id}>
                    <div className="appointment-time">
                      <span>{appointment.id}</span>
                      <strong>{appointment.time}</strong>
                    </div>
                    <div>
                      <strong>{appointment.customer}</strong>
                      <span>{appointment.service}</span>
                    </div>
                    <span
                      className={`status-badge ${appointment.status === "Đã xác nhận" ? "status-complete" : ""}`}
                    >
                      {appointment.status}
                    </span>
                    <button
                      type="button"
                      disabled={appointment.status === "Đã xác nhận"}
                      onClick={() => confirmAppointment(appointment.id)}
                    >
                      <Check size={16} />
                      {appointment.status === "Đã xác nhận" ? "Đã xác nhận" : "Xác nhận"}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "customers" && (
            <section className="admin-list-section">
              <header>
                <div>
                  <span>Khách hàng & ghi chú</span>
                  <strong>Hồ sơ chăm sóc mẫu</strong>
                </div>
              </header>
              <div className="customer-list">
                {customers.map((customer) => (
                  <article key={customer.id}>
                    <header>
                      <span>
                        <CircleUserRound size={21} />
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
                          setCustomers((current) =>
                            current.map((item) =>
                              item.id === customer.id
                                ? { ...item, note: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => saveCustomerNote(customer.id, customer.note)}
                    >
                      Lưu ghi chú
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "reports" && (
            <section className="report-page">
              <header>
                <div>
                  <span>Báo cáo cơ bản</span>
                  <h2>Doanh thu và vận hành · Tháng 07/2026</h2>
                  <p>Dữ liệu mẫu được tạo cho mục đích trình diễn portfolio.</p>
                </div>
                <button type="button" onClick={exportExcel}>
                  <FileSpreadsheet size={18} />
                  Xuất báo cáo Excel
                </button>
              </header>
              <div className="report-summary">
                <article>
                  <span>Doanh thu sản phẩm</span>
                  <strong>{formatMoney(81200000)}</strong>
                  <p>65,1% tổng doanh thu mẫu</p>
                </article>
                <article>
                  <span>Doanh thu dịch vụ</span>
                  <strong>{formatMoney(43600000)}</strong>
                  <p>34,9% tổng doanh thu mẫu</p>
                </article>
              </div>
              <div className="report-breakdown">
                <header>
                  <span>Kỳ</span>
                  <span>Doanh thu</span>
                  <span>Tỷ trọng</span>
                </header>
                {revenue.map((item) => (
                  <div key={item.day}>
                    <span>{item.day}/07</span>
                    <strong>{item.value.toLocaleString("vi-VN")} triệu ₫</strong>
                    <i>
                      <b style={{ "--share": `${(item.value / 30) * 100}%` } as React.CSSProperties} />
                    </i>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {saved && (
          <div className="admin-toast" role="status">
            <Check size={17} />
            {saved}
            <button type="button" aria-label="Đóng thông báo" onClick={() => setSaved("")}>
              <X size={15} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function OrderTable({
  orders,
  onAdvance,
}: {
  orders: typeof initialOrders;
  onAdvance: (id: string) => void;
}) {
  return (
    <div className="order-table">
      <div className="order-head" aria-hidden="true">
        <span>Mã đơn</span>
        <span>Khách hàng</span>
        <span>Tổng</span>
        <span>Trạng thái</span>
        <span>Thao tác</span>
      </div>
      {orders.map((order) => (
        <article key={order.id}>
          <strong data-label="Mã đơn">{order.id}</strong>
          <span data-label="Khách hàng">{order.customer}</span>
          <span data-label="Tổng">{formatMoney(order.total)}</span>
          <span data-label="Trạng thái" className={`status-badge status-${order.status.toLocaleLowerCase("vi").replaceAll(" ", "-")}`}>
            {order.status}
          </span>
          <button
            type="button"
            disabled={order.status === "Hoàn tất"}
            onClick={() => onAdvance(order.id)}
          >
            {order.status === "Hoàn tất" ? "Đã xong" : "Chuyển bước"}
            <ChevronRight size={15} />
          </button>
        </article>
      ))}
    </div>
  );
}
