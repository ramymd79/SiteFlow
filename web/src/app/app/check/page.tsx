"use client";

import { useMemo } from "react";
import { Card, PageTitle } from "@/components/ui";
import { runAdvanceScenarios } from "@/lib/self-test";
import { useStore } from "@/lib/store";

export default function CheckPage() {
  const { currentUser } = useStore();
  const results = useMemo(() => runAdvanceScenarios(), []);
  const passed = results.filter((r) => r.ok).length;

  if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "finance")) {
    return (
      <Card>
        <p className="text-sm text-stone-600">فحص السيناريوهات للمالك والحسابات.</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageTitle
        title="فحص سيناريوهات العهد"
        hint={`${passed} من ${results.length} نجحت.`}
      />
      <Card>
        <ul className="space-y-3">
          {results.map((r) => (
            <li
              key={r.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                r.ok ? "bg-emerald-50 text-emerald-950" : "bg-red-50 text-red-900"
              }`}
            >
              <p className="font-medium">
                {r.ok ? "تمام" : "فشل"} — {r.id}) {r.name}
              </p>
              <p className="mt-1 opacity-80">{r.detail}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
