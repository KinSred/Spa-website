"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { products } from "../data";
import {
  commerceStorageKeys,
  readCommerceAppointments,
  readCommerceOrders,
  writeCommerceAppointments,
  writeCommerceOrders,
  type CommerceAppointment,
  type CommerceOrder,
} from "../commerce-storage";
import { AdminSidebar, type AdminTab } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { OverviewTab } from "./components/OverviewTab";
import { ProductsTab } from "./components/ProductsTab";
import { OrdersTab } from "./components/OrdersTab";
import { AppointmentsTab } from "./components/AppointmentsTab";
import { CustomersTab, type AdminCustomer } from "./components/CustomersTab";
import { ReportsTab } from "./components/ReportsTab";

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

  const updateCustomerNoteLocal = (id: string, note: string) => {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === id ? { ...customer, note } : customer,
      ),
    );
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

  return (
    <div className="admin-shell">
      <AdminSidebar
        tab={tab}
        onSelectTab={selectTab}
        mobileNav={mobileNav}
        onCloseMobileNav={closeMobileNavigation}
        sidebarRef={sidebar}
        isMobileLayout={isMobileLayout}
        lowStockCount={lowStock.length}
        inert={isMobileLayout && !mobileNav}
      />

      <main className="admin-main">
        <AdminHeader
          tabTitle={tabLabels[tab]}
          onOpenMobileNav={() => setMobileNav(true)}
          mobileNav={mobileNav}
          menuTriggerRef={menuTrigger}
          pageTitleRef={pageTitle}
        />

        <div className="admin-content">
          <div
            className="admin-view"
            key={tab}
            role="region"
            aria-labelledby="admin-page-title"
          >
            {tab === "overview" && (
              <OverviewTab
                orders={orders}
                appointments={appointments}
                inventory={inventory}
                totalRevenue={totalRevenue}
                revenue={revenue}
                peakRevenue={peakRevenue}
                onAdvanceOrder={updateOrderStatus}
                onSelectTab={selectTab}
                onExportExcel={exportExcel}
              />
            )}

            {tab === "products" && (
              <ProductsTab
                inventory={inventory}
                query={query}
                onQueryChange={setQuery}
                filteredInventory={filteredInventory}
                productAdded={productAdded}
                onAddProductDraft={addProductDraft}
                onAdjustStock={adjustStock}
                onToggleVisible={toggleVisible}
              />
            )}

            {tab === "orders" && (
              <OrdersTab
                orders={orders}
                onAdvanceOrder={updateOrderStatus}
                onExportExcel={exportExcel}
              />
            )}

            {tab === "appointments" && (
              <AppointmentsTab
                appointments={appointments}
                onConfirmAppointment={confirmAppointment}
              />
            )}

            {tab === "customers" && (
              <CustomersTab
                customers={customers}
                onUpdateCustomerNote={updateCustomerNoteLocal}
                onSaveCustomerNote={saveCustomerNote}
                savedNoteId={savedNoteId}
              />
            )}

            {tab === "reports" && (
              <ReportsTab
                orders={orders}
                appointments={appointments}
                totalRevenue={totalRevenue}
                revenue={revenue}
                peakRevenue={peakRevenue}
                onExportExcel={exportExcel}
              />
            )}
          </div>
        </div>

        {saved && (
          <div className="admin-toast" role="status">
            <Check size={17} aria-hidden="true" />
            <span>{saved}</span>
            <button
              type="button"
              aria-label="Đóng thông báo"
              onClick={() => setSaved("")}
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
