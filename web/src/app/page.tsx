"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { DEMO_PASSWORD } from "@/lib/seed";
import { useStore } from "@/lib/store";

const ACCOUNTS = [
  ["مالك", "owner@demo.siteflow", "يشوف الفلوس والناقص"],
  ["حسابات", "finance@demo.siteflow", "يعتمد أو يرجع المصروف"],
  ["مشرف", "supervisor@demo.siteflow", "يراجع ويبعت للحسابات"],
  ["مهندس", "engineer@demo.siteflow", "يسجّل مصروف من الموقع"],
] as const;

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

  function enterAs(mail: string) {
    setEmail(mail);
    setPassword(DEMO_PASSWORD);
    const err = login(mail, DEMO_PASSWORD);
    if (err) {
      setError(err);
      return;
    }
    if (mail === "client@demo.siteflow") {
      setError("التجربة دي لفريق الشركة، مش لبوابة العميل.");
      logout();
      return;
    }
    router.replace("/app");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-500">
        جاري التحميل
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-stone-200 bg-white p-5">
        <div>
          <h1 className="text-2xl font-semibold">SiteFlow</h1>
          <p className="mt-2 text-sm text-stone-700">
            فلوس العهد: راحت فين؟ ومين مسؤول عن الخطوة الجاية قبل الإقفال؟
          </p>
          <p className="mt-2 text-sm text-stone-600">
            ابدأ من الأزرار الكبيرة تحت. جوه البرنامج هتلاقي «مسار التجربة
            المظبوط» مكتوب على الشاشة. كلمة السر: {DEMO_PASSWORD}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-stone-900">
            اضغط دور عشان تدخل فورًا
          </p>
          <div className="grid gap-2">
            {ACCOUNTS.map(([label, mail, hint]) => (
              <button
                key={mail}
                type="button"
                className="min-h-14 w-full rounded-xl border-2 border-emerald-900 bg-emerald-50 px-4 py-3 text-right"
                onClick={() => enterAs(mail)}
              >
                <span className="block text-base font-semibold text-emerald-950">
                  {label}
                </span>
                <span className="mt-0.5 block text-sm text-stone-600">
                  {hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        <details className="rounded-xl border border-stone-200 bg-stone-50 p-3">
          <summary className="cursor-pointer text-sm text-stone-700">
            دخول يدوي بالبريد وكلمة السر
          </summary>
          <form
            className="mt-3 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              enterAs(email.trim());
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
        </details>
      </div>
    </div>
  );
}
