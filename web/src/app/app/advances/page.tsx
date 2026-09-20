"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Field,
  PageTitle,
  advanceStatusLabel,
  inputClass,
} from "@/components/ui";
import {
  approvedOnAdvance,
  remainingOnAdvance,
  underReviewOnAdvance,
} from "@/lib/logic";
import { formatMoney, parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function AdvancesPage() {
  const { state, createAdvance, settleAdvance } = useStore();
  const [personUserId, setPersonUserId] = useState("u-engineer");
  const [projectId, setProjectId] = useState(state.projects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");

  function exportCsv() {
    const rows = [
      ["العهدة", "الشخص", "المشروع", "المستلم", "المعتمد", "تحت المراجعة", "المتبقي", "الحالة"],
      ...state.advances.map((a) => {
        const person = state.users.find((u) => u.id === a.personUserId)?.name ?? "";
        const project = state.projects.find((p) => p.id === a.projectId)?.name ?? "";
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
    ];
    const csv = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "siteflow-advances.csv";
    a.click();
  }

  return (
    <div className="space-y-4">
      <PageTitle
        title="العهد المتعددة"
        hint="نفس الشخص يقدر يبقى عنده أكثر من عهدة مفتوحة. المتبقي = المستلم − المعتمد."
      />
      <Card>
        <form
          className="grid gap-3 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            createAdvance({
              personUserId,
              projectId,
              title,
              disbursedPiasters: parseEgp(amount),
            });
            setTitle("");
            setAmount("");
          }}
        >
          <Field label="المستلم">
            <select
              className={inputClass}
              value={personUserId}
              onChange={(e) => setPersonUserId(e.target.value)}
            >
              {state.users
                .filter((u) => u.role === "engineer" || u.role === "supervisor")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="المشروع">
            <select
              className={inputClass}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الاسم">
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Field>
          <Field label="المبلغ المصروف">
            <input
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Field>
            <Button type="submit" className="w-full md:w-auto">صرف عهدة</Button>
        </form>
      </Card>
      {err ? <p className="text-sm text-red-800">{err}</p> : null}
      <div className="flex justify-end">
        <Button variant="ghost" onClick={exportCsv}>
          تصدير إكسل
        </Button>
      </div>
      <div className="space-y-3">
        {state.advances.map((a) => (
          <Card key={a.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-medium">{a.title}</h2>
                <p className="text-sm text-stone-600">
                  {state.users.find((u) => u.id === a.personUserId)?.name} —{" "}
                  {state.projects.find((p) => p.id === a.projectId)?.name} —{" "}
                  {advanceStatusLabel[a.status] ?? a.status}
                </p>
              </div>
              {a.status !== "settled" ? (
                <Button
                  variant="ghost"
                  onClick={() => setErr(settleAdvance(a.id) ?? "")}
                >
                  تسوية
                </Button>
              ) : null}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              <div>
                <dt className="text-stone-500">مستلم</dt>
                <dd>{formatMoney(a.disbursedPiasters)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">معتمد</dt>
                <dd>{formatMoney(approvedOnAdvance(state.expenses, a.id))}</dd>
              </div>
              <div>
                <dt className="text-stone-500">تحت المراجعة</dt>
                <dd>
                  {formatMoney(underReviewOnAdvance(state.captures, a.id))}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">متبقي</dt>
                <dd>{formatMoney(remainingOnAdvance(a, state.expenses))}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </div>
  );
}
