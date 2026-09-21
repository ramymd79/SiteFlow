"use client";

import { Button, Card, PageTitle, advanceStatusLabel, captureStatusLabel } from "@/components/ui";
import { approvedOnAdvance, remainingOnAdvance, underReviewOnAdvance } from "@/lib/logic";
import { useStore } from "@/lib/store";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = "\uFEFF" + rows.map((r) => r.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCell(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function ExportPage() {
  const { state, currentUser } = useStore();

  if (
    !currentUser ||
    (currentUser.role !== "owner" && currentUser.role !== "finance")
  ) {
    return (
      <Card>
        <p className="text-sm text-stone-600">التصدير للمالك والحسابات بس.</p>
      </Card>
    );
  }

  const approved = state.captures.filter((c) => c.status === "approved");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageTitle
        title="تصدير إكسل"
        hint="ملفات CSV تفتح في إكسل. التصدير للمعتمد والعهد بس."
      />
      <Card className="space-y-3">
        <p className="text-sm text-stone-600">
          حركات معتمدة: {approved.length} — عهد: {state.advances.length}
        </p>
        {approved.length === 0 ? (
          <p className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600">
            لسه مفيش حركات معتمدة. كمّل مسار العهد (تسجيل → مشرف → حسابات) وبعدين
            صدّر.
          </p>
        ) : null}
        <Button
          className="w-full"
          onClick={() => {
            downloadCsv("siteflow-approved-expenses.csv", [
              [
                "التاريخ",
                "الوصف",
                "المورد",
                "المبلغ",
                "المشروع",
                "العهدة",
                "نثريات",
                "الحالة",
              ],
              ...approved.map((c) => {
                const project =
                  state.projects.find((p) => p.id === c.projectId)?.name ?? "";
                const advance =
                  state.advances.find((a) => a.id === c.advanceId)?.title ?? "";
                return [
                  new Date(c.createdAt).toLocaleString("ar-EG"),
                  c.description,
                  c.vendorName,
                  String(c.amountPiasters / 100),
                  project,
                  advance,
                  c.pettyNoReceipt ? "نعم" : "لا",
                  captureStatusLabel[c.status],
                ];
              }),
            ]);
          }}
        >
          تصدير المصروفات المعتمدة
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            downloadCsv("siteflow-advances.csv", [
              [
                "العهدة",
                "الشخص",
                "المشروع",
                "المستلم",
                "المعتمد",
                "تحت المراجعة",
                "المتبقي",
                "الحالة",
              ],
              ...state.advances.map((a) => {
                const person =
                  state.users.find((u) => u.id === a.personUserId)?.name ?? "";
                const project =
                  state.projects.find((p) => p.id === a.projectId)?.name ?? "";
                return [
                  a.title,
                  person,
                  project,
                  String(a.disbursedPiasters / 100),
                  String(approvedOnAdvance(state.expenses, a.id) / 100),
                  String(underReviewOnAdvance(state.captures, a.id) / 100),
                  String(remainingOnAdvance(a, state.expenses) / 100),
                  advanceStatusLabel[a.status] ?? a.status,
                ];
              }),
            ]);
          }}
        >
          تصدير العهد
        </Button>
      </Card>
    </div>
  );
}
