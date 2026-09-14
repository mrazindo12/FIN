import React from "react";
import {
  Clock,
  CheckCircle,
  FileSearch,
  CalendarCheck2,
  Trophy,
  XCircle,
} from "lucide-react";

export type ApplicationStatusType =
  | "PENDING_PAYMENT"
  | "APPLIED"
  | "REVIEW"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED";

interface StatusBadgeProps {
  status: ApplicationStatusType | string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  className = "",
  size = "md",
}: StatusBadgeProps) {
  const normalizedStatus = (status || "").toUpperCase();

  const config: Record<
    string,
    { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    APPLIED: {
      label: "Applied",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: CheckCircle,
    },
    REVIEW: {
      label: "Under Review",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: FileSearch,
    },
    INTERVIEW: {
      // Distinct Purple / Indigo styling for easy visual scanning
      label: "Interview Scheduled",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      icon: CalendarCheck2,
    },
    OFFER: {
      label: "Offer Extended",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: Trophy,
    },
    REJECTED: {
      label: "Not Selected",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: XCircle,
    },
    PENDING_PAYMENT: {
      label: "Payment Pending",
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-300",
      icon: Clock,
    },
  };

  const current = config[normalizedStatus] || config.PENDING_PAYMENT;
  const Icon = current.icon;

  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 gap-1"
      : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-heading font-semibold rounded-full border shadow-2xs select-none ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
      <span>{current.label}</span>
    </span>
  );
}
