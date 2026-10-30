import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  const classes = inputs.filter(Boolean).join(" ");
  return classes;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function timeUntil(date: Date | string): string {
  const ms = new Date(date).getTime() - new Date().getTime();
  if (ms <= 0) return "Expired";
  const minutes = Math.floor(ms / (1000 * 60));
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m left`;
  return `${Math.floor(hours / 24)}d left`;
}

export function urgencyColor(urgency: string): string {
  switch (urgency) {
    case "CRITICAL":
      return "text-red-600 bg-red-50 border-red-200";
    case "HIGH":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "MEDIUM":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    default:
      return "text-green-600 bg-green-50 border-green-200";
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "text-green-700 bg-green-50";
    case "MATCHING":
    case "MATCHED":
      return "text-blue-700 bg-blue-50";
    case "PICKUP_ASSIGNED":
    case "PICKED_UP":
    case "IN_TRANSIT":
      return "text-orange-700 bg-orange-50";
    case "DELIVERED":
    case "DISTRIBUTED":
    case "COMPLETED":
      return "text-emerald-700 bg-emerald-50";
    case "CANCELLED":
    case "EXPIRED":
      return "text-red-700 bg-red-50";
    default:
      return "text-gray-700 bg-gray-50";
  }
}

export function safetyColor(status: string): string {
  switch (status) {
    case "LOW_RISK":
      return "text-green-700 bg-green-50 border-green-200";
    case "REVIEW_REQUIRED":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "HIGH_RISK":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "DO_NOT_REDISTRIBUTE":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-gray-700 bg-gray-50";
  }
}
