"use client";

import { Card, PageTitle } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ClosePage() {
  const { state } = useStore();
  const rows = [
    ["مستني مشرف", state.captures.filter((c) => c.status === "with_supervisor").length],
    ["مستني حسابات", state.captures.filter((c) => c.status === "with_finance").length],
    ["مسودة", state.captures.filter((c) => c.status === "draft").length],
    ["مرتجع", state.captures.filter((c) => c.status === "returned").length],
    ["بلا فاتورة مفتوحة", state.captures.filter((c) => c.pettyNoReceipt && c.status !== "approved" && c.status !== "rejected").length],
    ["عهد مفتوحة", state.advances.filter((a) => a.status !== "settled").length],
    ["تقدم غير معتمد", state.progress.filter((p) => p.status === "draft").length],
    ["أمر تغيير معلّق", state.variations.filter((v) => v.status === "pending").length],
  ] as const;
  const blockers = rows.reduce((s, r) => s + r[1], 0);
  const score = Math.max(0, 100 - blockers * 8);

  return (
    <div>
      <PageTitle
        title="إقفال الأسبوع"
        hint="الجاهزية على بيانات موجودة. البنود الفاضية تظهر بعد ما تدخل تقدم."
      />
      <Card className="mb-4">
        <p className="text-sm text-stone-500">درجة الجاهزية</p>
        <p className="text-3xl">{score}٪</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-4">
        {rows.map(([label, n]) => (
          <Card key={label}>
            <p className="text-sm text-stone-500">{label}</p>
            <p className="text-2xl">{n}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
