"use client";

import { useState } from "react";
import { Button, Card, Field, PageTitle, inputClass } from "@/components/ui";
import { itemContractValue } from "@/lib/logic";
import { formatMoney, parseEgp } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function BoqPage() {
  const { state, addBoq } = useStore();
  const [projectId, setProjectId] = useState("p-zayed");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("متر");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");

  return (
    <div className="space-y-4">
      <PageTitle
        title="بنود العقد"
        hint="منفصلة عن مصروف الموقع. المستخلص بيتبني من هنا مش من العهد."
      />
      <Card>
        <form
          className="grid gap-3 md:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            addBoq(projectId, name, unit, Number(qty), parseEgp(price));
            setName("");
          }}
        >
          <Field label="المشروع">
            <select
              className={inputClass}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="البند">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="الوحدة">
            <input className={inputClass} value={unit} onChange={(e) => setUnit(e.target.value)} />
          </Field>
          <Field label="الكمية">
            <input className={inputClass} value={qty} onChange={(e) => setQty(e.target.value)} />
          </Field>
          <Field label="سعر الوحدة">
            <input className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Button type="submit">إضافة بند</Button>
        </form>
      </Card>
      <Card>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="text-right text-stone-500">
              <th className="p-2">البند</th>
              <th className="p-2">كمية</th>
              <th className="p-2">سعر</th>
              <th className="p-2">قيمة بعد التغييرات المعتمدة</th>
            </tr>
          </thead>
          <tbody>
            {state.boq
              .filter((item) => item.projectId === projectId)
              .map((item) => (
              <tr key={item.id} className="border-t border-stone-100">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.contractQty} {item.unit}</td>
                <td className="p-2">{formatMoney(item.unitPricePiasters)}</td>
                <td className="p-2">
                  {formatMoney(itemContractValue(item, state.variations))}
                </td>
              </tr>
            ))}
            {state.boq.filter((item) => item.projectId === projectId).length ===
            0 ? (
              <tr>
                <td className="p-2 text-stone-500" colSpan={4}>
                  مفيش بنود على المشروع ده. ضيف بند من الفورم فوق.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
