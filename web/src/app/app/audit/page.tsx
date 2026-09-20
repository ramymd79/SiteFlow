"use client";

import { Card, PageTitle, auditValueLabel } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function AuditPage() {
  const { state } = useStore();
  return (
    <div>
      <PageTitle
        title="سجل التدقيق"
        hint="إضافة فقط. الأصل لا يُحذف حتى لو اتعدّل التفسير."
      />
      <Card>
        <ul className="space-y-2 text-sm">
          {state.audit.map((a) => {
            const actor = state.users.find((u) => u.id === a.actorId)?.name ?? a.actorId;
            return (
              <li key={a.id} className="border-b border-stone-100 py-2">
                <span className="text-stone-500">
                  {new Date(a.at).toLocaleString("ar-EG")}
                </span>
                {" — "}
                {actor}: {a.action} ({a.entity}) {auditValueLabel(a.before)} ←{" "}
                {auditValueLabel(a.after)}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
