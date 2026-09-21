"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const PATH_A = [
  {
    roles: ["engineer", "owner", "supervisor"] as Role[],
    title: "١) المهندس يسجّل مصروف",
    href: "/app/capture",
    detail: "اكتب اللي حصل والمبلغ والمورد، احفظ، وابعتها للمشرف.",
  },
  {
    roles: ["supervisor", "owner"] as Role[],
    title: "٢) المشرف يراجع",
    href: "/app/review",
    detail: "صحّح لو ناقص، وابعتها للحسابات.",
  },
  {
    roles: ["finance", "owner"] as Role[],
    title: "٣) الحسابات تعتمد",
    href: "/app/review",
    detail: "اعتماد يخصم من العهدة. إرجاع بيرجع للتصحيح.",
  },
  {
    roles: ["owner", "finance"] as Role[],
    title: "٤) شوف الفلوس والنواقص",
    href: "/app",
    detail: "على الرئيسية والعهد والنواقص والتصدير.",
  },
];

const PATH_B = [
  {
    roles: ["owner", "finance", "supervisor"] as Role[],
    title: "١) بنود العقد",
    href: "/app/boq",
    detail: "بنود فيلا زايد والمعادي جاهزة. تقدر تضيف بند.",
  },
  {
    roles: ["owner", "finance", "supervisor"] as Role[],
    title: "٢) سجّل تقدم واعتمده",
    href: "/app/progress",
    detail: "التقدم غير المعتمد مش بيدخل المستخلص.",
  },
  {
    roles: ["owner", "finance"] as Role[],
    title: "٣) اطلع مستخلص عميل",
    href: "/app/ipc",
    detail: "من الإنجاز المعتمد، مش من مصروف العهد.",
  },
  {
    roles: ["owner", "finance", "client"] as Role[],
    title: "٤) شوف بوابة العميل",
    href: "/app/portal",
    detail: "ادخل بحساب العميل، أو افتح البوابة كمالك.",
  },
];

export function TourPathsCard() {
  const { currentUser } = useStore();
  if (!currentUser || currentUser.role === "client") return null;
  const role = currentUser.role;
  const pathA = PATH_A.filter((s) => s.roles.includes(role));
  const pathB = PATH_B.filter((s) => s.roles.includes(role));

  return (
    <div className="space-y-4">
      <Card className="border-emerald-800 bg-emerald-50">
        <p className="text-sm font-semibold text-emerald-950">
          مسار أ — لب المنتج (العهد)
        </p>
        <p className="mt-1 text-sm text-stone-700">
          ده المركز. فلوس العهد: راحت فين؟ ومين مسؤول؟
        </p>
        <ol className="mt-3 space-y-2">
          {pathA.map((step) => (
            <li key={step.title}>
              <Link
                href={step.href}
                className="block rounded-lg bg-white px-3 py-2 text-sm text-stone-800"
              >
                <p className="font-medium">{step.title}</p>
                <p className="mt-1 text-stone-600">{step.detail}</p>
              </Link>
            </li>
          ))}
        </ol>
        {role === "engineer" ? (
          <p className="mt-3 text-xs text-emerald-900">
            بعد الإرسال: خروج، دخول كمشرف، بعدين كحسابات.
          </p>
        ) : null}
        {role === "finance" ? (
          <p className="mt-3 text-xs text-emerald-900">
            لو الطابور فاضي: خروج وادخل كمهندس وسجّل أول مصروف.
          </p>
        ) : null}
      </Card>

      <Card className="border-amber-700 bg-amber-50">
        <p className="text-sm font-semibold text-amber-950">
          مسار ب — باقي الصورة الكبيرة (للتجربة)
        </p>
        <p className="mt-1 text-sm text-stone-700">
          بنود وتقدم ومستخلص وبوابة. مش لب البيع دلوقتي — جولة عشان تشوف الفكرة
          كاملة.
        </p>
        {pathB.length > 0 ? (
          <ol className="mt-3 space-y-2">
            {pathB.map((step) => (
              <li key={step.title}>
                <Link
                  href={step.href}
                  className="block rounded-lg bg-white px-3 py-2 text-sm text-stone-800"
                >
                  <p className="font-medium">{step.title}</p>
                  <p className="mt-1 text-stone-600">{step.detail}</p>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-stone-700">
            المسار ده للمالك والحسابات. اخرج وادخل كمالك عشان تشوف البنود
            والمستخلص والبوابة.
          </p>
        )}
        {role === "supervisor" ? (
          <p className="mt-3 text-xs text-amber-900">
            المستخلص والبوابة للمالك/الحسابات. بعد التقدم: دخول كمالك.
          </p>
        ) : null}
        {role === "owner" || role === "finance" ? (
          <p className="mt-3 text-xs text-amber-900">
            لبوابة العميل من برّه: خروج، بعدين دخول بحساب العميل.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
