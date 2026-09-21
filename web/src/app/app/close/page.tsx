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

  const advanceRows = [
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
      href: "/app/capture",
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
  ] as const;

  const tourRows = [
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

  const openAdvances = state.advances.filter((a) => a.status !== "settled")
    .length;
  const advanceBlockers = advanceRows.reduce((s, r) => s + r.n, 0);
  const score = Math.max(0, 100 - advanceBlockers * 12);

  return (
    <div className="space-y-8">
      <div>
        <PageTitle
          title="النواقص قبل الإقفال"
          hint="درجة الجاهزية على دورة العهد بس. العهد المفتوحة طبيعية ومش بتخصم من الدرجة."
        />
        <Card className="mb-4">
          <p className="text-sm text-stone-500">درجة جاهزية العهد</p>
          <p className="text-3xl">{score}٪</p>
          <p className="mt-1 text-sm text-stone-600">
            {advanceBlockers === 0
              ? "مفيش نواقص معلّقة على دورة العهد."
              : `${advanceBlockers} بند لسه مفتوح في العهد.`}
          </p>
          <p className="mt-2 text-xs text-stone-500">
            عهد مفتوحة حاليًا: {openAdvances} —{" "}
            <Link href="/app/advances" className="underline">
              شوف العهد
            </Link>
          </p>
        </Card>
        <h2 className="mb-3 font-medium">نواقص العهد</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {advanceRows.map((row) => (
            <Link key={row.label} href={row.href}>
              <Card className="h-full transition hover:border-emerald-800">
                <p className="text-sm text-stone-500">{row.label}</p>
                <p className="text-2xl">{row.n}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-1 font-medium text-amber-900">
          نواقص جولة الصورة الكبيرة
        </h2>
        <p className="mb-3 text-sm text-stone-600">
          دي مش جزء من درجة إقفال العهد. للمتابعة في البنود والمستخلص.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {tourRows.map((row) => (
            <Link key={row.label} href={row.href}>
              <Card className="h-full transition hover:border-amber-700">
                <p className="text-sm text-stone-500">{row.label}</p>
                <p className="text-2xl">{row.n}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
