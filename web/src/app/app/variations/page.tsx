"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Field,
  PageTitle,
  variationStatusLabel,
  inputClass,
} from "@/components/ui";
import { useStore } from "@/lib/store";

export default function VariationsPage() {
  const { state, addVariation, approveVariation } = useStore();
  const [projectId, setProjectId] = useState("p-zayed");
  const items = state.boq.filter((b) => b.projectId === projectId);
  const [boqItemId, setBoqItemId] = useState(items[0]?.id ?? "");
  const [name, setName] = useState("");
  const [qtyDelta, setQtyDelta] = useState("5");

  return (
    <div className="space-y-4">
      <PageTitle
        title="أوامر التغيير"
        hint="غير المعتمد لا يغيّر قيمة العقد ولا يدخل المستخلص."
      />
      <Card>
        <form
          className="grid gap-3 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!boqItemId || !name.trim()) return;
            addVariation(projectId, boqItemId, name, Number(qtyDelta));
            setName("");
          }}
        >
          <Field label="المشروع">
            <select
              className={inputClass}
              value={projectId}
              onChange={(e) => {
                const id = e.target.value;
                setProjectId(id);
                setBoqItemId(
                  state.boq.find((b) => b.projectId === id)?.id ?? "",
                );
              }}
            >
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="البند">
            <select className={inputClass} value={boqItemId} onChange={(e) => setBoqItemId(e.target.value)}>
              {items.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </Field>
          <Field label="الاسم">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="فرق الكمية">
            <input className={inputClass} value={qtyDelta} onChange={(e) => setQtyDelta(e.target.value)} />
          </Field>
          <Button type="submit" disabled={!boqItemId}>طلب أمر تغيير</Button>
        </form>
      </Card>
      <Card>
        <ul className="space-y-2 text-sm">
          {state.variations
            .filter((v) => v.projectId === projectId)
            .map((v) => (
            <li key={v.id} className="flex items-center justify-between border-b border-stone-100 py-2">
              <span>
                {v.name} — {v.qtyDelta} — {variationStatusLabel[v.status] ?? v.status}
              </span>
              {v.status === "pending" ? (
                <Button onClick={() => approveVariation(v.id)}>اعتماد</Button>
              ) : null}
            </li>
          ))}
          {state.variations.filter((v) => v.projectId === projectId).length ===
          0 ? (
            <li className="text-stone-500">مفيش أوامر تغيير على المشروع ده.</li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
