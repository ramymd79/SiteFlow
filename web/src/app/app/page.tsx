"use client";

import Link from "next/link";
import { Card, PageTitle } from "@/components/ui";
import { remainingOnAdvance, underReviewOnAdvance } from "@/lib/logic";
import { formatMoney } from "@/lib/money";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

type NextAction = {
  href: string;
  title: string;
  why: string;
  count?: number;
};

function actionsForRole(
  role: Role,
  counts: {
    drafts: number;
    returned: number;
    supervisor: number;
    finance: number;
  },
): NextAction[] {
  if (role === "engineer") {
    const list: NextAction[] = [
      {
        href: "/app/capture",
        title: "سجّل مصروف من الموقع",
        why: "اكتب أو صوّر، وبعدين ابعتها للمشرف.",
      },
    ];
    if (counts.drafts > 0 || counts.returned > 0) {
      list.unshift({
        href: "/app/capture",
        title: "كمّل المسودات وابعثها",
        why: "عندك حاجات لسه ما راحتش للمشرف.",
        count: counts.drafts + counts.returned,
      });
    }
    return list;
  }

  if (role === "supervisor") {
    const list: NextAction[] = [];
    if (counts.supervisor > 0) {
      list.push({
        href: "/app/review",
        title: "راجع الحركات المستنية",
        why: "صحّح لو ناقص، وابعتها للحسابات.",
        count: counts.supervisor,
      });
    }
    list.push({
      href: "/app/capture",
      title: "سجّل حركة جديدة",
      why: "لو حاجة حصلت في الموقع دلوقتي.",
    });
    return list;
  }

  if (role === "finance") {
    const list: NextAction[] = [];
    if (counts.finance > 0) {
      list.push({
        href: "/app/review",
        title: "اعتمد أو ارجع",
        why: "الاعتماد يخصم من العهدة.",
        count: counts.finance,
      });
    } else {
      list.push({
        href: "/app/review",
        title: "افتح المراجعة",
        why: "مفيش حاجة مستنية دلوقتي. راجع لو وصلت حركة جديدة.",
      });
    }
    return list;
  }

  const list: NextAction[] = [];
  if (counts.supervisor > 0) {
    list.push({
      href: "/app/review",
      title: "فيه حاجات عند المشرف",
      why: "لسه ما وصلتش للحسابات.",
      count: counts.supervisor,
    });
  }
  if (counts.finance > 0) {
    list.push({
      href: "/app/review",
      title: "فيه حاجات عند الحسابات",
      why: "مستنية اعتماد أو إرجاع.",
      count: counts.finance,
    });
  }
  if (list.length === 0) {
    list.push({
      href: "/app/capture",
      title: "سجّل مصروف جديد",
      why: "مفيش حاجة معلّقة. ابدأ حركة من الموقع.",
    });
  }
  return list;
}

export default function HomePage() {
  const { state, currentUser } = useStore();
  if (!currentUser || currentUser.role === "client") return null;

  const people = state.users.filter((u) =>
    state.advances.some((a) => a.personUserId === u.id),
  );

  const drafts = state.captures.filter(
    (c) =>
      c.createdBy === currentUser.id &&
      (c.status === "draft" || c.status === "returned"),
  ).length;
  const returned = state.captures.filter(
    (c) => c.createdBy === currentUser.id && c.status === "returned",
  ).length;
  const supervisor = state.captures.filter(
    (c) => c.status === "with_supervisor",
  ).length;
  const finance = state.captures.filter(
    (c) => c.status === "with_finance",
  ).length;

  const next = actionsForRole(currentUser.role, {
    drafts,
    returned,
    supervisor,
    finance,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <PageTitle
          title="اعمل إيه دلوقتي"
          hint="فلوس العهد: راحت فين؟ ومين مسؤول عن الخطوة الجاية؟"
        />
        <div className="space-y-3">
          {next.map((item) => (
            <Link
              key={item.href + item.title}
              href={item.href}
              className="block"
            >
              <Card className="transition hover:border-emerald-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-900">{item.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{item.why}</p>
                  </div>
                  {item.count != null && item.count > 0 ? (
                    <span className="rounded-lg bg-emerald-900 px-2.5 py-1 text-sm text-white">
                      {item.count}
                    </span>
                  ) : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <PageTitle
          title="الفلوس راحت فين"
          hint="عهد الموقع منفصلة عن فلوس العقد. المتبقي = اللي لسه مع الشخص."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {people.map((person) => {
            const list = state.advances.filter(
              (a) => a.personUserId === person.id,
            );
            const remaining = list.reduce(
              (s, a) => s + remainingOnAdvance(a, state.expenses),
              0,
            );
            return (
              <Card key={person.id}>
                <h2 className="font-medium">{person.name}</h2>
                <p className="mt-1 text-2xl">{formatMoney(remaining)}</p>
                <p className="text-xs text-stone-500">متبقي في العهد</p>
                <ul className="mt-3 space-y-1 text-sm text-stone-600">
                  {list.map((a) => (
                    <li key={a.id}>
                      {a.title}: متبقي{" "}
                      {formatMoney(remainingOnAdvance(a, state.expenses))} —
                      تحت المراجعة{" "}
                      {formatMoney(underReviewOnAdvance(state.captures, a.id))}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
          {people.length === 0 ? (
            <Card>
              <p className="text-sm text-stone-500">مفيش عهد مفتوحة.</p>
            </Card>
          ) : null}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-medium">إيه الناقص قبل الإقفال</h2>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["عند المشرف", supervisor],
              ["عند الحسابات", finance],
            ] as const
          ).map(([label, n]) => {
            const card = (
              <Card className="h-full transition hover:border-emerald-800">
                <p className="text-sm text-stone-500">{label}</p>
                <p className="text-2xl">{n}</p>
              </Card>
            );
            if (
              currentUser.role === "owner" ||
              currentUser.role === "supervisor" ||
              currentUser.role === "finance"
            ) {
              return (
                <Link key={label} href="/app/review">
                  {card}
                </Link>
              );
            }
            return <div key={label}>{card}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
