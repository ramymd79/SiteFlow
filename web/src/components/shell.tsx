"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { roleLabel } from "@/components/ui";
import { can, useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

type NavLink = {
  href: string;
  label: string;
  roles: Role[];
  group: "core" | "tour";
};

const LINKS: NavLink[] = [
  {
    href: "/app",
    label: "الرئيسية",
    roles: ["owner", "finance", "supervisor", "engineer"],
    group: "core",
  },
  {
    href: "/app/capture",
    label: "سجّل مصروف",
    roles: ["owner", "supervisor", "engineer"],
    group: "core",
  },
  {
    href: "/app/review",
    label: "المراجعة",
    roles: ["owner", "finance", "supervisor"],
    group: "core",
  },
  {
    href: "/app/advances",
    label: "العهد",
    roles: ["owner", "finance", "supervisor"],
    group: "core",
  },
  {
    href: "/app/close",
    label: "النواقص",
    roles: ["owner", "finance", "supervisor"],
    group: "core",
  },
  {
    href: "/app/export",
    label: "تصدير",
    roles: ["owner", "finance"],
    group: "core",
  },
  {
    href: "/app/audit",
    label: "التدقيق",
    roles: ["owner", "finance"],
    group: "core",
  },
  {
    href: "/app/projects",
    label: "المشاريع",
    roles: ["owner"],
    group: "core",
  },
  {
    href: "/app/settings",
    label: "إعدادات",
    roles: ["owner"],
    group: "core",
  },
  {
    href: "/app/boq",
    label: "بنود العقد",
    roles: ["owner", "finance", "supervisor"],
    group: "tour",
  },
  {
    href: "/app/progress",
    label: "التقدم",
    roles: ["owner", "finance", "supervisor"],
    group: "tour",
  },
  {
    href: "/app/variations",
    label: "أوامر التغيير",
    roles: ["owner", "finance", "supervisor"],
    group: "tour",
  },
  {
    href: "/app/ipc",
    label: "مستخلص عميل",
    roles: ["owner", "finance"],
    group: "tour",
  },
  {
    href: "/app/sub-ipc",
    label: "مستخلص باطن",
    roles: ["owner", "finance"],
    group: "tour",
  },
  {
    href: "/app/portal",
    label: "بوابة العميل",
    roles: ["owner", "finance", "client"],
    group: "tour",
  },
  {
    href: "/app/whatsapp",
    label: "واتساب تجريبي",
    roles: ["owner", "supervisor", "engineer"],
    group: "tour",
  },
  {
    href: "/app/check",
    label: "فحص",
    roles: ["owner", "finance"],
    group: "core",
  },
];

const ALLOWED = new Set(
  LINKS.map((l) => l.href).concat(["/app/supervisor", "/app/finance"]),
);

function normalizePath(path: string): string {
  let value = path;
  if (value.startsWith("/SiteFlow")) {
    value = value.slice("/SiteFlow".length) || "/";
  }
  if (value.length > 1 && value.endsWith("/")) value = value.slice(0, -1);
  return value;
}

function isActive(pathname: string, href: string): boolean {
  const path = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === "/app/review") {
    return (
      path === "/app/review" ||
      path === "/app/supervisor" ||
      path === "/app/finance"
    );
  }
  return path === target;
}

