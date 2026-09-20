"use client";

import type { CaptureStatus, Role } from "@/lib/types";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-stone-200 bg-white p-4 ${className}`}
    >
      {children}
    </section>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: "bg-emerald-900 text-white hover:bg-emerald-800",
    ghost: "bg-stone-100 text-stone-900 hover:bg-stone-200",
    danger: "bg-red-800 text-white hover:bg-red-700",
  }[variant];
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-11 rounded-lg px-4 py-2 text-sm disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-stone-600">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900";

export const captureStatusLabel: Record<CaptureStatus, string> = {
  draft: "مسودة",
  with_supervisor: "عند المشرف",
  with_finance: "عند الحسابات",
  approved: "معتمد",
  rejected: "مرفوض",
  returned: "مرتجع",
};

export const advanceStatusLabel: Record<string, string> = {
  active: "مفتوحة",
  settling: "تحت التسوية",
  settled: "مسوّاة",
};

export const progressStatusLabel: Record<string, string> = {
  draft: "مسودة",
  approved: "معتمد",
};

export const variationStatusLabel: Record<string, string> = {
  pending: "معلّق",
  approved: "معتمد",
  rejected: "مرفوض",
};

export function StatusPill({ status }: { status: CaptureStatus }) {
  return (
    <span className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-700">
      {captureStatusLabel[status]}
    </span>
  );
}

export function auditValueLabel(value: string): string {
  return (
    captureStatusLabel[value as CaptureStatus] ??
    advanceStatusLabel[value] ??
    progressStatusLabel[value] ??
    variationStatusLabel[value] ??
    value
  );
}

export function roleLabel(role: Role): string {
  return {
    owner: "مالك",
    finance: "حسابات",
    supervisor: "مشرف",
    engineer: "مهندس",
    client: "عميل",
  }[role];
}

export function PageTitle({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <header className="mb-4 space-y-1">
      <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
      {hint ? <p className="text-sm text-stone-600">{hint}</p> : null}
    </header>
  );
}
