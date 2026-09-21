"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { DEMO_PASSWORD } from "@/lib/seed";
import { useStore } from "@/lib/store";

const ACCOUNTS = [
  ["مهندس", "engineer@demo.siteflow", "سجّل مصروف"],
  ["مشرف", "supervisor@demo.siteflow", "راجع وابعث"],
  ["حسابات", "finance@demo.siteflow", "اعتمد"],
  ["مالك", "owner@demo.siteflow", "شوف الفلوس"],
  ["عميل", "client@demo.siteflow", "بوابة فقط"],
] as const;

export default function LoginPage() {
  const { login, currentUser, ready } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("engineer@demo.siteflow");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) return;
    if (currentUser.role === "client") {
      router.replace("/app/portal");
      return;
    }
    router.replace("/app");
  }, [ready, currentUser, router]);

  function enterAs(mail: string) {
    setEmail(mail);
    setPassword(DEMO_PASSWORD);
    const err = login(mail, DEMO_PASSWORD);
    if (err) {
      setError(err);
      return;
    }
    if (mail === "client@demo.siteflow") {
      router.replace("/app/portal");
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
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">SiteFlow</h1>
          <p className="mt-2 text-sm text-stone-600">فلوس العهد راحت فين؟</p>
        </div>

        <div className="space-y-2">
          {ACCOUNTS.map(([label, mail, hint]) => (
            <button
              key={mail}
              type="button"
              className="flex min-h-16 w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-right shadow-sm transition hover:border-emerald-800"
              onClick={() => enterAs(mail)}
            >
              <span>
                <span className="block text-lg font-semibold text-stone-900">
                  {label}
                </span>
                <span className="mt-0.5 block text-sm text-stone-500">
                  {hint}
                </span>
              </span>
              <span className="text-stone-400" aria-hidden>
                ←
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-stone-500">
          كلمة السر: {DEMO_PASSWORD}
        </p>

        <details className="rounded-xl border border-stone-200 bg-white p-3">
          <summary className="cursor-pointer text-sm text-stone-600">
            دخول يدوي
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
