"use client";

import { useEffect, useState } from "react";
import { DemoPathCard } from "@/components/demo-path";
import {
  Button,
  Card,
  Field,
  PageTitle,
  StatusPill,
  auditValueLabel,
  inputClass,
} from "@/components/ui";
import { remainingOnAdvance } from "@/lib/logic";
import { formatMoney, parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

function SupervisorReview() {
  const { state, updateCapture, sendToFinance, suggestAi } = useStore();
  const queue = state.captures.filter(
    (c) => c.status === "with_supervisor" || c.status === "returned",
  );
  const [active, setActive] = useState(queue[0]?.id ?? "");
  const [err, setErr] = useState("");
  const capture = queue.find((c) => c.id === active) ?? queue[0];

  useEffect(() => {
    if (!queue.some((c) => c.id === active)) {
      setActive(queue[0]?.id ?? "");
    }
  }, [queue, active]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-medium">عند المشرف</h2>
        <p className="text-sm text-stone-600">
          صحّح المشروع أو المبلغ لو ناقص، وبعدين ابعتها للحسابات.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <ul className="space-y-2">
            {queue.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg p-3 text-right text-sm ${
                    capture?.id === c.id ? "bg-emerald-50" : "bg-stone-50"
                  }`}
                  onClick={() => {
                    setActive(c.id);
                    setErr("");
                  }}
                >
                  <div className="flex justify-between gap-2">
                    <span>{c.description}</span>
                    <StatusPill status={c.status} />
                  </div>
                </button>
              </li>
            ))}
            {queue.length === 0 ? (
              <p className="text-sm text-stone-500">مفيش حاجة مستنية مراجعة.</p>
            ) : null}
          </ul>
        </Card>
        {capture ? (
          <Card key={capture.id} className="space-y-3 md:col-span-2">
            <p className="text-sm text-stone-500">
              الأصل: {capture.originalText}
            </p>
            {capture.originalFileDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={capture.originalFileDataUrl}
                alt="أصل المرفق"
                className="max-h-40 rounded-lg"
              />
            ) : null}
            {capture.aiAmount ? (
              <p className="text-sm">
                اقتراح الذكاء: {formatMoney(capture.aiAmount)} —{" "}
                {capture.aiVendor} (لا يُعتمد وحده)
              </p>
            ) : (
              <Button variant="ghost" onClick={() => suggestAi(capture.id)}>
                اقترح من النص
              </Button>
            )}
            <Field label="المشروع">
              <select
                className={inputClass}
                value={capture.projectId}
                onChange={(e) =>
                  updateCapture(
                    capture.id,
                    { projectId: e.target.value },
                    "تعديل مشروع",
                  )
                }
              >
                {state.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="المبلغ بالجنيه">
              <input
                className={inputClass}
                inputMode="decimal"
                defaultValue={(capture.amountPiasters / 100).toString()}
                onBlur={(e) =>
                  updateCapture(
                    capture.id,
                    { amountPiasters: parseEgp(e.target.value) },
                    "تعديل مبلغ",
                  )
                }
              />
            </Field>
            <Field label="المورد">
              <input
                className={inputClass}
                defaultValue={capture.vendorName}
                onBlur={(e) =>
                  updateCapture(
                    capture.id,
                    { vendorName: e.target.value },
                    "تعديل مورد",
                  )
                }
              />
            </Field>
            <Field label="العهدة">
              <select
                className={inputClass}
                value={capture.advanceId ?? ""}
                onChange={(e) =>
                  updateCapture(
                    capture.id,
                    { advanceId: e.target.value || undefined },
                    "اختيار عهدة",
                  )
                }
              >
                <option value="">اختر عهدة</option>
                {state.advances
                  .filter(
                    (a) =>
                      a.status !== "settled" &&
                      a.projectId === capture.projectId,
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
              </select>
            </Field>
            {err ? <p className="text-sm text-red-800">{err}</p> : null}
            <Button
              className="w-full"
              onClick={() => setErr(sendToFinance(capture.id) ?? "")}
            >
              ابعتها للحسابات
            </Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function FinanceReview() {
  const { state, financeDecide } = useStore();
  const queue = state.captures.filter((c) => c.status === "with_finance");
  const [active, setActive] = useState(queue[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [advanceId, setAdvanceId] = useState("");
  const [err, setErr] = useState("");
  const capture = queue.find((c) => c.id === active) ?? queue[0];
  const audit = state.audit.filter((a) => a.entityId === capture?.id);

  useEffect(() => {
    if (!queue.some((c) => c.id === active)) {
      setActive(queue[0]?.id ?? "");
      setAdvanceId(queue[0]?.advanceId ?? "");
    }
  }, [queue, active]);

  function decide(decision: "approved" | "rejected" | "returned") {
    if (!capture) return;
    const message = financeDecide(
      capture.id,
      decision,
      note,
      advanceId || capture.advanceId,
    );
    setErr(message ?? "");
    if (!message) setNote("");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-medium">عند الحسابات</h2>
        <p className="text-sm text-stone-600">
          الاعتماد يخصم من العهدة. الإرجاع أو الرفض محتاج سبب مكتوب.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          {queue.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`mb-2 w-full rounded-lg p-3 text-right text-sm ${
                capture?.id === c.id ? "bg-emerald-50" : "bg-stone-50"
              }`}
              onClick={() => {
                setActive(c.id);
                setAdvanceId(c.advanceId ?? "");
                setErr("");
              }}
            >
              <div className="flex justify-between gap-2">
                <span>{c.description}</span>
                <StatusPill status={c.status} />
              </div>
              <span>{formatMoney(c.amountPiasters)}</span>
            </button>
          ))}
          {queue.length === 0 ? (
            <p className="text-sm text-stone-500">مفيش حركات مستنية اعتماد.</p>
          ) : null}
        </Card>
        {capture ? (
          <Card key={capture.id} className="space-y-3 md:col-span-2">
            <p className="whitespace-pre-wrap text-sm">
              الأصل: {capture.originalText}
            </p>
            <p className="text-sm">
              ملاحظة المشرف: {capture.supervisorNote || "—"}
            </p>
            <p className="text-lg">{formatMoney(capture.amountPiasters)}</p>
            <Field label="العهدة">
              <select
                className={inputClass}
                value={advanceId || capture.advanceId || ""}
                onChange={(e) => setAdvanceId(e.target.value)}
              >
                <option value="">اختر عهدة</option>
                {state.advances
                  .filter(
                    (a) =>
                      a.status !== "settled" &&
                      a.projectId === capture.projectId,
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} — متبقي{" "}
                      {formatMoney(remainingOnAdvance(a, state.expenses))}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="ملاحظة / سبب الإرجاع أو الرفض">
              <textarea
                className={inputClass}
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
            {err ? <p className="text-sm text-red-800">{err}</p> : null}
            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
              <Button
                onClick={() => decide("approved")}
                className="w-full sm:w-auto"
              >
                اعتماد
              </Button>
              <Button
                variant="ghost"
                onClick={() => decide("returned")}
                className="w-full sm:w-auto"
              >
                إرجاع
              </Button>
              <Button
                variant="danger"
                onClick={() => decide("rejected")}
                className="w-full sm:w-auto"
              >
                رفض
              </Button>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-medium">تاريخ التعديل</h3>
              <ul className="space-y-1 text-xs text-stone-600">
                {audit.map((a) => (
                  <li key={a.id}>
                    {a.action}: {auditValueLabel(a.before)} ←{" "}
                    {auditValueLabel(a.after)}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const { currentUser } = useStore();
  const role = currentUser?.role;

  return (
    <div className="space-y-8">
      <DemoPathCard />
      <PageTitle
        title="المراجعة"
        hint="الفلوس ما بتتحركش غير لما حد يعتمدها. المشرف يصحّح، الحسابات تعتمد."
      />
      {role === "supervisor" || role === "owner" ? <SupervisorReview /> : null}
      {role === "finance" || role === "owner" ? <FinanceReview /> : null}
      {role === "engineer" ? (
        <Card>
          <p className="text-sm text-stone-600">
            المراجعة مش على المهندس. سجّل المصروف من «سجّل مصروف» وابعته للمشرف.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
