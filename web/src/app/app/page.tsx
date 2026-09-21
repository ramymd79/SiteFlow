"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { TourPathsCard } from "@/components/tour-paths";
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

function primaryAction(
  role: Role,
  counts: {
    drafts: number;
    returned: number;
    supervisor: number;
    finance: number;
  },
): NextAction {
  if (role === "engineer") {
    if (counts.drafts > 0 || counts.returned > 0) {
      return {
        href: "/app/capture",
        title: "كمّل وابعث للمشرف",
        why: "عندك مسودات لسه ما راحتش.",
        count: counts.drafts + counts.returned,
      };
    }
    return {
      href: "/app/capture",
      title: "سجّل مصروف",
      why: "اكتب المبلغ وإيه اللي حصل.",
    };
  }

  if (role === "supervisor") {
    if (counts.supervisor > 0) {
      return {
        href: "/app/review",
        title: "راجع الحركات",
        why: "صحّح وابعث للحسابات.",
        count: counts.supervisor,
      };
    }
    return {
      href: "/app/capture",
      title: "سجّل مصروف",
      why: "مفيش حاجة مستنية مراجعة دلوقتي.",
    };
  }

  if (role === "finance") {
    if (counts.finance > 0) {
      return {
        href: "/app/review",
        title: "اعتمد أو ارجع",
        why: "الاعتماد يخصم من العهدة.",
        count: counts.finance,
      };
    }
    return {
      href: "/app/advances",
      title: "شوف العهد",
      why: "مفيش حركات مستنية اعتماد.",
    };
  }

  if (counts.finance > 0) {
    return {
      href: "/app/review",
      title: "فيه حاجات عند الحسابات",
      why: "مستنية اعتماد.",
      count: counts.finance,
    };
  }
  if (counts.supervisor > 0) {
    return {
      href: "/app/review",
      title: "فيه حاجات عند المشرف",
      why: "لسه ما وصلتش للحسابات.",
      count: counts.supervisor,
    };
  }
  return {
    href: "/app/advances",
    title: "شوف فلوس العهد",
    why: "مفيش حاجة معلّقة دلوقتي.",
  };
}

export default function HomePage() {
  const { state, currentUser } = useStore();
  if (!currentUser || currentUser.role === "client") return null;

  const people = state.users.filter((u) => {
    if (!state.advances.some((a) => a.personUserId === u.id)) return false;
    if (currentUser.role === "engineer") return u.id === currentUser.id;
    return true;
  });

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

  const next = primaryAction(currentUser.role, {
    drafts,
    returned,
    supervisor,
    finance,
  });

  const totalRemaining = people.reduce((sum, person) => {
    return (
      sum +
      state.advances
        .filter((a) => a.personUserId === person.id)
        .reduce((s, a) => s + remainingOnAdvance(a, state.expenses), 0)
    );
  }, 0);

  const showTour =
    currentUser.role === "owner" ||
    currentUser.role === "finance" ||
    currentUser.role === "supervisor";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-sm text-stone-500">اعمل إيه دلوقتي</p>
        <Link
          href={next.href}
          className="mt-2 flex min-h-24 items-center justify-between gap-3 rounded-2xl bg-emerald-900 px-5 py-5 text-white shadow-sm transition hover:bg-emerald-800"
        >
          <div className="min-w-0">
            <p className="text-xl font-semibold leading-snug">{next.title}</p>
            <p className="mt-1 text-sm text-emerald-100">{next.why}</p>
          </div>
          {next.count != null && next.count > 0 ? (
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-lg font-semibold text-emerald-950">
              {next.count}
            </span>
          ) : (
            <span className="shrink-0 text-2xl text-emerald-200" aria-hidden>
              ←
            </span>
          )}
        </Link>
      </div>

      <Card>
        <p className="text-sm text-stone-500">
          {currentUser.role === "engineer" ? "متبقي في عهدك" : "متبقي في العهد"}
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
          {formatMoney(totalRemaining)}
        </p>
        <ul className="mt-4 space-y-2 border-t border-stone-100 pt-3 text-sm text-stone-600">
          {people.flatMap((person) =>
            state.advances
              .filter((a) => a.personUserId === person.id)
              .map((a) => (
                <li key={a.id} className="flex justify-between gap-2">
                  <span className="truncate">
                    {currentUser.role === "engineer" ? a.title : person.name}
                  </span>
                  <span className="shrink-0 font-medium text-stone-800">
                    {formatMoney(remainingOnAdvance(a, state.expenses))}
                  </span>
                </li>
              )),
          )}
          {people.length === 0 ? (
            <li className="text-stone-500">مفيش عهد مفتوحة.</li>
          ) : null}
        </ul>
        {(supervisor > 0 || finance > 0) &&
        currentUser.role !== "engineer" ? (
          <p className="mt-3 text-xs text-stone-500">
            تحت المراجعة:{" "}
            {formatMoney(
              people.reduce(
                (s, person) =>
                  s +
                  state.advances
                    .filter((a) => a.personUserId === person.id)
                    .reduce(
                      (x, a) =>
                        x + underReviewOnAdvance(state.captures, a.id),
                      0,
                    ),
                0,
              ),
            )}
          </p>
        ) : null}
      </Card>

      {showTour ? (
        <details className="rounded-xl border border-stone-200 bg-white">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm text-stone-600 [&::-webkit-details-marker]:hidden">
            جولة أوسع — بنود ومستخلص وبوابة
          </summary>
          <div className="border-t border-stone-100 px-2 pb-3 pt-1">
            <TourPathsCard />
          </div>
        </details>
      ) : null}
    </div>
  );
}
