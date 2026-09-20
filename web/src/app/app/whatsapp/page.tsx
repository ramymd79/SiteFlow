"use client";

import { useState } from "react";
import { Button, Card, Field, PageTitle, captureStatusLabel, inputClass } from "@/components/ui";
import { parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function WhatsappPage() {
  const { state, addCapture } = useStore();
  const [phone, setPhone] = useState("01000000004");
  const [text, setText] = useState("صرفت 600 حديد لشقة المعادي");
  const [amount, setAmount] = useState("600");
  const [msg, setMsg] = useState("");

  return (
    <div className="space-y-4">
      <PageTitle
        title="وارد واتساب"
        hint="محاكاة رسالة داخلة. الرسالة بتتحفظ كأصل. الربط الخارجي مش في التجربة المحلية."
      />
      <Card>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const user = state.users.find((u) => u.phone === phone);
            if (!user) {
              setMsg("رقم مجهول — اتربط يدويًا من الإعدادات لاحقًا. الحركة اتعلّقت كمسودة على أول مشروع.");
            }
            const projectId = user?.projectIds[0] ?? state.projects[0].id;
            addCapture({
              projectId,
              originalText: text,
              amountPiasters: parseEgp(amount),
              vendorName: "",
              description: text,
              pettyNoReceipt: false,
              source: "whatsapp",
              createdBy: user?.id,
            });
            setMsg("تم الاستلام. الرسالة في المسودات.");
          }}
        >
          <Field label="رقم المرسل">
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="نص الرسالة">
            <textarea
              className={inputClass}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </Field>
          <Field label="مبلغ إن وُجد">
            <input
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Button type="submit">محاكاة وصول رسالة</Button>
        </form>
        {msg ? <p className="mt-3 text-sm">{msg}</p> : null}
      </Card>
      <Card>
        <h2 className="mb-3 font-medium">الوارد المحفوظ كأصل</h2>
        <ul className="space-y-2 text-sm">
          {state.captures
            .filter((c) => c.source === "whatsapp")
            .map((c) => (
              <li key={c.id} className="border-b border-stone-100 py-2">
                {c.originalText} — {captureStatusLabel[c.status]}
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}