function linkClass(active: boolean): string {
  return `block rounded-lg px-3 py-2 text-sm ${
    active
      ? "bg-emerald-900 text-white"
      : "text-stone-700 hover:bg-stone-100"
  }`;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, resetDemo, ready, syncRoomId } = useStore();
  const rawPath = usePathname();
  const pathname = normalizePath(rawPath);
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      router.replace("/");
      return;
    }
    if (currentUser.role === "client") {
      if (pathname !== "/app/portal") {
        router.replace("/app/portal");
      }
      return;
    }
    if (!ALLOWED.has(pathname)) {
      router.replace("/app");
      return;
    }
    const link = LINKS.find((l) => l.href === pathname);
    if (link && !can(currentUser.role, link.roles)) {
      router.replace("/app");
    }
  }, [ready, currentUser, pathname, router]);

  if (!ready || !currentUser) return null;

  function goOut() {
    logout();
    router.replace("/");
  }

  if (currentUser.role === "client") {
    return (
      <div className="min-h-dvh bg-stone-100 text-stone-900">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
          <div>
            <p className="text-xs text-stone-500">SiteFlow</p>
            <p className="font-semibold">بوابة العميل</p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-medium text-white"
            onClick={goOut}
          >
            خروج
          </button>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    );
  }

  const coreLinks = LINKS.filter(
    (l) => l.group === "core" && can(currentUser.role, l.roles),
  );
  const tourLinks = LINKS.filter(
    (l) => l.group === "tour" && can(currentUser.role, l.roles),
  );
  const allVisible = [...coreLinks, ...tourLinks];
  const pageTitle =
    allVisible.find((l) => isActive(pathname, l.href))?.label ?? "SiteFlow";

  const accountButtons = (
    <div className="space-y-2 border-t border-stone-200 p-3">
      {syncRoomId ? (
        <p className="px-1 text-xs text-stone-500">
          مزامنة: {syncRoomId.slice(0, 8)}…
        </p>
      ) : null}
      {currentUser.role === "owner" ? (
        <button
          type="button"
          className="w-full rounded-lg bg-stone-100 px-3 py-3 text-sm"
          onClick={() => resetDemo()}
        >
          ابدأ من الصفر
        </button>
      ) : null}
      <button
        type="button"
        className="w-full rounded-lg bg-stone-900 px-3 py-3 text-sm font-medium text-white"
        onClick={goOut}
      >
        خروج
      </button>
    </div>
  );

  const primaryLinks = coreLinks.filter((l) =>
    ["/app", "/app/capture", "/app/review"].includes(l.href),
  );
  const moreLinks = allVisible.filter(
    (l) => !["/app", "/app/capture", "/app/review"].includes(l.href),
  );

  return (
    <div className="min-h-dvh bg-stone-100 text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-stone-500">SiteFlow</p>
            <p className="truncate text-lg font-semibold">{pageTitle}</p>
            <p className="truncate text-xs text-stone-500">
              {currentUser.name} — {roleLabel(currentUser.role)}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            {currentUser.role === "owner" ? (
              <button
                type="button"
                className="rounded-lg bg-stone-100 px-3 py-2 text-xs font-medium text-stone-800"
                onClick={() => resetDemo()}
              >
                من الصفر
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-medium text-white"
              onClick={goOut}
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 right-0 z-20 hidden w-60 flex-col border-l border-stone-200 bg-white md:flex">
        <div className="border-b border-stone-200 p-4">
          <p className="text-lg font-semibold">SiteFlow</p>
          <p className="mt-1 text-xs text-stone-500">
            لب المنتج: فلوس العهد. باقي الشاشات جولة تجربة.
          </p>
          <p className="mt-2 text-xs text-stone-500">
            {currentUser.name}
            <br />
            {roleLabel(currentUser.role)}
          </p>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto p-2">
          <div className="space-y-1">
            <p className="px-3 text-xs font-medium text-stone-500">
              لب المنتج — العهد
            </p>
            {coreLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={linkClass(isActive(pathname, l.href))}
              >
                {l.label}
              </Link>
            ))}
          </div>
          {tourLinks.length > 0 ? (
            <div className="space-y-1 border-t border-stone-200 pt-3">
              <p className="px-3 text-xs font-medium text-amber-800">
                باقي الصورة الكبيرة — للتجربة
              </p>
              {tourLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={linkClass(isActive(pathname, l.href))}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ) : null}
        </nav>
        {accountButtons}
      </aside>

      <main className="p-4 pb-28 md:mr-60 md:p-6 md:pb-6">{children}</main>

      <nav
        className={`fixed inset-x-0 bottom-0 z-30 grid border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden ${
          primaryLinks.length + (moreLinks.length > 0 ? 1 : 0) >= 4
            ? "grid-cols-4"
            : "grid-cols-3"
        }`}
      >
        {primaryLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`min-h-14 px-1 py-2 text-center text-xs leading-tight ${
              isActive(pathname, l.href)
                ? "font-semibold text-emerald-900"
                : "text-stone-600"
            }`}
          >
            {l.label}
          </Link>
        ))}
        {moreLinks.length > 0 ? (
          <details className="relative min-h-14">
            <summary
              className={`flex h-full cursor-pointer list-none items-center justify-center px-1 py-2 text-center text-xs leading-tight text-stone-600 [&::-webkit-details-marker]:hidden ${
                moreLinks.some((l) => isActive(pathname, l.href))
                  ? "font-semibold text-emerald-900"
                  : ""
              }`}
            >
              المزيد
            </summary>
            <div className="absolute bottom-full left-0 right-0 mb-1 max-h-[70vh] overflow-y-auto rounded-t-xl border border-stone-200 bg-white p-2 shadow-lg">
              <p className="px-3 py-1 text-xs font-medium text-stone-500">
                لب العهد
              </p>
              {moreLinks
                .filter((l) => l.group === "core")
                .map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block rounded-lg px-3 py-3 text-sm ${
                      isActive(pathname, l.href)
                        ? "bg-emerald-50 font-medium text-emerald-950"
                        : "text-stone-700"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              <p className="mt-2 px-3 py-1 text-xs font-medium text-amber-800">
                جولة الصورة الكبيرة
              </p>
              {moreLinks
                .filter((l) => l.group === "tour")
                .map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block rounded-lg px-3 py-3 text-sm ${
                      isActive(pathname, l.href)
                        ? "bg-amber-50 font-medium text-amber-950"
                        : "text-stone-700"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
            </div>
          </details>
        ) : null}
      </nav>
    </div>
  );
}
