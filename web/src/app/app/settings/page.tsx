"use client";

import { useState } from "react";
import { Button, Card, Field, PageTitle, inputClass } from "@/components/ui";
import { formatMoney, parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

const PORTAL_FLAGS = [
  ["showProgress", "إظهار التقدم"],
  ["showPhotos", "إظهار الصور"],
  ["showIpcs", "إظهار المستخلصات"],
  ["showVariations", "إظهار التغييرات"],
  ["showPayments", "إظهار الدفعات"],
] as const;

export default function SettingsPage() {
  const {
    state,
    setPettyLimit,
    setPortal,
    resetDemo,
    syncRoomId,
    syncMessage,
    enableSync,
    joinSync,
    leaveSync,
  } = useStore();
  const [roomInput, setRoomInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [localMsg, setLocalMsg] = useState("");
  const [portalProjectId, setPortalProjectId] = useState("p-zayed");
  const portal = state.portal[portalProjectId] ?? {
    showProgress: false,
    showPhotos: false,
    showIpcs: false,
    showVariations: false,
    showPayments: false,
  };

  return (
    <div className="space-y-4">
      <PageTitle
        title="الإعدادات"
        hint="حد النثريات، بوابة العميل، ومزامنة اللابتوب مع الموبايل."
      />
      <Card className="space-y-3">
        <Field label="حد النثريات بلا فاتورة (جنيه)">
          <input
            className={inputClass}
            defaultValue={String(state.settings.pettyLimitPiasters / 100)}
            onBlur={(e) => setPettyLimit(parseEgp(e.target.value))}
          />
        </Field>
        <p className="text-sm text-stone-500">
          الحالي: {formatMoney(state.settings.pettyLimitPiasters)}
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-medium">بوابة العميل — للتجربة</h2>
        <p className="text-sm text-stone-600">
          اختار إيه يظهر للعميل في جولة الصورة الكبيرة.
        </p>
        <Field label="المشروع">
          <select
            className={inputClass}
            value={portalProjectId}
            onChange={(e) => setPortalProjectId(e.target.value)}
          >
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="space-y-2">
          {PORTAL_FLAGS.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={portal[key]}
                onChange={(e) =>
                  setPortal(portalProjectId, { [key]: e.target.checked })
                }
              />
              {label}
            </label>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-medium">مزامنة بين الأجهزة</h2>
        <p className="text-sm text-stone-600">
          عشان اللابتوب والموبايل يشوفوا نفس الأرقام: فعّل غرفة من جهاز، وانسخ
          الرقم للجهاز التاني.
        </p>
        {syncRoomId ? (
          <div className="space-y-2">
            <p className="break-all rounded-lg bg-stone-50 px-3 py-2 text-sm">
              رقم الغرفة: {syncRoomId}
            </p>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                void navigator.clipboard?.writeText(syncRoomId);
                setLocalMsg("اتنسخ رقم الغرفة.");
              }}
            >
              انسخ رقم الغرفة
            </Button>
            <Button variant="ghost" className="w-full" onClick={leaveSync}>
              أوقف المزامنة على الجهاز ده
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              className="w-full"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await enableSync();
                setBusy(false);
              }}
            >
              فعّل غرفة مزامنة جديدة
            </Button>
            <Field label="أو ادخل رقم غرفة موجودة">
              <input
                className={inputClass}
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="الصق رقم الغرفة هنا"
              />
            </Field>
            <Button
              variant="ghost"
              className="w-full"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const err = await joinSync(roomInput);
                setLocalMsg(err ?? "تمام.");
                setBusy(false);
              }}
            >
              ادخل الغرفة
            </Button>
          </div>
        )}
        {syncMessage || localMsg ? (
          <p className="text-sm text-emerald-900">{localMsg || syncMessage}</p>
        ) : null}
      </Card>

      <Button variant="ghost" onClick={resetDemo}>
        ابدأ من الصفر
      </Button>
    </div>
  );
}
