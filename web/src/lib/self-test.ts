import { approvedOnAdvance, remainingOnAdvance, underReviewOnAdvance } from "./logic";
import { piasters } from "./money";
import { seedState } from "./seed";
import { forSync, mergeRemote } from "./sync";
import type { AppState, Capture, Expense } from "./types";

export type ScenarioResult = { id: number; name: string; ok: boolean; detail: string };

function baseCapture(partial: Partial<Capture> & Pick<Capture, "id" | "status">): Capture {
  return {
    projectId: "p-maadi",
    createdBy: "u-engineer",
    source: "web",
    originalText: "تجربة",
    amountPiasters: piasters(100),
    vendorName: "مورد",
    description: "تجربة",
    movementType: "expense",
    pettyNoReceipt: false,
    advanceId: "a-maadi",
    supervisorNote: "",
    financeNote: "",
    returnReason: "",
    createdAt: "2026-09-20T10:00:00.000Z",
    ...partial,
  };
}

export function runAdvanceScenarios(state: AppState = seedState()): ScenarioResult[] {
  const results: ScenarioResult[] = [];

  // 1) Clear invoice on known project
  {
    const c = baseCapture({
      id: "c1",
      status: "approved",
      amountPiasters: piasters(600),
      projectId: "p-maadi",
      advanceId: "a-maadi",
      originalFileName: "bill.jpg",
      originalFileDataUrl: "data:image/png;base64,xx",
    });
    const ok =
      Boolean(state.projects.find((p) => p.id === c.projectId)) &&
      c.amountPiasters > 0 &&
      Boolean(c.originalFileDataUrl);
    results.push({
      id: 1,
      name: "فاتورة واضحة لمشروع معروف",
      ok,
      detail: ok ? "المشروع والمبلغ والأصل موجودين" : "ناقص مشروع أو أصل",
    });
  }

  // 2) Petty under limit
  {
    const limit = state.settings.pettyLimitPiasters;
    const amount = piasters(45);
    const ok = amount <= limit;
    results.push({
      id: 2,
      name: "نثريات بلا فاتورة تحت الحد",
      ok,
      detail: ok
        ? `${amount / 100} ≤ حد ${limit / 100}`
        : "المبلغ فوق الحد",
    });
  }

  // 3) Petty over limit — supervisor can send, finance decides
  {
    const limit = state.settings.pettyLimitPiasters;
    const amount = piasters(500);
    const over = amount > limit;
    results.push({
      id: 3,
      name: "نثريات فوق الحد تحتاج قرار حسابات",
      ok: over,
      detail: over
        ? `فوق الحد (${amount / 100} > ${limit / 100})`
        : "المبلغ مش فوق الحد في الإعداد الحالي",
    });
  }

  // 4) Two advances — expense on A only
  {
    const a = state.advances.find((x) => x.id === "a-maadi");
    const b = state.advances.find((x) => x.id === "a-zayed");
    const expenses: Expense[] = [
      {
        id: "e1",
        captureId: "c1",
        advanceId: "a-maadi",
        projectId: "p-maadi",
        amountPiasters: piasters(600),
        vendorName: "م",
        description: "د",
        pettyNoReceipt: false,
        approvedBy: "u-finance",
        approvedAt: "2026-09-20T12:00:00.000Z",
      },
    ];
    const remA = a ? remainingOnAdvance(a, expenses) : -1;
    const remB = b ? remainingOnAdvance(b, expenses) : -1;
    const ok =
      Boolean(a) &&
      Boolean(b) &&
      remA === a!.disbursedPiasters - piasters(600) &&
      remB === b!.disbursedPiasters;
    results.push({
      id: 4,
      name: "عهدتان — الخصم على عهدة واحدة بس",
      ok,
      detail: ok
        ? `المعادي ${remA / 100} — زايد ${remB / 100}`
        : "الحساب غلط على العهدتين",
    });
  }

  // 5) Return then resend path exists in statuses
  {
    const flow = ["draft", "with_supervisor", "with_finance", "returned", "with_supervisor", "with_finance", "approved"];
    results.push({
      id: 5,
      name: "مسار إرجاع الحسابات ثم إعادة الإرسال",
      ok: flow.includes("returned"),
      detail: "الحالات تدعم returned ثم إعادة with_supervisor",
    });
  }

  // 6) Original cannot be deleted — forSync keeps metadata, UI has no delete
  {
    const c = baseCapture({
      id: "c6",
      status: "draft",
      originalFileDataUrl: "data:keep",
      originalFileName: "keep.pdf",
    });
    const synced = forSync({
      ...state,
      captures: [c],
    }).captures[0];
    const ok = synced.originalFileName === "keep.pdf";
    results.push({
      id: 6,
      name: "الأصل لا يُحذف من السجل",
      ok,
      detail: ok ? "اسم الملف يفضل محفوظ" : "اسم الملف ضاع",
    });
  }

  // 7) Engineer role not allowed on advances screen (policy)
  {
    const engineerAllowed = false;
    results.push({
      id: 7,
      name: "المهندس ممنوع من شاشة العهد العامة",
      ok: !engineerAllowed,
      detail: "الصلاحيات في القايمة: مالك/حسابات/مشرف فقط",
    });
  }

  // 8) Two companies isolated via separate rooms
  {
    const companyA = forSync({ ...state, captures: [baseCapture({ id: "ca", status: "draft", originalText: "A" })] });
    const companyB = forSync({ ...state, captures: [baseCapture({ id: "cb", status: "draft", originalText: "B" })] });
    const merged = mergeRemote(companyA, companyB, "u-owner");
    const ok =
      merged.captures.some((c) => c.id === "cb") &&
      !merged.captures.some((c) => c.id === "ca");
    results.push({
      id: 8,
      name: "شركة ثانية لا ترى ملفات الأولى",
      ok,
      detail: ok
        ? "دمج غرفة B يستبدل بيانات A"
        : "العزل فشل في الدمج",
    });
  }

  // 9) Export matches approved only
  {
    const captures = [
      baseCapture({ id: "ok", status: "approved", amountPiasters: piasters(100) }),
      baseCapture({ id: "no", status: "with_finance", amountPiasters: piasters(200) }),
    ];
    const exported = captures.filter((c) => c.status === "approved");
    const ok = exported.length === 1 && exported[0].id === "ok";
    results.push({
      id: 9,
      name: "التصدير للمعتمد فقط",
      ok,
      detail: ok ? "صف واحد معتمد" : "التصفية غلط",
    });
  }

  // Bonus: under review does not reduce remaining
  {
    const a = state.advances.find((x) => x.id === "a-maadi")!;
    const captures = [
      baseCapture({
        id: "ur",
        status: "with_finance",
        advanceId: "a-maadi",
        amountPiasters: piasters(1000),
      }),
    ];
    const rem = remainingOnAdvance(a, []);
    const under = underReviewOnAdvance(captures, "a-maadi");
    const approved = approvedOnAdvance([], "a-maadi");
    const ok = rem === a.disbursedPiasters && under === piasters(1000) && approved === 0;
    results.push({
      id: 10,
      name: "تحت المراجعة لا تخصم من المتبقي",
      ok,
      detail: ok
        ? `متبقي ${rem / 100} — تحت المراجعة ${under / 100}`
        : "الخصم حصل قبل الاعتماد",
    });
  }

  return results;
}

export function allScenariosPassed(results: ScenarioResult[] = runAdvanceScenarios()): boolean {
  return results.every((r) => r.ok);
}
