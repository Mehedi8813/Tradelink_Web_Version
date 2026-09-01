/**
 * Application-wide constants for TradeLink.
 * Centralizes configuration values, status codes, and theme colors.
 */

/**
 * User roles in the TradeLink system.
 */
export const USER_ROLES = {
  ADMIN: "admin",
  SHOP_OWNER: "shop_owner",
  SUPPLIER: "supplier",
  DELIVERY_MAN: "delivery_man",
};

/**
 * Order status values and their display configurations.
 */
export const ORDER_STATUS = {
  PENDING: { value: "pending", label: "Pending", color: "#d97706", bgColor: "bg-[#fff7ed]", textColor: "text-[#ea580c]" },
  MATCHING: { value: "matching", label: "Matching", color: "#8b5cf6", bgColor: "bg-purple-50", textColor: "text-purple-600" },
  PROCESSING: { value: "processing", label: "Processing", color: "#3b82f6", bgColor: "bg-blue-50", textColor: "text-blue-600" },
  OUT_FOR_DELIVERY: { value: "out for delivery", label: "Out for Delivery", color: "#0ea5e9", bgColor: "bg-sky-50", textColor: "text-sky-600" },
  DELIVERED: { value: "delivered", label: "Delivered", color: "#059669", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
  COMPLETED: { value: "completed", label: "Completed", color: "#059669", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
  CANCELLED: { value: "cancelled", label: "Cancelled", color: "#ef4444", bgColor: "bg-red-50", textColor: "text-red-600" },
};

/**
 * Payment status values.
 */
export const PAYMENT_STATUS = {
  UNPAID: { value: "unpaid", label: "Unpaid", color: "#ef4444" },
  PAID: { value: "paid", label: "Paid", color: "#059669" },
  PARTIAL: { value: "partial", label: "Partial", color: "#d97706" },
};

/**
 * Chart color palette for consistent data visualization.
 */
export const CHART_COLORS = {
  primary: ["#1f7564", "#d97706", "#66b2a3", "#cbd5e1", "#8b5cf6", "#f43f5e"],
  status: {
    pending: "#d97706",
    processing: "#3b82f6",
    matching: "#8b5cf6",
    delivered: "#059669",
    completed: "#059669",
    cancelled: "#ef4444",
    "out for delivery": "#0ea5e9",
  },
  gradients: {
    emerald: "from-[#136353] to-[#1a7d6a]",
    orange: "from-orange-500 to-orange-400",
  },
};

/**
 * Product categories available in the system.
 */
export const PRODUCT_CATEGORIES = [
  "Grocery",
  "Pharmacy",
  "Stationery",
  "Hardware",
];

/**
 * Measurement units for inventory items.
 */
export const UNITS = [
  { value: "kg", label: "Kilogram" },
  { value: "litre", label: "Litre" },
  { value: "pcs", label: "Pieces" },
];

/**
 * Application configuration constants.
 */
export const APP_CONFIG = {
  name: "TradeLink",
  tagline: "Retail Network Platform",
  currency: "৳",
  currencyCode: "BDT",
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  defaultDeliveryRadius: 10, // km
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};

/**
 * API response status codes.
 */
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

/**
 * Local storage keys used throughout the application.
 */
export const STORAGE_KEYS = {
  USER: "tradelink_web_user",
  THEME: "tradelink_theme",
  LANGUAGE: "tradelink_language",
};
