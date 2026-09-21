"use client";

import { useState } from "react";
import { Button, Card, Field, StatusPill, inputClass } from "@/components/ui";
import { formatMoney, parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function CapturePage() {
  const {
    state,
    currentUser,
    addCapture,
    sendToSupervisor,
    reopenCaptureDraft,
  } = useStore();
  const projects = state.projects.filter((p) =>
    currentUser?.projectIds.includes(p.id),
  );
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [petty, setPetty] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState("");
  const [done, setDone] = useState("");
  const [formErr, setFormErr] = useState("");

  const mine =
    currentUser?.role === "owner" || currentUser?.role === "supervisor"
      ? state.captures
      : state.captures.filter((c) => c.createdBy === currentUser?.id);

  const waiting = mine.filter(
    (c) => c.status === "draft" || c.status === "returned",
  );

  function resetForm() {
    setText("");
    setAmount("");
    setVendor("");
    setPetty(false);
    setFileName("");
    setFileData("");
  }

  function save(andSend: boolean) {
    setFormErr("");
    if (!text.trim()) {
      setFormErr("اكتب إيه اللي حصل.");
      return;
    }
    const amountPiasters = parseEgp(amount);
    if (amountPiasters <= 0) {
      setFormErr("اكتب المبلغ.");
      return;
    }
    addCapture({
      projectId,
      originalText: text,
      amountPiasters,
      vendorName: vendor,
      description: text,
      pettyNoReceipt: petty,
      source: "web",
      originalFileName: fileName || undefined,
      originalFileDataUrl: fileData || undefined,
      sendNow: andSend,
    });
    resetForm();
    if (andSend) {
      setDone("اتبعتت للمشرف. اخرج وادخل بحساب المشرف.");
    } else {
      setDone("اتحفظت كمسودة. تقدر تبعتها من تحت.");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">سجّل مصروف</h1>
        <p className="mt-1 text-sm text-stone-500">المبلغ + إيه اللي حصل</p>
      </div>

      <Card className="space-y-4">
        <Field label="المبلغ بالجنيه">
          <input
            className={`${inputClass} text-xl font-semibold`}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="600"
            required
            autoFocus
          />
        </Field>
        <Field label="إيه اللي حصل؟">
          <textarea
            className={inputClass}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder="سيراميك حمام من المعرض"
          />
        </Field>
        <Field label="المورد">
          <input
            className={inputClass}
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="اختياري"
          />
        </Field>
        <Field label="المشروع">
          <select
            className={inputClass}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 px-3 text-sm text-stone-600">
          {fileName ? fileName : "صورة الفاتورة (اختياري)"}
          <input
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              const reader = new FileReader();
              reader.onload = () => setFileData(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </label>

        <label className="flex items-center gap-3 text-sm text-stone-700">
          <input
            type="checkbox"
            className="size-5"
            checked={petty}
            onChange={(e) => setPetty(e.target.checked)}
          />
          بلا فاتورة (نثريات)
        </label>

        {formErr ? <p className="text-sm text-red-800">{formErr}</p> : null}

        <Button className="w-full min-h-14 text-base" onClick={() => save(true)}>
          احفظ وابعث للمشرف
        </Button>
        <button
          type="button"
          className="w-full text-sm text-stone-500 underline"
          onClick={() => save(false)}
        >
          احفظ كمسودة بس
        </button>

        {done ? (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {done}
          </p>
        ) : null}
      </Card>

      {waiting.length > 0 ? (
        <Card>
          <p className="mb-3 text-sm font-medium text-stone-800">
            مستنية إرسال ({waiting.length})
          </p>
          <ul className="space-y-3">
            {waiting.map((c) => (
              <li
                key={c.id}
                className="space-y-2 border-b border-stone-100 pb-3 last:border-b-0"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{c.description}</span>
                  <StatusPill status={c.status} />
                </div>
                <p className="text-sm">{formatMoney(c.amountPiasters)}</p>
                {c.returnReason ? (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    سبب الحسابات: {c.returnReason}
                  </p>
                ) : null}
                <Button
                  className="w-full"
                  onClick={() => {
                    sendToSupervisor(c.id);
                    setDone("اتبعتت للمشرف.");
                  }}
                >
                  ابعتها للمشرف
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {mine.some((c) => c.status === "rejected") ? (
        <Card>
          <p className="mb-3 text-sm font-medium">مرفوض</p>
          <ul className="space-y-3">
            {mine
              .filter((c) => c.status === "rejected")
              .map((c) => (
                <li key={c.id} className="space-y-2">
                  <p className="text-sm">
                    {c.description} — {formatMoney(c.amountPiasters)}
                  </p>
                  {c.returnReason ? (
                    <p className="text-sm text-stone-600">{c.returnReason}</p>
                  ) : null}
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      reopenCaptureDraft(c.id);
                      setDone("اتفتحت كمسودة تاني.");
                    }}
                  >
                    افتحها تاني
                  </Button>
                </li>
              ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
