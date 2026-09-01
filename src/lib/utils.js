/**
 * Formatting utility functions for the TradeLink application.
 * Provides consistent number, currency, date, and string formatting.
 */

/**
 * Format a number as Bangladeshi Taka currency.
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: false)
 * @returns {string} Formatted currency string (e.g., "৳1,234")
 * 
 * @example
 * formatCurrency(1234) // "৳1,234"
 * formatCurrency(1234.56, true) // "৳1,234.56"
 */
export function formatCurrency(amount, showDecimals = false) {
  const num = Number(amount) || 0;
  if (showDecimals) {
    return `৳${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `৳${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/**
 * Format a large number with abbreviations (k, M, B).
 * @param {number} num - The number to format
 * @returns {string} Abbreviated string (e.g., "1.2k", "3.5M")
 * 
 * @example
 * formatCompactNumber(1234) // "1.2k"
 * formatCompactNumber(1234567) // "1.2M"
 */
export function formatCompactNumber(num) {
  const n = Number(num) || 0;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

/**
 * Format a date string to a readable format.
 * @param {string|Date} date - The date to format
 * @param {string} format - Output format: "short", "medium", "long", "time"
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate("2026-08-31", "short") // "Aug 31"
 * formatDate("2026-08-31", "long") // "August 31, 2026"
 * formatDate("2026-08-31T14:30:00", "time") // "2:30 PM"
 */
export function formatDate(date, format = "medium") {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";

  const options = {
    short: { month: "short", day: "numeric" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
    time: { hour: "numeric", minute: "2-digit", hour12: true },
    datetime: { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" },
  };

  return d.toLocaleDateString("en-US", options[format] || options.medium);
}

/**
 * Get relative time string (e.g., "2 hours ago", "Yesterday").
 * @param {string|Date} date - The date to compare
 * @returns {string} Relative time string
 * 
 * @example
 * getRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
 */
export function getRelativeTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(d, "short");
}

/**
 * Truncate a string to a maximum length with ellipsis.
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated string
 * 
 * @example
 * truncate("Hello World", 5) // "Hello..."
 */
export function truncate(str, maxLength = 50) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}

/**
 * Capitalize the first letter of a string.
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 * 
 * @example
 * capitalize("pending") // "Pending"
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate a consistent color from a string (for avatars, tags, etc.).
 * @param {string} str - Input string to generate color from
 * @returns {string} Hex color code
 * 
 * @example
 * stringToColor("Grocery") // "#1f7564"
 */
export function stringToColor(str) {
  const colors = [
    "#1f7564", "#d97706", "#66b2a3", "#8b5cf6", "#f43f5e",
    "#3b82f6", "#059669", "#ea580c", "#6366f1", "#ec4899",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Calculate percentage change between two values.
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {string} Formatted percentage string with +/- prefix
 * 
 * @example
 * getPercentageChange(150, 100) // "+50%"
 * getPercentageChange(75, 100) // "-25%"
 */
export function getPercentageChange(current, previous) {
  if (!previous) return current > 0 ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change.toFixed(1)}%`;
}
