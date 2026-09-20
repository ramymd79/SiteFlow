"use client";

import { useState } from "react";
import { Button, Card, Field, PageTitle, inputClass, roleLabel } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ProjectsPage() {
  const { state, currentUser, addProject, assignUserProjects } = useStore();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [clientName, setClientName] = useState("");
  const [msg, setMsg] = useState("");

  if (!currentUser || currentUser.role !== "owner") {
    return (
      <Card>
        <p className="text-sm text-stone-600">
          المشاريع والأعضاء للمالك بس.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageTitle
        title="المشاريع والأعضاء"
        hint="أضف مشروعًا، وحدد مين شغّال على أي مشروع."
      />

      <Card>
        <h2 className="mb-3 font-medium">إضافة مشروع</h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addProject({ name, location, clientName });
            setName("");
            setLocation("");
            setClientName("");
            setMsg("اتضاف المشروع.");
          }}
        >
          <Field label="اسم المشروع">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field label="الموقع">
            <input
              className={inputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Field>
          <Field label="اسم العميل">
            <input
              className={inputClass}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full">
            أضف المشروع
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 font-medium">المشاريع</h2>
        <ul className="space-y-2 text-sm">
          {state.projects.map((p) => (
            <li key={p.id} className="border-b border-stone-100 pb-2">
              <p className="font-medium">{p.name}</p>
              <p className="text-stone-500">
                {p.location || "—"} · {p.clientName || "—"}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 font-medium">الأعضاء والمشاريع</h2>
        <ul className="space-y-4">
          {state.users
            .filter((u) => u.role !== "client")
            .map((u) => (
              <li key={u.id} className="space-y-2 border-b border-stone-100 pb-3">
                <p className="text-sm font-medium">
                  {u.name} — {roleLabel(u.role)}
                </p>
                <div className="flex flex-wrap gap-3">
                  {state.projects.map((p) => {
                    const checked = u.projectIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...u.projectIds, p.id]
                              : u.projectIds.filter((id) => id !== p.id);
                            assignUserProjects(u.id, next);
                            setMsg("اتحدّثت صلاحيات المشاريع.");
                          }}
                        />
                        {p.name}
                      </label>
                    );
                  })}
                </div>
              </li>
            ))}
        </ul>
      </Card>

      {msg ? (
        <p className="text-sm text-emerald-900">{msg}</p>
      ) : null}
    </div>
  );
}
