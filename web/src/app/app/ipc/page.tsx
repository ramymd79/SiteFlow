"use client";

import { useState } from "react";
import { Button, Card, Field, PageTitle, inputClass } from "@/components/ui";
import { draftClientIpc } from "@/lib/logic";
import { formatMoney, parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function IpcPage() {
  const { state, issueClientIpc } = useStore();
  const [projectId, setProjectId] = useState("p-zayed");
  const [deductions, setDeductions] = useState("0");
  const [err, setErr] = useState("");
  const draft = draftClientIpc(state, projectId, parseEgp(deductions));

  return (
    <div className="space-y-4">
      <PageTitle
        title="مستخلص العميل"
        hint="من الإنجاز المعتمد. استرداد دفعة العقد مش خصم عهد المهندس."
      />
      <Card className="space-y-3">
        <Field label="المشروع">
          <select className={inputClass} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div>سابق معتمد: {formatMoney(draft.previous)}</div>
          <div>عمل حالي: {formatMoney(draft.current)}</div>
          <div>احتجاز {state.settings.retentionPct}٪: {formatMoney(draft.retention)}</div>
          <div>استرداد دفعة العقد: {formatMoney(draft.recovery)}</div>
          <div>قيمة تغييرات معتمدة: {formatMoney(draft.variation)}</div>
          <div>صافي تقديري: {formatMoney(draft.net)}</div>
        </dl>
        <Field label="استقطاعات أخرى">
          <input className={inputClass} value={deductions} onChange={(e) => setDeductions(e.target.value)} />
        </Field>
        {err ? <p className="text-sm text-red-800">{err}</p> : null}
        <Button
          disabled={draft.current <= 0}
          onClick={() => setErr(issueClientIpc(projectId, parseEgp(deductions)) ?? "")}
        >
          إصدار مستخلص
        </Button>
      </Card>
      <Card>
        <h2 className="mb-2 font-medium">المستخلصات الصادرة</h2>
        <ul className="space-y-2 text-sm">
          {state.clientIpcs
            .filter((i) => i.projectId === projectId)
            .map((i) => (
              <li key={i.id}>
                رقم {i.number} — صافي {formatMoney(i.netPiasters)} — سابق{" "}
                {formatMoney(i.previousCertifiedPiasters)} — حالي{" "}
                {formatMoney(i.currentWorkPiasters)}
              </li>
            ))}
        </ul>
        <button
          className="mt-3 text-sm underline"
          onClick={() => window.print()}
        >
          طباعة / PDF
        </button>
      </Card>
    </div>
  );
}
