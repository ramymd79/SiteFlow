"use client";

import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export const DEMO_EXAMPLE = {
  text: "اشتريت دهانات أوضة النوم بـ 600 من عبد الله",
  amount: "600",
  vendor: "عبد الله",
} as const;

const STEPS: {
  role: Role | "any";
  title: string;
  detail: string;
}[] = [
  {
    role: "owner",
    title: "١) المالك يبدأ نظيف",
    detail:
      "اضغط «إعادة بيانات التجربة» ثم «خروج — غيّر الدور من هنا»، وبعدين ادخل كمهندس.",
  },
  {
    role: "engineer",
    title: "٢) المهندس يكتب مصروف جديد",
    detail:
      "من «سجّل مصروف»: اكتب اللي حصل، المبلغ، المورد، المشروع. احفظ كمسودة، وبعدين «ابعتها للمشرف».",
  },
  {
    role: "supervisor",
    title: "٣) المشرف يراجع",
    detail:
      "من «المراجعة»: اختار الحركة الجديدة، راجع المشروع والمبلغ والعهدة، اضغط «ابعتها للحسابات».",
  },
  {
    role: "finance",
    title: "٤) الحسابات تعتمد",
    detail:
      "من «المراجعة»: اختار الحركة، راجع العهدة، اضغط «اعتماد».",
  },
  {
    role: "owner",
    title: "٥) المالك يشوف النتيجة",
    detail:
      "ارجع كمالك. على الرئيسية شوف «الفلوس راحت فين» و«إيه الناقص قبل الإقفال».",
  },
];

export function DemoPathCard({
  showReset = false,
}: {
  showReset?: boolean;
}) {
  const { currentUser, resetDemo } = useStore();
  const role = currentUser?.role;

  return (
    <Card className="border-emerald-800 bg-emerald-50">
      <p className="text-sm font-semibold text-emerald-950">
        مسار التجربة المظبوط
      </p>
      <p className="mt-1 text-sm text-stone-700">
        المهندس هو اللي بيكتب المصروف. المشرف والحسابات بيراجعوا. المالك بيتفرج
        على الفلوس والناقص. البيانات الجاهزة للتوضيح بس؛ المصروف الجديد تكتبه
        أنت في خطوة المهندس.
      </p>
      <ol className="mt-3 space-y-2">
        {STEPS.map((step) => {
          const active = role === step.role;
          return (
            <li
              key={step.title}
              className={`rounded-lg px-3 py-2 text-sm ${
                active
                  ? "bg-emerald-900 text-white"
                  : "bg-white text-stone-700"
              }`}
            >
              <p className="font-medium">{step.title}</p>
              <p className={active ? "mt-1 text-emerald-50" : "mt-1 text-stone-600"}>
                {step.detail}
              </p>
            </li>
          );
        })}
      </ol>
      {showReset && role === "owner" ? (
        <div className="mt-3 space-y-2">
          <Button
            className="w-full"
            onClick={() => {
              resetDemo();
            }}
          >
            إعادة بيانات التجربة وابدأ نظيف
          </Button>
          <p className="text-xs text-stone-600">
            بعد الإعادة: اضغط خروج، وبعدين ادخل من زر «مهندس».
          </p>
        </div>
      ) : null}
      {role === "engineer" ? (
        <Link
          href="/app/capture"
          className="mt-3 block rounded-lg bg-emerald-900 px-4 py-3 text-center text-sm font-medium text-white"
        >
          روح لسجّل مصروف دلوقتي
        </Link>
      ) : null}
      {role === "supervisor" || role === "finance" ? (
        <Link
          href="/app/review"
          className="mt-3 block rounded-lg bg-emerald-900 px-4 py-3 text-center text-sm font-medium text-white"
        >
          روح للمراجعة دلوقتي
        </Link>
      ) : null}
    </Card>
  );
}
