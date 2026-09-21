"use client";

import Link from "next/link";
import { Card, PageTitle } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ClosePage() {
  const { state, currentUser } = useStore();
  if (!currentUser || currentUser.role === "engineer") {
    return (
      <Card>
        <p className="text-sm text-stone-600">
          شاشة النواقص للمشرف والحسابات والمالك.
        </p>
      </Card>
    );
  }

  const rows = [
    {
      label: "مستني مشرف",
      n: state.captures.filter((c) => c.status === "with_supervisor").length,
      href: "/app/review",
    },
    {
      label: "مستني حسابات",
      n: state.captures.filter((c) => c.status === "with_finance").length,
      href: "/app/review",
    },
    {
      label: "مسودة",
      n: state.captures.filter((c) => c.status === "draft").length,
      href: "/app/capture",
    },
    {
      label: "مرتجع",
      n: state.captures.filter((c) => c.status === "returned").length,
      href: "/app/review",
    },
    {
      label: "بلا فاتورة مفتوحة",
      n: state.captures.filter(
        (c) =>
          c.pettyNoReceipt &&
          c.status !== "approved" &&
          c.status !== "rejected",
      ).length,
      href: "/app/review",
    },
    {
      label: "بلا عهدة مربوطة",
      n: state.captures.filter(
        (c) =>
          !c.advanceId &&
          (c.status === "with_supervisor" || c.status === "with_finance"),
      ).length,
      href: "/app/review",
    },
    {
      label: "عهد مفتوحة",
      n: state.advances.filter((a) => a.status !== "settled").length,
      href: "/app/advances",
    },
    {
      label: "تقدم غير معتمد",
      n: state.progress.filter((p) => p.status === "draft").length,
      href: "/app/progress",
    },
    {
      label: "تغييرات معلّقة",
      n: state.variations.filter((v) => v.status === "pending").length,
      href: "/app/variations",
    },
  ] as const;

  const blockers = rows.reduce((s, r) => s + r.n, 0);
  const score = Math.max(0, 100 - blockers * 8);

  return (
    <div>
      <PageTitle
        title="النواقص قبل الإقفال"
        hint="كل عدّاد لازم يبقى صفر قبل ما تقول الأسبوع اتقفل نظيف."
      />
      <Card className="mb-4">
        <p className="text-sm text-stone-500">درجة الجاهزية</p>
        <p className="text-3xl">{score}٪</p>
        <p className="mt-1 text-sm text-stone-600">
          {blockers === 0
            ? "مفيش نواقص معلّقة على دورة العهد."
            : `${blockers} بند لسه مفتوح.`}
        </p>
      </Card>
      <div className="grid gap-3 md:grid-cols-4">
        {rows.map((row) => (
          <Link key={row.label} href={row.href}>
            <Card className="h-full transition hover:border-emerald-800">
              <p className="text-sm text-stone-500">{row.label}</p>
              <p className="text-2xl">{row.n}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
