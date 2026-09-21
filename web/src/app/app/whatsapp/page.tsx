"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Card,
  Field,
  PageTitle,
  captureStatusLabel,
  inputClass,
} from "@/components/ui";
import { formatMoney, parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function WhatsappPage() {
  const { state, addCapture, sendToSupervisor } = useStore();
  const [phone, setPhone] = useState("01000000004");
  const [text, setText] = useState("صرفت 600 حديد لشقة المعادي");
  const [amount, setAmount] = useState("600");
  const [msg, setMsg] = useState("");
  const [lastId, setLastId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <PageTitle
        title="وارد واتساب"
        hint="محاكاة رسالة داخلة. الرسالة بتتحفظ كأصل. الربط الخارجي مش في التجربة."
      />
      <Card>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const user = state.users.find((u) => u.phone === phone);
            if (!user) {
              setMsg(
                "رقم مجهول — الحركة اتعلّقت كمسودة على أول مشروع. اربط الرقم لاحقًا.",
              );
            }
            const projectId = user?.projectIds[0] ?? state.projects[0].id;
            const amountPiasters = parseEgp(amount);
            if (amountPiasters <= 0) {
              setMsg("اكتب مبلغ أكبر من صفر.");
              return;
            }
            const id = addCapture({
              projectId,
              originalText: text,
              amountPiasters,
              vendorName: "",
              description: text,
              pettyNoReceipt: false,
              source: "whatsapp",
              createdBy: user?.id,
            });
            setLastId(id);
            setMsg(
              "تم الاستلام كمسودة. اضغط «ابعتها للمشرف» تحت، أو كمّل من سجّل مصروف.",
            );
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
        {lastId ? (
          <Button
            className="mt-3 w-full"
            onClick={() => {
              sendToSupervisor(lastId);
              setMsg("اتبعتت للمشرف. اخرج وادخل بحساب المشرف عشان تكمل.");
              setLastId(null);
            }}
          >
            ابعتها للمشرف
          </Button>
        ) : null}
      </Card>
      <Card>
        <h2 className="mb-3 font-medium">الوارد المحفوظ كأصل</h2>
        <ul className="space-y-2 text-sm">
          {state.captures
            .filter((c) => c.source === "whatsapp")
            .map((c) => (
              <li key={c.id} className="border-b border-stone-100 py-2">
                <p>
                  {c.originalText} — {formatMoney(c.amountPiasters)} —{" "}
                  {captureStatusLabel[c.status]}
                </p>
                {c.status === "draft" || c.status === "returned" ? (
                  <Button
                    className="mt-2"
                    onClick={() => {
                      sendToSupervisor(c.id);
                      setMsg("اتبعتت للمشرف.");
                    }}
                  >
                    ابعتها للمشرف
                  </Button>
                ) : null}
              </li>
            ))}
          {state.captures.filter((c) => c.source === "whatsapp").length ===
          0 ? (
            <li className="text-stone-500">لسه مفيش رسائل واتساب محاكاة.</li>
          ) : null}
        </ul>
        <p className="mt-3 text-sm text-stone-600">
          كمان تقدر{" "}
          <Link href="/app/capture" className="underline">
            تسجّل مصروف من الويب
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
