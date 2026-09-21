"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const PATH_A = [
  {
    roles: ["engineer", "owner", "supervisor"] as Role[],
    title: "سجّل مصروف",
    href: "/app/capture",
  },
  {
    roles: ["supervisor", "owner"] as Role[],
    title: "المشرف يراجع",
    href: "/app/review",
  },
  {
    roles: ["finance", "owner"] as Role[],
    title: "الحسابات تعتمد",
    href: "/app/review",
  },
  {
    roles: ["owner", "finance"] as Role[],
    title: "شوف العهد",
    href: "/app/advances",
  },
];

const PATH_B = [
  {
    roles: ["owner", "finance", "supervisor"] as Role[],
    title: "بنود",
    href: "/app/boq",
  },
  {
    roles: ["owner", "finance", "supervisor"] as Role[],
    title: "تقدم",
    href: "/app/progress",
  },
  {
    roles: ["owner", "finance"] as Role[],
    title: "مستخلص",
    href: "/app/ipc",
  },
  {
    roles: ["owner", "finance", "client"] as Role[],
    title: "بوابة",
    href: "/app/portal",
  },
];

export function TourPathsCard() {
  const { currentUser } = useStore();
  if (!currentUser || currentUser.role === "client") return null;
  const role = currentUser.role;
  const pathA = PATH_A.filter((s) => s.roles.includes(role));
  const pathB = PATH_B.filter((s) => s.roles.includes(role));

  return (
    <div className="space-y-3 px-2 pt-2">
      <div>
        <p className="mb-2 text-xs font-medium text-emerald-900">مسار العهد</p>
        <div className="flex flex-wrap gap-2">
          {pathA.map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-950"
            >
              {step.title}
            </Link>
          ))}
        </div>
      </div>
      {pathB.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium text-amber-900">
            بنود ومستخلص
          </p>
          <div className="flex flex-wrap gap-2">
            {pathB.map((step) => (
              <Link
                key={step.title}
                href={step.href}
                className="rounded-full bg-amber-50 px-3 py-1.5 text-sm text-amber-950"
              >
                {step.title}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-0 bg-stone-50 p-3 shadow-none">
          <p className="text-sm text-stone-600">
            للمستخلص والبوابة: ادخل كمالك.
          </p>
        </Card>
      )}
      {(role === "owner" || role === "finance") && (
        <p className="text-xs text-stone-500">
          بوابة العميل: خروج → دخول كعميل.
        </p>
      )}
    </div>
  );
}
