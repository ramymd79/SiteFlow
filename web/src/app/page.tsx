"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { DEMO_PASSWORD } from "@/lib/seed";
import { useStore } from "@/lib/store";

const ACCOUNTS = [
  ["مالك", "owner@demo.siteflow"],
  ["حسابات", "finance@demo.siteflow"],
  ["مشرف", "supervisor@demo.siteflow"],
  ["مهندس", "engineer@demo.siteflow"],
];

export default function LoginPage() {
  const { login, logout, currentUser, ready } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("owner@demo.siteflow");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) return;
    if (currentUser.role === "client") {
      logout();
      return;
    }
    router.replace("/app");
  }, [ready, currentUser, router, logout]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-500">
        جاري التحميل
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-stone-200 bg-white p-5">
        <div>
          <h1 className="text-2xl font-semibold">SiteFlow</h1>
          <p className="mt-2 text-sm text-stone-700">
            فلوس العهد: راحت فين؟ ومين مسؤول عن الخطوة الجاية قبل الإقفال؟
          </p>
          <p className="mt-2 text-sm text-stone-600">
            تجربة مقصوصة على ثلاث شاشات: الرئيسية، سجّل مصروف، المراجعة. كلمة
            السر: {DEMO_PASSWORD}
          </p>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const err = login(email, password);
            if (err) setError(err);
            else if (email.trim() === "client@demo.siteflow") {
              setError("التجربة دي لفريق الشركة، مش لبوابة العميل.");
              logout();
            } else {
              router.replace("/app");
            }
          }}
        >
          <Field label="البريد">
            <input
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="كلمة السر">
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error ? <p className="text-sm text-red-800">{error}</p> : null}
          <Button type="submit" className="w-full">
            دخول
          </Button>
        </form>
        <div className="space-y-2">
          <p className="text-xs text-stone-500">جرّب دورًا:</p>
          <div className="flex flex-wrap gap-2">
            {ACCOUNTS.map(([label, mail]) => (
              <button
                key={mail}
                type="button"
                className="min-h-11 rounded-full bg-stone-100 px-4 py-2 text-sm"
                onClick={() => {
                  setEmail(mail);
                  setPassword(DEMO_PASSWORD);
                  const err = login(mail, DEMO_PASSWORD);
                  if (err) setError(err);
                  else router.replace("/app");
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
