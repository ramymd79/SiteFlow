"use client";

import { Button, Card, Field, PageTitle, inputClass } from "@/components/ui";
import { formatMoney, parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { state, setPettyLimit, setPortal, resetDemo } = useStore();
  const vis = state.portal["p-zayed"];

  return (
    <div className="space-y-4">
      <PageTitle title="الإعدادات" hint="حد النثريات وظهور بوابة العميل." />
      <Card className="space-y-3">
        <Field label="حد النثريات بلا فاتورة (جنيه)">
          <input
            className={inputClass}
            defaultValue={String(state.settings.pettyLimitPiasters / 100)}
            onBlur={(e) => setPettyLimit(parseEgp(e.target.value))}
          />
        </Field>
        <p className="text-sm text-stone-500">
          الحالي: {formatMoney(state.settings.pettyLimitPiasters)} — احتجاز المستخلص{" "}
          {state.settings.retentionPct}٪
        </p>
      </Card>
      <Card className="space-y-2">
        <h2 className="font-medium">ظهور بوابة فيلا زايد</h2>
        {(
          [
            ["showProgress", "التقدم"],
            ["showPhotos", "الصور"],
            ["showIpcs", "المستخلصات"],
            ["showVariations", "التغييرات"],
            ["showPayments", "الدفعات"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(vis?.[key])}
              onChange={(e) => setPortal("p-zayed", { [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </Card>
      <Button variant="ghost" onClick={resetDemo}>
        إعادة بيانات التجربة
      </Button>
    </div>
  );
}
