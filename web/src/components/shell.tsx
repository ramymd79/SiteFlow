"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { roleLabel } from "@/components/ui";
import { can, useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const LINKS: { href: string; label: string; roles: Role[] }[] = [
  {
    href: "/app",
    label: "الرئيسية",
    roles: ["owner", "finance", "supervisor", "engineer"],
  },
  {
    href: "/app/capture",
    label: "سجّل مصروف",
    roles: ["owner", "supervisor", "engineer"],
  },
  {
    href: "/app/review",
    label: "المراجعة",
    roles: ["owner", "finance", "supervisor"],
  },
];

const ALLOWED = new Set([
  "/app",
  "/app/capture",
  "/app/review",
  "/app/supervisor",
  "/app/finance",
]);

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

export function Shell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, resetDemo, ready } = useStore();
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
      router.replace("/");
      return;
    }
    if (!ALLOWED.has(pathname)) {
      router.replace("/app");
      return;
    }
    if (pathname === "/app/capture" && !can(currentUser.role, ["owner", "supervisor", "engineer"])) {
      router.replace("/app");
      return;
    }
    if (
      (pathname === "/app/review" ||
        pathname === "/app/supervisor" ||
        pathname === "/app/finance") &&
      !can(currentUser.role, ["owner", "finance", "supervisor"])
    ) {
      router.replace("/app");
      return;
    }
  }, [ready, currentUser, pathname, router]);

  if (!ready || !currentUser || currentUser.role === "client") return null;

  const links = LINKS.filter((l) => can(currentUser.role, l.roles));
  const pageTitle =
    links.find((l) => isActive(pathname, l.href))?.label ?? "SiteFlow";

  function goOut() {
    logout();
    router.replace("/");
  }

  const accountButtons = (
    <div className="space-y-2 border-t border-stone-200 p-3">
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

  return (
    <div className="min-h-dvh bg-stone-100 text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white px-4 py-3 md:hidden">
        <p className="text-xs text-stone-500">SiteFlow</p>
        <p className="truncate text-lg font-semibold">{pageTitle}</p>
        <p className="truncate text-xs text-stone-500">
          {currentUser.name} — {roleLabel(currentUser.role)}
        </p>
      </header>

      <aside className="fixed inset-y-0 right-0 z-20 hidden w-56 flex-col border-l border-stone-200 bg-white md:flex">
        <div className="border-b border-stone-200 p-4">
          <p className="text-lg font-semibold">SiteFlow</p>
          <p className="mt-1 text-xs text-stone-500">
            فلوس العهد: راحت فين؟ ومين مسؤول؟
          </p>
          <p className="mt-2 text-xs text-stone-500">
            {currentUser.name}
            <br />
            {roleLabel(currentUser.role)}
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                isActive(pathname, l.href)
                  ? "bg-emerald-900 text-white"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        {accountButtons}
      </aside>

      <main className="p-4 pb-28 md:mr-56 md:p-6 md:pb-6">{children}</main>

      <nav
        className={`fixed inset-x-0 bottom-0 z-30 grid border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden ${
          links.length === 2 ? "grid-cols-2" : "grid-cols-3"
        }`}
      >
        {links.map((l) => (
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
      </nav>
    </div>
  );
}
