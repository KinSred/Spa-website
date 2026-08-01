export type CommerceOrder = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  payment: "cod" | "bank";
  total: number;
  status: "Mới" | "Đang gói" | "Đã gửi" | "Hoàn tất";
  createdAt: string;
  items: Array<{
    productId: number;
    name: string;
    quantity: number;
    price: number;
  }>;
};

export type CommerceAppointment = {
  id: string;
  customer: string;
  phone: string;
  serviceId: string;
  service: string;
  date: string;
  time: string;
  note: string;
  status: "Chờ xác nhận" | "Đã xác nhận";
  createdAt: string;
};

export const commerceStorageKeys = {
  orders: "tinh-orders",
  appointments: "tinh-appointments",
  inventory: "tinh-inventory",
  customers: "tinh-customers",
} as const;

const readList = <T,>(key: string): T[] => {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
};

const writeList = <T,>(key: string, value: T[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("tinh-commerce-update", { detail: { key } }));
};

export const readCommerceOrders = () =>
  readList<CommerceOrder>(commerceStorageKeys.orders);

export const writeCommerceOrders = (orders: CommerceOrder[]) =>
  writeList(commerceStorageKeys.orders, orders);

export const prependCommerceOrder = (order: CommerceOrder) =>
  writeCommerceOrders([order, ...readCommerceOrders()]);

export const readCommerceAppointments = () =>
  readList<CommerceAppointment>(commerceStorageKeys.appointments);

export const writeCommerceAppointments = (appointments: CommerceAppointment[]) =>
  writeList(commerceStorageKeys.appointments, appointments);

export const prependCommerceAppointment = (appointment: CommerceAppointment) =>
  writeCommerceAppointments([appointment, ...readCommerceAppointments()]);

export const createCommerceId = (prefix: "DH" | "LH") => {
  const now = new Date();
  const date = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  return `${prefix}-${date}-${time}`;
};
