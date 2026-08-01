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
import { useEffect, useMemo, useRef, useState } from "react";
import { formatMoney, products } from "../data";
import {
  commerceStorageKeys,
  readCommerceAppointments,
  readCommerceOrders,
  writeCommerceAppointments,
  writeCommerceOrders,
  type CommerceAppointment,
  type CommerceOrder,
} from "../commerce-storage";

type AdminTab =
  | "overview"
  | "products"
  | "orders"
  | "appointments"
  | "customers"
  | "reports";

type AdminCustomer = {
  id: string;
  name: string;
  lastVisit: string;
  orders: number;
  note: string;
};

const initialOrders: CommerceOrder[] = [];
const initialAppointments: CommerceAppointment[] = [];
const initialCustomers: AdminCustomer[] = [];

const tabLabels: Record<AdminTab, string> = {
  overview: "Tổng quan",
  products: "Sản phẩm",
  orders: "Đơn hàng",
  appointments: "Lịch hẹn",
  customers: "Khách hàng",
  reports: "Báo cáo",
};

const mergeById = <T extends { id: string | number }>(stored: T[], seeded: T[]) => {
  const seen = new Set<string | number>();
  return [...stored, ...seeded].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const formatAppointmentDate = (value: string) => {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}` : value;
};

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const formatCustomerDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const buildCustomerProfiles = (
  orders: CommerceOrder[],
  appointments: CommerceAppointment[],
  persisted: AdminCustomer[],
) => {
  const names = new Map<string, { latest: string; orders: number }>();
  orders.forEach((order) => {
    const current = names.get(order.customer);
    names.set(order.customer, {
      latest:
        !current || new Date(order.createdAt) > new Date(current.latest)
          ? order.createdAt
          : current.latest,
      orders: (current?.orders ?? 0) + 1,
    });
  });
  appointments.forEach((appointment) => {
    const current = names.get(appointment.customer);
    names.set(appointment.customer, {
      latest:
        !current || new Date(appointment.createdAt) > new Date(current.latest)
          ? appointment.createdAt
          : current.latest,
      orders: current?.orders ?? 0,
    });
  });

  return [...names.entries()]
    .sort(([, a], [, b]) => +new Date(b.latest) - +new Date(a.latest))
    .map(([name, activity], index) => {
      const saved = persisted.find((customer) => customer.name === name);
      return {
        id: saved?.id ?? `KH-${String(index + 1).padStart(3, "0")}`,
        name,
        lastVisit: formatCustomerDate(activity.latest),
        orders: activity.orders,
        note: saved?.note ?? "",
      };
    });
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
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [productAdded, setProductAdded] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const pageTitle = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 59.99rem)");
    const sync = () => {
      setIsMobileLayout(media.matches);
      if (!media.matches) setMobileNav(false);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobileLayout) return;
    document.body.classList.toggle("is-scroll-locked", mobileNav);
    if (mobileNav) {
      window.requestAnimationFrame(() =>
        sidebar.current
          ?.querySelector<HTMLButtonElement>('button[aria-current="page"]')
          ?.focus(),
      );
    }
    return () => document.body.classList.remove("is-scroll-locked");
  }, [isMobileLayout, mobileNav]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileNav) {
        setMobileNav(false);
        menuTrigger.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNav]);

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  useEffect(() => {
    if (!savedNoteId) return;
    const timeout = window.setTimeout(() => setSavedNoteId(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [savedNoteId]);

  useEffect(() => {
    if (!productAdded) return;
    const timeout = window.setTimeout(() => setProductAdded(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [productAdded]);

  useEffect(() => {
    const storedOrders = readCommerceOrders();
    const storedAppointments = readCommerceAppointments();
    let storedInventory: unknown = [];
    let storedCustomers: unknown = [];

    try {
      storedInventory = JSON.parse(
        window.localStorage.getItem(commerceStorageKeys.inventory) ?? "[]",
      );
      storedCustomers = JSON.parse(
        window.localStorage.getItem(commerceStorageKeys.customers) ?? "[]",
      );
    } catch {
      window.localStorage.removeItem(commerceStorageKeys.inventory);
      window.localStorage.removeItem(commerceStorageKeys.customers);
    }

    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    const hydratedOrders = mergeById(storedOrders, initialOrders);
    const hydratedAppointments = mergeById(
      storedAppointments,
      initialAppointments,
    );
    const persistedCustomers = Array.isArray(storedCustomers)
      ? (storedCustomers as AdminCustomer[])
      : [];
    const frame = window.requestAnimationFrame(() => {
      setOrders(hydratedOrders);
      setAppointments(hydratedAppointments);
      if (Array.isArray(storedInventory) && storedInventory.length) {
        setInventory(storedInventory);
      }
      setCustomers(
        buildCustomerProfiles(
          hydratedOrders,
          hydratedAppointments,
          persistedCustomers,
        ),
      );
      if (requestedTab && requestedTab in tabLabels) setTab(requestedTab as AdminTab);
      setStorageHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    writeCommerceOrders(orders);
  }, [orders, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    writeCommerceAppointments(appointments);
  }, [appointments, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    window.localStorage.setItem(commerceStorageKeys.inventory, JSON.stringify(inventory));
  }, [inventory, storageHydrated]);

  useEffect(() => {
    if (!storageHydrated) return;
    window.localStorage.setItem(commerceStorageKeys.customers, JSON.stringify(customers));
  }, [customers, storageHydrated]);

  const filteredInventory = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    return inventory.filter((product) =>
      `${product.name} ${product.category}`
        .toLocaleLowerCase("vi")
        .includes(normalized),
    );
  }, [inventory, query]);

  const lowStock = inventory.filter((product) => product.stock <= 5);
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Chờ xác nhận",
  );
  const activeOrders = orders.filter((order) => order.status !== "Hoàn tất");
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const revenue = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (5 - index));
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      const value = orders
        .filter((order) => {
          const createdAt = new Date(order.createdAt);
          return createdAt >= date && createdAt < next;
        })
        .reduce((sum, order) => sum + order.total, 0);
      return { day: formatter.format(date), value };
    });
  }, [orders]);
  const peakRevenue = Math.max(...revenue.map((item) => item.value), 1);

  const selectTab = (next: AdminTab) => {
    if (isMobileLayout) menuTrigger.current?.focus();
    setTab(next);
    setMobileNav(false);
    if (isMobileLayout) {
      window.requestAnimationFrame(() => pageTitle.current?.focus());
    }
  };

  const closeMobileNavigation = () => {
    setMobileNav(false);
    menuTrigger.current?.focus();
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

  const addProductDraft = () => {
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
    setProductAdded(true);
  };

  const updateOrderStatus = (id: string) => {
    const next: Record<CommerceOrder["status"], CommerceOrder["status"]> = {
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
    setSavedNoteId(id);
  };

  const exportExcel = () => {
    const rows = orders
      .map(
        (order) =>
          `<Row><Cell><Data ss:Type="String">${escapeXml(order.id)}</Data></Cell><Cell><Data ss:Type="String">${escapeXml(order.customer)}</Data></Cell><Cell><Data ss:Type="Number">${order.total}</Data></Cell><Cell><Data ss:Type="String">${escapeXml(order.status)}</Data></Cell></Row>`,
      )
      .join("");
    const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Don hang"><Table><Row><Cell><Data ss:Type="String">Mã đơn</Data></Cell><Cell><Data ss:Type="String">Khách hàng</Data></Cell><Cell><Data ss:Type="String">Doanh thu</Data></Cell><Cell><Data ss:Type="String">Trạng thái</Data></Cell></Row>${rows}</Table></Worksheet></Workbook>`;
    const blob = new Blob([workbook], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tinh-spa-bao-cao-${new Date().toISOString().slice(0, 10)}.xls`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSaved("Đã xuất báo cáo Excel.");
  };

  const trapSidebarFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!mobileNav || event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="admin-shell">
      <aside
        className={`admin-sidebar ${mobileNav ? "is-open" : ""}`}
        id="admin-navigation"
        ref={sidebar}
        role={isMobileLayout ? "dialog" : undefined}
        aria-modal={isMobileLayout && mobileNav ? "true" : undefined}
        aria-label={isMobileLayout ? "Điều hướng quản trị" : undefined}
        aria-hidden={isMobileLayout && !mobileNav}
        inert={isMobileLayout && !mobileNav}
        onKeyDown={trapSidebarFocus}
      >
        <div className="admin-brand">
          <Link className="wordmark" href="/">
            TĨNH
            <span>back office</span>
          </Link>
          <button
            className="icon-button admin-close"
            type="button"
            aria-label="Đóng điều hướng"
            onClick={closeMobileNavigation}
          >
            <X size={21} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Điều hướng quản trị">
          <button
            className={tab === "overview" ? "is-active" : ""}
            type="button"
            aria-current={tab === "overview" ? "page" : undefined}
            onClick={() => selectTab("overview")}
          >
            <LayoutDashboard size={19} aria-hidden="true" />
            Tổng quan
          </button>
          <button
            className={tab === "products" ? "is-active" : ""}
            type="button"
            aria-current={tab === "products" ? "page" : undefined}
            onClick={() => selectTab("products")}
          >
            <Package size={19} aria-hidden="true" />
            Sản phẩm
            {lowStock.length > 0 && <span>{lowStock.length}</span>}
          </button>
          <button
            className={tab === "orders" ? "is-active" : ""}
            type="button"
            aria-current={tab === "orders" ? "page" : undefined}
            onClick={() => selectTab("orders")}
          >
            <ShoppingBag size={19} aria-hidden="true" />
            Đơn hàng
          </button>
          <button
            className={tab === "appointments" ? "is-active" : ""}
            type="button"
            aria-current={tab === "appointments" ? "page" : undefined}
            onClick={() => selectTab("appointments")}
          >
            <CalendarDays size={19} aria-hidden="true" />
            Lịch hẹn
          </button>
          <button
            className={tab === "customers" ? "is-active" : ""}
            type="button"
            aria-current={tab === "customers" ? "page" : undefined}
            onClick={() => selectTab("customers")}
          >
            <UsersRound size={19} aria-hidden="true" />
            Khách hàng
          </button>
          <button
            className={tab === "reports" ? "is-active" : ""}
            type="button"
            aria-current={tab === "reports" ? "page" : undefined}
            onClick={() => selectTab("reports")}
          >
            <FileSpreadsheet size={19} aria-hidden="true" />
            Báo cáo
          </button>
        </nav>
        <div className="admin-sidebar-foot">
          <p>Không gian vận hành</p>
          <span>Đơn hàng và lịch hẹn được đồng bộ từ storefront</span>
          <Link href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Về cửa hàng
          </Link>
        </div>
      </aside>

      <button
        className={`admin-scrim ${mobileNav ? "is-open" : ""}`}
        type="button"
        aria-label="Đóng điều hướng"
        aria-hidden={!mobileNav}
        inert={!mobileNav}
        onClick={closeMobileNavigation}
      />

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <button
              className="icon-button admin-menu"
              type="button"
              ref={menuTrigger}
              aria-label="Mở điều hướng"
              aria-expanded={mobileNav}
              aria-controls="admin-navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} aria-hidden="true" />
            </button>
            <div>
              <span>TĨNH Spa Commerce</span>
              <h1 id="admin-page-title" ref={pageTitle} tabIndex={-1}>
                {tabLabels[tab]}
              </h1>
            </div>
          </div>
          <div className="admin-user">
            <span>DA</span>
            <div>
              <strong>Điều phối TĨNH</strong>
              <small>Quản trị viên</small>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <div
            className="admin-view"
            key={tab}
            role="region"
            aria-labelledby="admin-page-title"
          >
          {tab === "overview" && (
            <>
              <section className="admin-intro">
                <div>
                  <p>Dữ liệu vận hành · cập nhật trên thiết bị này</p>
                  <h2>{pendingAppointments.length} lịch hẹn đang chờ xác nhận.</h2>
                </div>
                <button type="button" onClick={exportExcel}>
                  <ArrowDownToLine size={18} aria-hidden="true" />
                  Xuất Excel
                </button>
              </section>

              <section className="metric-grid" aria-label="Chỉ số tổng quan">
                <article className="metric-featured">
                  <span>Doanh thu ghi nhận</span>
                  <strong>{formatMoney(totalRevenue)}</strong>
                  <p>
                    <TrendingUp size={17} aria-hidden="true" />
                    {orders.length} đơn hàng trong hệ thống
                  </p>
                </article>
                <article>
                  <span>Đơn hàng</span>
                  <strong>{orders.length}</strong>
                  <p>{activeOrders.length} đơn đang xử lý</p>
                </article>
                <article>
                  <span>Lịch hẹn</span>
                  <strong>{appointments.length}</strong>
                  <p>{pendingAppointments.length} lịch chờ xác nhận</p>
                </article>
                <article className="metric-warning">
                  <span>Sắp hết hàng</span>
                  <strong>{lowStock.length}</strong>
                  <button type="button" onClick={() => selectTab("products")}>
                    Xem tồn kho
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </article>
              </section>

              <section className="overview-grid">
                <figure className="revenue-card">
                  <header>
                    <div>
                      <span>Doanh thu theo kỳ</span>
                      <strong>{formatMoney(totalRevenue)}</strong>
                    </div>
                    <p>Đơn vị: triệu ₫</p>
                  </header>
                  <div className="bar-chart" aria-hidden="true">
                    {revenue.map((item) => (
                      <div key={item.day}>
                        <span>
                          {item.value
                            ? (item.value / 1000000).toLocaleString("vi-VN", {
                                maximumFractionDigits: 1,
                              })
                            : "—"}
                        </span>
                        <i
                          style={
                            { "--bar-scale": item.value / peakRevenue } as React.CSSProperties
                          }
                        />
                        <small>{item.day}</small>
                      </div>
                    ))}
                  </div>
                  <figcaption className="sr-only">
                    Doanh thu thực tế từ đơn hàng đã lưu trong sáu ngày gần nhất.
                  </figcaption>
                  <ul className="sr-only">
                    {revenue.map((item) => (
                      <li key={item.day}>
                        Ngày {item.day}: {formatMoney(item.value)}
                      </li>
                    ))}
                  </ul>
                </figure>

                <article className="low-stock-card">
                  <header>
                    <div>
                      <span>Tồn kho cần chú ý</span>
                      <strong>{lowStock.length} sản phẩm</strong>
                    </div>
                    <TriangleAlert size={21} aria-hidden="true" />
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
                        <ChevronRight size={16} aria-hidden="true" />
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
                <button type="button" onClick={addProductDraft}>
                  {productAdded ? (
                    <Check size={17} aria-hidden="true" />
                  ) : (
                    <Plus size={17} aria-hidden="true" />
                  )}
                  {productAdded ? "Đã thêm bản nháp" : "Thêm sản phẩm"}
                </button>
              </header>
              <label className="admin-search">
                <span className="sr-only">Tìm trong danh mục sản phẩm</span>
                <Search size={18} aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm tên hoặc danh mục"
                />
              </label>
              <p className="admin-result-count" aria-live="polite">
                {filteredInventory.length} sản phẩm khớp tìm kiếm
              </p>
              <div className="inventory-list">
                {filteredInventory.map((product) => (
                  <article key={product.id}>
                    <div className="inventory-name">
                      <span>{product.category}</span>
                      <strong>{product.name}</strong>
                      <small>{formatMoney(product.price)}</small>
                    </div>
                    <div
                      className="stock-control"
                      role="group"
                      aria-label={`Tồn kho ${product.name}`}
                    >
                      <button
                        type="button"
                        aria-label={`Giảm tồn kho ${product.name}`}
                        disabled={product.stock === 0}
                        onClick={() => adjustStock(product.id, -1)}
                      >
                        <Minus size={15} aria-hidden="true" />
                      </button>
                      <output
                        className={product.stock <= 5 ? "is-low" : ""}
                        aria-live="polite"
                      >
                        {product.stock} tồn
                      </output>
                      <button
                        type="button"
                        aria-label={`Tăng tồn kho ${product.name}`}
                        onClick={() => adjustStock(product.id, 1)}
                      >
                        <Plus size={15} aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      className="visibility-button"
                      type="button"
                      onClick={() => toggleVisible(product.id)}
                    >
                      {product.visible ? (
                        <Eye size={17} aria-hidden="true" />
                      ) : (
                        <EyeOff size={17} aria-hidden="true" />
                      )}
                      {product.visible ? "Đang bán" : "Bản nháp"}
                    </button>
                  </article>
                ))}
                {!filteredInventory.length && (
                  <div className="admin-empty-state">
                    <Search size={22} aria-hidden="true" />
                    <strong>Không tìm thấy sản phẩm.</strong>
                    <button type="button" onClick={() => setQuery("")}>
                      Xóa nội dung tìm kiếm
                    </button>
                  </div>
                )}
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
                  <ArrowDownToLine size={17} aria-hidden="true" />
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
                  <strong>Yêu cầu mới nhất</strong>
                </div>
              </header>
              <div className="appointment-list">
                {appointments.map((appointment) => (
                  <article key={appointment.id}>
                    <div className="appointment-time">
                      <span>{appointment.id}</span>
                      <strong>
                        {formatAppointmentDate(appointment.date)} · {appointment.time}
                      </strong>
                    </div>
                    <div>
                      <strong>{appointment.customer}</strong>
                      <span>{appointment.service}</span>
                    </div>
                    <span
                      className={`status-badge ${appointment.status === "Đã xác nhận" ? "status-complete" : ""}`}
                      aria-live="polite"
                    >
                      {appointment.status}
                    </span>
                    <button
                      type="button"
                      disabled={appointment.status === "Đã xác nhận"}
                      onClick={() => confirmAppointment(appointment.id)}
                    >
                      <Check size={16} aria-hidden="true" />
                      {appointment.status === "Đã xác nhận" ? "Đã xác nhận" : "Xác nhận"}
                    </button>
                  </article>
                ))}
                {!appointments.length && (
                  <div className="admin-empty-state">
                    <CalendarDays size={22} aria-hidden="true" />
                    <strong>Chưa có yêu cầu lịch hẹn.</strong>
                    <span>Lịch khách gửi từ storefront sẽ xuất hiện tại đây.</span>
                    <Link href="/">Mở cửa hàng</Link>
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === "customers" && (
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
                      <span>
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
                      className={savedNoteId === customer.id ? "is-saved" : ""}
                      type="button"
                      onClick={() => saveCustomerNote(customer.id, customer.note)}
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
          )}

          {tab === "reports" && (
            <section className="report-page">
              <header>
                <div>
                  <span>Báo cáo cơ bản</span>
                  <h2>Doanh thu và vận hành hiện tại</h2>
                  <p>Đơn phát sinh trên storefront được đưa vào bảng đơn hàng và file xuất.</p>
                </div>
                <button type="button" onClick={exportExcel}>
                  <FileSpreadsheet size={18} aria-hidden="true" />
                  Xuất báo cáo Excel
                </button>
              </header>
              <div className="report-summary">
                <article>
                  <span>Doanh thu sản phẩm</span>
                  <strong>{formatMoney(totalRevenue)}</strong>
                  <p>{orders.length} đơn hàng đã ghi nhận</p>
                </article>
                <article>
                  <span>Yêu cầu dịch vụ</span>
                  <strong>{appointments.length}</strong>
                  <p>{pendingAppointments.length} lịch đang chờ xác nhận</p>
                </article>
              </div>
              <div
                className="report-table-region"
                role="region"
                aria-label="Bảng doanh thu theo kỳ, có thể cuộn ngang"
                tabIndex={0}
              >
              <table className="report-breakdown">
                <caption className="sr-only">
                  Doanh thu và tỷ trọng theo sáu ngày gần nhất
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Kỳ</th>
                    <th scope="col">Doanh thu</th>
                    <th scope="col">Tỷ trọng</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.map((item) => (
                    <tr key={item.day}>
                      <th scope="row">{item.day}</th>
                      <td>
                        <strong>{formatMoney(item.value)}</strong>
                      </td>
                      <td>
                        <span className="report-share">
                          <i
                            aria-hidden="true"
                            style={
                              {
                                "--share-scale": item.value / peakRevenue,
                              } as React.CSSProperties
                            }
                          />
                          <small>
                            {totalRevenue
                              ? Math.round((item.value / totalRevenue) * 100)
                              : 0}
                            %
                          </small>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </section>
          )}
          </div>
        </div>

        {saved && (
          <div className="admin-toast" role="status">
            <Check size={17} aria-hidden="true" />
            {saved}
            <button type="button" aria-label="Đóng thông báo" onClick={() => setSaved("")}>
              <X size={15} aria-hidden="true" />
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
  if (!orders.length) {
    return (
      <div className="admin-empty-state">
        <ShoppingBag size={22} aria-hidden="true" />
        <strong>Chưa có đơn hàng.</strong>
        <span>Đơn được tạo từ giỏ hàng sẽ xuất hiện tại đây.</span>
        <Link href="/">Mở cửa hàng</Link>
      </div>
    );
  }

  return (
    <div
      className="order-table"
      role="region"
      aria-label="Bảng đơn hàng, có thể cuộn ngang"
      tabIndex={0}
    >
      <table>
        <caption className="sr-only">
          Danh sách đơn hàng, khách hàng, tổng tiền, trạng thái và thao tác
        </caption>
        <thead>
          <tr>
            <th scope="col">Mã đơn</th>
            <th scope="col">Khách hàng</th>
            <th scope="col">Tổng</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <th scope="row" data-label="Mã đơn">{order.id}</th>
              <td data-label="Khách hàng">{order.customer}</td>
              <td data-label="Tổng">{formatMoney(order.total)}</td>
              <td data-label="Trạng thái">
                <span
                  className={`status-badge status-${order.status.toLocaleLowerCase("vi").replaceAll(" ", "-")}`}
                  aria-live="polite"
                >
                  {order.status}
                </span>
              </td>
              <td data-label="Thao tác">
                <button
                  type="button"
                  disabled={order.status === "Hoàn tất"}
                  aria-label={
                    order.status === "Hoàn tất"
                      ? `${order.id} đã hoàn tất`
                      : `Chuyển ${order.id} sang bước tiếp theo`
                  }
                  onClick={() => onAdvance(order.id)}
                >
                  {order.status === "Hoàn tất" ? "Đã xong" : "Chuyển bước"}
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
