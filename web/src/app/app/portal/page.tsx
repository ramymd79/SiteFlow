"use client";

import { Card, PageTitle } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { approvedQty } from "@/lib/logic";
import { useStore } from "@/lib/store";

export default function PortalPage() {
  const { state, currentUser } = useStore();
  const projectId =
    currentUser?.role === "client" ? currentUser.projectIds[0] : "p-zayed";
  const vis = state.portal[projectId];
  const project = state.projects.find((p) => p.id === projectId);
  const items = state.boq.filter((b) => b.projectId === projectId);
  const ipcs = state.clientIpcs.filter((i) => i.projectId === projectId);
  const variations = state.variations.filter(
    (v) => v.projectId === projectId && v.status === "approved",
  );
  const payments = state.clientPayments.filter((p) => p.projectId === projectId);
  const photos = state.captures.filter(
    (c) => c.projectId === projectId && c.originalFileDataUrl,
  );

  return (
    <div className="space-y-4">
      <PageTitle
        title={`بوابة العميل — ${project?.name ?? ""}`}
        hint="العميل لا يرى العهد ولا مسودات المشرف."
      />
      {vis?.showProgress ? (
        <Card>
          <h2 className="mb-2 font-medium">التقدم المعتمد</h2>
          <ul className="text-sm">
            {items.map((i) => (
              <li key={i.id}>
                {i.name}: {approvedQty(state.progress, i.id)} من {i.contractQty}{" "}
                {i.unit}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {vis?.showVariations ? (
        <Card>
          <h2 className="mb-2 font-medium">تغييرات معتمدة</h2>
          <ul className="text-sm">
            {variations.map((v) => (
              <li key={v.id}>{v.name}</li>
            ))}
          </ul>
        </Card>
      ) : null}
      {vis?.showIpcs ? (
        <Card>
          <h2 className="mb-2 font-medium">مستخلصات معتمدة</h2>
          <ul className="text-sm">
            {ipcs.map((i) => (
              <li key={i.id}>
                رقم {i.number} — {formatMoney(i.netPiasters)}
              </li>
            ))}
            {ipcs.length === 0 ? <li>لا مستخلص صادر بعد.</li> : null}
          </ul>
        </Card>
      ) : null}
      {vis?.showPayments ? (
        <Card>
          <h2 className="mb-2 font-medium">دفعات مسجّلة</h2>
          <ul className="text-sm">
            {payments.map((p) => (
              <li key={p.id}>
                {formatMoney(p.amountPiasters)} — {p.note}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {vis?.showPhotos ? (
        <Card>
          <h2 className="mb-2 font-medium">صور مسموحة</h2>
          {photos.length === 0 ? (
            <p className="text-sm">لا صور مرفوعة على هذا المشروع بعد.</p>
          ) : (
            <div className="flex gap-2">
              {photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.originalFileDataUrl}
                  alt=""
                  className="h-24 rounded"
                />
              ))}
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
