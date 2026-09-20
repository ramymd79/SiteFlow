"use client";

import { useState } from "react";
import { Button, Card, Field, PageTitle, inputClass } from "@/components/ui";
import { formatMoney, parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function SubIpcPage() {
  const { state, issueSubIpc } = useStore();
  const [subcontractId, setSubcontractId] = useState(state.subcontracts[0]?.id ?? "");
  const [current, setCurrent] = useState("5000");

  return (
    <div className="space-y-4">
      <PageTitle
        title="مستخلص مقاول الباطن"
        hint="عقد بأسعار مختلفة. لا يغيّر مستخلص العميل ولا عهد الموقع."
      />
      <Card>
        <form
          className="grid gap-3 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            issueSubIpc(subcontractId, parseEgp(current));
          }}
        >
          <Field label="عقد الباطن">
            <select className={inputClass} value={subcontractId} onChange={(e) => setSubcontractId(e.target.value)}>
              {state.subcontracts.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="عمل الفترة">
            <input className={inputClass} value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Button type="submit">إصدار مستخلص باطن</Button>
        </form>
      </Card>
      <Card>
        <ul className="space-y-2 text-sm">
          {state.subIpcs.map((i) => (
            <li key={i.id}>
              رقم {i.number} — صافي {formatMoney(i.netPiasters)} — احتجاز{" "}
              {formatMoney(i.retentionPiasters)}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
