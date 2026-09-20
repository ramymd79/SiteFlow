"use client";

import { useState } from "react";
import { Button, Card, Field, PageTitle, StatusPill, inputClass } from "@/components/ui";
import { parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function CapturePage() {
  const { state, currentUser, addCapture, sendToSupervisor } = useStore();
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [done, setDone] = useState("");

  const mine =
    currentUser?.role === "owner" || currentUser?.role === "supervisor"
      ? state.captures
      : state.captures.filter((c) => c.createdBy === currentUser?.id);

  const waiting =
    mine.filter((c) => c.status === "draft" || c.status === "returned").length;

  function resetForm() {
    setText("");
    setAmount("");
    setVendor("");
    setPetty(false);
    setFileName("");
    setFileData("");
    setMoreOpen(false);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageTitle
        title="سجّل مصروف من الموقع"
        hint="زي ما بتعمل في الواقع: صورة أو وصف، مبلغ، ومشروع. الأصل يتحفظ زي ما هو."
      />

      <Card>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            const id = addCapture({
              projectId,
              originalText: text,
              amountPiasters: parseEgp(amount),
              vendorName: vendor,
              description: text,
              pettyNoReceipt: petty,
              source: "web",
              originalFileName: fileName || undefined,
              originalFileDataUrl: fileData || undefined,
            });
            resetForm();
            setLastId(id);
            setDone("اتحفظت. ابعتها للمشرف من تحت عشان تكمل.");
          }}
        >
          <section className="space-y-3">
            <p className="text-xs font-medium text-emerald-900">١ — الأصل</p>
            <Field label="إيه اللي حصل؟">
              <textarea
                className={inputClass}
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                placeholder="مثال: سيراميك حمام — فاتورة من المعرض"
              />
            </Field>
            <div className="block space-y-1 text-sm">
              <span className="text-stone-600">صورة الفاتورة أو المرفق</span>
              <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 px-3 text-sm text-stone-700">
                {fileName ? fileName : "اضغط لاختيار صورة أو PDF"}
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
              <p className="text-xs text-stone-500">
                مش إجباري، بس بيسهّل المراجعة. الأصل ما بيتامسحش.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-medium text-emerald-900">٢ — المبلغ والمشروع</p>
            <Field label="المبلغ بالجنيه">
              <input
                className={inputClass}
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="850"
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
          </section>

          <section>
            <button
              type="button"
              className="text-sm text-stone-600 underline"
              onClick={() => setMoreOpen((v) => !v)}
            >
              {moreOpen ? "إخفاء التفاصيل الزيادة" : "تفاصيل زيادة (اختياري)"}
            </button>
            {moreOpen ? (
              <div className="mt-3 space-y-3">
                <Field label="المورد">
                  <input
                    className={inputClass}
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="اسم المحل أو المقاول"
                  />
                </Field>
                <label className="flex min-h-11 items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="size-5"
                    checked={petty}
                    onChange={(e) => setPetty(e.target.checked)}
                  />
                  بلا فاتورة (نثريات)
                </label>
              </div>
            ) : null}
          </section>

          <Button type="submit" className="w-full">
            احفظ كمسودة
          </Button>
        </form>
        {done ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {done}
          </p>
        ) : null}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-medium">
            {currentUser?.role === "engineer" ? "حركاتي" : "الحركات"}
          </h2>
          {waiting > 0 ? (
            <span className="text-xs text-stone-500">
              {waiting} مستنية إرسال
            </span>
          ) : null}
        </div>
        <ul className="space-y-3">
          {mine.map((c) => (
            <li
              key={c.id}
              className="space-y-2 border-b border-stone-100 pb-3 last:border-b-0"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{c.description}</span>
                <StatusPill status={c.status} />
              </div>
              <p className="text-xs text-stone-500">
                {c.originalFileName ? `${c.originalFileName} · ` : ""}
                {projects.find((p) => p.id === c.projectId)?.name ?? ""}
              </p>
              {c.status === "draft" || c.status === "returned" ? (
                <Button
                  className={`w-full ${
                    lastId === c.id ? "ring-2 ring-emerald-700 ring-offset-2" : ""
                  }`}
                  onClick={() => {
                    sendToSupervisor(c.id);
                    setDone("اتبعتت للمشرف. هو اللي يراجع قبل الحسابات.");
                    setLastId(null);
                  }}
                >
                  {lastId === c.id ? "الخطوة الجاية: ابعتها للمشرف" : "ابعتها للمشرف"}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
