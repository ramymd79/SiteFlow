import type {
  Advance,
  AppState,
  BoqItem,
  Capture,
  ClientIpc,
  Expense,
  ProgressEntry,
  Variation,
} from "./types";

export function approvedOnAdvance(
  expenses: Expense[],
  advanceId: string,
): number {
  return expenses
    .filter((e) => e.advanceId === advanceId)
    .reduce((sum, e) => sum + e.amountPiasters, 0);
}

export function underReviewOnAdvance(
  captures: Capture[],
  advanceId: string,
): number {
  return captures
    .filter(
      (c) =>
        c.advanceId === advanceId &&
        (c.status === "with_supervisor" ||
          c.status === "with_finance" ||
          c.status === "returned" ||
          c.status === "draft"),
    )
    .reduce((sum, c) => sum + c.amountPiasters, 0);
}

export function remainingOnAdvance(
  advance: Advance,
  expenses: Expense[],
): number {
  return advance.disbursedPiasters - approvedOnAdvance(expenses, advance.id);
}

export function personOpenAdvances(
  state: AppState,
  personUserId: string,
): Advance[] {
  return state.advances.filter(
    (a) => a.personUserId === personUserId && a.status !== "settled",
  );
}

export function approvedQty(
  progress: ProgressEntry[],
  boqItemId: string,
): number {
  return progress
    .filter((p) => p.boqItemId === boqItemId && p.status === "approved")
    .reduce((sum, p) => sum + p.qty, 0);
}

export function approvedQtyDelta(
  variations: Variation[],
  boqItemId: string,
): number {
  return variations
    .filter((v) => v.boqItemId === boqItemId && v.status === "approved")
    .reduce((sum, v) => sum + v.qtyDelta, 0);
}

export function itemContractValue(item: BoqItem, variations: Variation[]): number {
  const qty = item.contractQty + approvedQtyDelta(variations, item.id);
  return Math.round(qty * item.unitPricePiasters);
}

export function itemCertifiedValue(
  item: BoqItem,
  progress: ProgressEntry[],
  variations: Variation[],
): number {
  const qty =
    item.contractQty + approvedQtyDelta(variations, item.id);
  const done = Math.min(approvedQty(progress, item.id), qty);
  return Math.round(done * item.unitPricePiasters);
}

export function projectCertifiedToDate(
  state: AppState,
  projectId: string,
): number {
  const items = state.boq.filter((b) => b.projectId === projectId);
  return items.reduce(
    (sum, item) =>
      sum + itemCertifiedValue(item, state.progress, state.variations),
    0,
  );
}

export function lastIpc(state: AppState, projectId: string): ClientIpc | undefined {
  return [...state.clientIpcs]
    .filter((i) => i.projectId === projectId)
    .sort((a, b) => b.number - a.number)[0];
}

export function draftClientIpc(
  state: AppState,
  projectId: string,
  deductionsPiasters: number,
) {
  const last = lastIpc(state, projectId);
  const previous = last
    ? last.previousCertifiedPiasters + last.currentWorkPiasters
    : 0;
  const certified = projectCertifiedToDate(state, projectId);
  const current = Math.max(0, certified - previous);
  const retention = Math.round((current * state.settings.retentionPct) / 100);
  const variation = state.boq
    .filter((b) => b.projectId === projectId)
    .reduce((sum, item) => {
      const extra = approvedQtyDelta(state.variations, item.id);
      return sum + Math.round(extra * item.unitPricePiasters);
    }, 0);
  const totalAdvance = state.contractAdvances
    .filter((c) => c.projectId === projectId)
    .reduce((s, c) => s + c.amountPiasters, 0);
  const recovered = state.clientIpcs
    .filter((i) => i.projectId === projectId)
    .reduce((s, i) => s + i.advanceRecoveryPiasters, 0);
  const remainingAdvance = Math.max(0, totalAdvance - recovered);
  const installment = Math.round(totalAdvance * 0.1);
  const recovery =
    current > 0 ? Math.min(installment, remainingAdvance) : 0;
  const net = current - retention - deductionsPiasters - recovery;
  return { previous, current, retention, recovery, variation, net };
}
