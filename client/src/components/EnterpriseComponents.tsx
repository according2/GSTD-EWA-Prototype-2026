import { cn } from "@/lib/utils";
import React from "react";

// =============================================================================
// Enterprise Card
// =============================================================================
export interface EnterpriseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function EnterpriseCard({ className, children, ...props }: EnterpriseCardProps) {
  return (
    <div className={cn("card-enterprise", className)} {...props}>
      {children}
    </div>
  );
}

// =============================================================================
// Enterprise KPI Card
// =============================================================================
export interface EnterpriseKpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subValue?: string;
  accentColor?: string;
  icon?: React.ReactNode;
  change?: string;
  changeDir?: "up" | "down";
}

export function EnterpriseKpiCard({
  label,
  value,
  subValue,
  accentColor,
  icon,
  change,
  changeDir,
  className,
  ...props
}: EnterpriseKpiCardProps) {
  return (
    <div className={cn("kpi-card bg-white border border-[#dfdfdf] rounded-[3px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]", className)} {...props}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[8px] text-[#4f525d] uppercase tracking-widest font-semibold">{label}</p>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
      <p className="text-xl font-bold text-[#100841] font-mono tracking-tight leading-none mb-1">{value}</p>
      
      {(subValue || change) && (
        <div className="flex items-center gap-1.5 mt-1">
          {change && (
            <span className={cn(
              "text-[9px] font-bold font-mono",
              changeDir === "up" ? "text-[#2e7d32]" : "text-[#c62828]"
            )}>
              {changeDir === "up" ? "↑" : "↓"} {change}
            </span>
          )}
          {subValue && (
            <p className="text-[9px] text-[#4f525d] font-medium font-mono">{subValue}</p>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Enterprise Badge
// =============================================================================
export type EnterpriseBadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

export interface EnterpriseBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: EnterpriseBadgeVariant;
  children: React.ReactNode;
}

export function EnterpriseBadge({ variant, children, className, ...props }: EnterpriseBadgeProps) {
  const classes = {
    success: "status-badge-success",
    warning: "status-badge-warning",
    error: "status-badge-error",
    info: "status-badge-info",
    neutral: "status-badge-neutral",
  };
  return (
    <span className={cn(classes[variant], "inline-flex items-center gap-1", className)} {...props}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {children}
    </span>
  );
}

// =============================================================================
// Enterprise Button
// =============================================================================
export interface EnterpriseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
}

export function EnterpriseButton({
  variant = "primary",
  icon,
  children,
  className,
  ...props
}: EnterpriseButtonProps) {
  const classes = {
    primary: "btn-enterprise-primary",
    secondary: "btn-enterprise-secondary",
    danger: "btn-enterprise-danger",
  };
  return (
    <button className={cn(classes[variant], "cursor-pointer", className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// =============================================================================
// Enterprise Message Strip
// =============================================================================
export interface EnterpriseMessageStripProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: "info" | "warning" | "error" | "success";
  message: string;
}

export function EnterpriseMessageStrip({ variant, message, className, ...props }: EnterpriseMessageStripProps) {
  const classes = {
    info: "message-strip-info",
    warning: "message-strip-warning",
    error: "message-strip-error",
    success: "message-strip-success",
  };
  return (
    <div className={cn(classes[variant], className)} {...props}>
      {message}
    </div>
  );
}

// =============================================================================
// Enterprise Form Controls
// =============================================================================
export interface EnterpriseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function EnterpriseInput({ className, ...props }: EnterpriseInputProps) {
  return <input className={cn("input-enterprise", className)} {...props} />;
}

export interface EnterpriseSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function EnterpriseSelect({ className, children, ...props }: EnterpriseSelectProps) {
  return (
    <select className={cn("select-enterprise", className)} {...props}>
      {children}
    </select>
  );
}

// =============================================================================
// Ledger Divider (Signature Motif)
// =============================================================================
export function LedgerDivider({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative h-px bg-[#dfdfdf] my-4 flex items-center justify-end", className)} {...props}>
      <span className="absolute right-0 w-2.5 h-1 bg-[#31d891]" />
    </div>
  );
}

// =============================================================================
// Re-export EnterpriseTable
// =============================================================================
export { EnterpriseTable } from "./EnterpriseTable";
export type { ColumnDef, FilterDef, TableAction, EnterpriseTableProps } from "./EnterpriseTable";

