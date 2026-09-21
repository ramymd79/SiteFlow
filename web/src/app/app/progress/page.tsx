"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Field,
  PageTitle,
  progressStatusLabel,
  inputClass,
} from "@/components/ui";
import { approvedQty } from "@/lib/logic";
import { useStore } from "@/lib/store";

export default function ProgressPage() {
  const { state, addProgress, approveProgress } = useStore();
  const [projectId, setProjectId] = useState("p-zayed");
  const items = state.boq.filter((b) => b.projectId === projectId);
  const [boqItemId, setBoqItemId] = useState(items[0]?.id ?? "");
  const [qty, setQty] = useState("10");
  const [note, setNote] = useState("");

  return (
    <div className="space-y-4">
      <PageTitle
        title="تقدم التنفيذ"
        hint="حصر كميات معتمد. الصور اختيارية لاحقًا — الرقم هو الأساس."
      />
      <Card>
        <form
          className="grid gap-3 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!boqItemId || Number(qty) <= 0) return;
            addProgress(projectId, boqItemId, Number(qty), note);
            setNote("");
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
          <Field label="كمية هذا الحصر">
            <input className={inputClass} value={qty} onChange={(e) => setQty(e.target.value)} />
          </Field>
          <Field label="ملاحظة">
            <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <Button type="submit" disabled={!boqItemId}>حفظ كمسودة حصر</Button>
        </form>
      </Card>
      <Card>
        <ul className="space-y-2 text-sm">
          {state.progress
            .filter((p) => p.projectId === projectId)
            .map((p) => {
            const item = state.boq.find((b) => b.id === p.boqItemId);
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 py-2">
                <span>
                  {item?.name}: {p.qty} — {progressStatusLabel[p.status] ?? p.status} — تراكمي معتمد{" "}
                  {item ? approvedQty(state.progress, item.id) : 0}
                </span>
                {p.status === "draft" ? (
                  <Button onClick={() => approveProgress(p.id)}>اعتماد الحصر</Button>
                ) : null}
              </li>
            );
          })}
          {state.progress.filter((p) => p.projectId === projectId).length ===
          0 ? (
            <li className="text-stone-500">مفيش حصر على المشروع ده بعد.</li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
