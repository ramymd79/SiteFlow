"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { newId, nowIso } from "./ids";
import { draftClientIpc, remainingOnAdvance } from "./logic";
import { seedState } from "./seed";
import {
  connectRoom,
  createRoom,
  disconnectRoom,
  getStoredRoomId,
  joinRoomWait,
  mergeRemote,
  pushRoomState,
  setStoredRoomId,
} from "./sync";
import type {
  AppState,
  Capture,
  MovementType,
  Project,
  Role,
  User,
} from "./types";

const KEY = "siteflow-demo-v7";

function loadState(): AppState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as AppState;
    const seed = seedState();
    return {
      ...seed,
      ...parsed,
      users: seed.users.map((u) => {
        const saved = parsed.users?.find((x) => x.id === u.id);
        return saved ? { ...u, projectIds: saved.projectIds } : u;
      }),
      currentUserId: parsed.currentUserId ?? null,
    };
  } catch {
    return seedState();
  }
}

type Store = {
  state: AppState;
  currentUser: User | null;
  ready: boolean;
  syncRoomId: string | null;
  syncMessage: string;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  resetDemo: () => void;
  enableSync: () => Promise<string | null>;
  joinSync: (roomId: string) => Promise<string | null>;
  leaveSync: () => void;
  addProject: (input: {
    name: string;
    location: string;
    clientName: string;
  }) => void;
  assignUserProjects: (userId: string, projectIds: string[]) => void;
  addCapture: (input: {
    projectId: string;
    originalText: string;
    amountPiasters: number;
    vendorName: string;
    description: string;
    pettyNoReceipt: boolean;
    source: Capture["source"];
    originalFileName?: string;
    originalFileDataUrl?: string;
    movementType?: MovementType;
    createdBy?: string;
    sendNow?: boolean;
  }) => string;
  updateCapture: (id: string, patch: Partial<Capture>, action: string) => void;
  sendToSupervisor: (id: string) => void;
  sendToFinance: (id: string) => string | null;
  financeDecide: (
    id: string,
    decision: "approved" | "rejected" | "returned",
    note: string,
    advanceId?: string,
  ) => string | null;
  reopenCaptureDraft: (id: string) => void;
  createAdvance: (input: {
    personUserId: string;
    projectId: string;
    title: string;
    disbursedPiasters: number;
  }) => void;
  settleAdvance: (id: string) => string | null;
  suggestAi: (id: string) => void;
  addBoq: (projectId: string, name: string, unit: string, qty: number, unitPricePiasters: number) => void;
  addProgress: (projectId: string, boqItemId: string, qty: number, note: string) => void;
  approveProgress: (id: string) => void;
  addVariation: (projectId: string, boqItemId: string, name: string, qtyDelta: number) => void;
  approveVariation: (id: string) => void;
  issueClientIpc: (projectId: string, deductionsPiasters: number) => string | null;
  issueSubIpc: (subcontractId: string, currentWorkPiasters: number) => void;
  setPortal: (projectId: string, patch: Partial<AppState["portal"][string]>) => void;
  setPettyLimit: (piasters: number) => void;
  addAudit: (action: string, entity: string, entityId: string, before: string, after: string, source: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [ready, setReady] = useState(false);
  const [syncRoomId, setSyncRoomId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState("");
  const skipPushRef = useRef(false);
  const lastRemoteAtRef = useRef("");

  useEffect(() => {
    const local = loadState();
    const room = getStoredRoomId();
    setSyncRoomId(room);
    setState(local);
    setReady(true);
    if (!room) return;

    const onRemote = (remote: AppState, updatedAt: string) => {
      if (updatedAt && updatedAt === lastRemoteAtRef.current) return;
      lastRemoteAtRef.current = updatedAt;
      skipPushRef.current = true;
      setState((prev) => mergeRemote(prev, remote, prev.currentUserId));
      setSyncMessage("اتزامنت البيانات من جهاز تاني.");
    };

    void joinRoomWait(room, onRemote).then((env) => {
      if (env?.state) {
        lastRemoteAtRef.current = env.updatedAt;
        skipPushRef.current = true;
        setState((prev) => mergeRemote(prev, env.state, prev.currentUserId));
        setSyncMessage("اتصلت بغرفة المزامنة.");
      } else {
        connectRoom(room, onRemote);
        setSyncMessage("الغرفة فاضية — هنبعت البيانات الحالية.");
        skipPushRef.current = false;
        try {
          lastRemoteAtRef.current = pushRoomState(local);
        } catch {
          setSyncMessage("المزامنة مش متاحة دلوقتي. الشغل محفوظ على الجهاز.");
        }
      }
    });

    return () => disconnectRoom();
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    if (!ready || !syncRoomId) return;
    if (skipPushRef.current) {
      skipPushRef.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      try {
        lastRemoteAtRef.current = pushRoomState(state);
      } catch {
        setSyncMessage("فشل حفظ المزامنة. هنعيد المحاولة.");
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [state, ready, syncRoomId]);

  const addAuditTo = useCallback(
    (
      prev: AppState,
      action: string,
      entity: string,
      entityId: string,
      before: string,
      after: string,
      source: string,
    ): AppState => ({
      ...prev,
      audit: [
        {
          id: newId("aud"),
          at: nowIso(),
          actorId: prev.currentUserId ?? "system",
          action,
          entity,
          entityId,
          before,
          after,
          source,
        },
        ...prev.audit,
      ],
    }),
    [],
  );

  const login = useCallback((email: string, password: string) => {
    let error: string | null = "بيانات الدخول غير صحيحة";
    setState((prev) => {
      const user = prev.users.find(
        (u) => u.email === email.trim() && u.password === password,
      );
      if (!user) return prev;
      error = null;
      return addAuditTo(
        { ...prev, currentUserId: user.id },
        "دخول",
        "user",
        user.id,
        "خارج",
        user.role,
        "web",
      );
    });
    return error;
  }, [addAuditTo]);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, currentUserId: null }));
  }, []);

  const resetDemo = useCallback(() => {
    setState((prev) => {
      const next = { ...seedState(), currentUserId: prev.currentUserId };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const enableSync = useCallback(async () => {
    try {
      const id = await createRoom(state);
      setStoredRoomId(id);
      setSyncRoomId(id);
      connectRoom(id, (remote, updatedAt) => {
        if (updatedAt && updatedAt === lastRemoteAtRef.current) return;
        lastRemoteAtRef.current = updatedAt;
        skipPushRef.current = true;
        setState((prev) => mergeRemote(prev, remote, prev.currentUserId));
      });
      lastRemoteAtRef.current = pushRoomState(state);
      setSyncMessage("اتعملت غرفة مزامنة. انسخ الرقم وادخله على الموبايل.");
      return id;
    } catch {
      setSyncMessage("تعذر إنشاء المزامنة. تأكد من الإنترنت.");
      return null;
    }
  }, [state]);

  const joinSync = useCallback(async (roomId: string) => {
    const id = roomId.trim();
    if (!id) return "اكتب رقم الغرفة";
    try {
      setStoredRoomId(id);
      setSyncRoomId(id);
      const env = await joinRoomWait(id, (remote, updatedAt) => {
        if (updatedAt && updatedAt === lastRemoteAtRef.current) return;
        lastRemoteAtRef.current = updatedAt;
        skipPushRef.current = true;
        setState((prev) => mergeRemote(prev, remote, prev.currentUserId));
      });
      if (env?.state) {
        lastRemoteAtRef.current = env.updatedAt;
        skipPushRef.current = true;
        setState((prev) => mergeRemote(prev, env.state, prev.currentUserId));
        setSyncMessage("اتصلت بنفس بيانات الغرفة.");
        return null;
      }
      lastRemoteAtRef.current = pushRoomState(state);
      setSyncMessage("الغرفة كانت فاضية — اتربطت وبعتنا البيانات.");
      return null;
    } catch {
      return "تعذر الاتصال بالغرفة";
    }
  }, [state]);

  const leaveSync = useCallback(() => {
    disconnectRoom();
    setStoredRoomId(null);
    setSyncRoomId(null);
    lastRemoteAtRef.current = "";
    setSyncMessage("المزامنة اتوقفت. البيانات لسه على الجهاز.");
  }, []);

  const addProject = useCallback(
    (input: { name: string; location: string; clientName: string }) => {
      setState((prev) => {
        const project: Project = {
          id: newId("p"),
          name: input.name.trim(),
          location: input.location.trim(),
          clientName: input.clientName.trim(),
        };
        const users = prev.users.map((u) =>
          u.role === "owner" || u.role === "finance"
            ? { ...u, projectIds: [...u.projectIds, project.id] }
            : u,
        );
        return addAuditTo(
          { ...prev, projects: [...prev.projects, project], users },
          "إضافة مشروع",
          "project",
          project.id,
          "",
          project.name,
          "owner",
        );
      });
    },
    [addAuditTo],
  );

  const assignUserProjects = useCallback((userId: string, projectIds: string[]) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, projectIds } : u,
      ),
    }));
  }, []);

  const addCapture: Store["addCapture"] = useCallback((input) => {
    const id = newId("c");
    setState((prev) => {
      const status = input.sendNow ? "with_supervisor" : "draft";
      const capture: Capture = {
        id,
        projectId: input.projectId,
        createdBy: input.createdBy ?? prev.currentUserId ?? "u-engineer",
        source: input.source,
        originalText: input.originalText,
        originalFileName: input.originalFileName,
        originalFileDataUrl: input.originalFileDataUrl,
        amountPiasters: input.amountPiasters,
        vendorName: input.vendorName,
        description: input.description || input.originalText,
        movementType: input.movementType ?? "expense",
        pettyNoReceipt: input.pettyNoReceipt,
        status,
        supervisorNote: "",
        financeNote: "",
        returnReason: "",
        createdAt: nowIso(),
      };
      let next = addAuditTo(
        { ...prev, captures: [capture, ...prev.captures] },
        "إنشاء حركة",
        "capture",
        capture.id,
        "",
        status === "draft" ? "draft" : "with_supervisor",
        input.source,
      );
      if (input.sendNow) {
        next = addAuditTo(
          next,
          "إرسال للمشرف",
          "capture",
          capture.id,
          "draft",
          "with_supervisor",
          "web",
        );
      }
      return next;
    });
    return id;
  }, [addAuditTo]);

  const updateCapture: Store["updateCapture"] = useCallback((id, patch, action) => {
    setState((prev) => {
      const current = prev.captures.find((c) => c.id === id);
      if (!current) return prev;
      const nextCaptures = prev.captures.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      );
      return addAuditTo(
        { ...prev, captures: nextCaptures },
        action,
        "capture",
        id,
        JSON.stringify({
          amount: current.amountPiasters,
          project: current.projectId,
          advance: current.advanceId,
          status: current.status,
        }),
        JSON.stringify({
          amount: patch.amountPiasters ?? current.amountPiasters,
          project: patch.projectId ?? current.projectId,
          advance: patch.advanceId ?? current.advanceId,
          status: patch.status ?? current.status,
        }),
        "web",
      );
    });
  }, [addAuditTo]);

  const sendToSupervisor = useCallback((id: string) => {
    setState((prev) => {
      const current = prev.captures.find((c) => c.id === id);
      if (!current) return prev;
      const next = prev.captures.map((c) =>
        c.id === id ? { ...c, status: "with_supervisor" as const } : c,
      );
      return addAuditTo(
        { ...prev, captures: next },
        "إرسال للمشرف",
        "capture",
        id,
        current.status,
        "with_supervisor",
        "web",
      );
    });
  }, [addAuditTo]);

  const sendToFinance = useCallback((id: string) => {
    let error: string | null = null;
    setState((prev) => {
      const current = prev.captures.find((c) => c.id === id);
      if (!current) {
        error = "الحركة غير موجودة";
        return prev;
      }
      if (!current.advanceId) {
        error = "اختار عهدة قبل الإرسال للحسابات";
        return prev;
      }
      const next = prev.captures.map((c) =>
        c.id === id ? { ...c, status: "with_finance" as const } : c,
      );
      return addAuditTo(
        { ...prev, captures: next },
        "إرسال للحسابات",
        "capture",
        id,
        current.status,
        "with_finance",
        "web",
      );
    });
    return error;
  }, [addAuditTo]);

  const financeDecide: Store["financeDecide"] = useCallback(
    (id, decision, note, advanceId) => {
      let error: string | null = null;
      setState((prev) => {
        const current = prev.captures.find((c) => c.id === id);
        if (!current) {
          error = "الحركة غير موجودة";
          return prev;
        }
        const chosenAdvance = advanceId ?? current.advanceId;
        if (current.status !== "with_finance") {
          error = "الحركة مش عند الحسابات";
          return prev;
        }
        if (
          (decision === "returned" || decision === "rejected") &&
          !note.trim()
        ) {
          error = "اكتب السبب";
          return prev;
        }
        if (decision === "approved") {
          if (!chosenAdvance) {
            error = "اختر عهدة قبل الاعتماد";
            return prev;
          }
          const advance = prev.advances.find((a) => a.id === chosenAdvance);
          if (!advance || advance.status === "settled") {
            error = "العهدة غير صالحة";
            return prev;
          }
          const remaining = remainingOnAdvance(advance, prev.expenses);
          if (current.amountPiasters > remaining) {
            error = "المبلغ أكبر من المتبقي في العهدة";
            return prev;
          }
          if (
            current.pettyNoReceipt &&
            current.amountPiasters > prev.settings.pettyLimitPiasters
          ) {
            error = "المبلغ فوق حد النثريات بلا فاتورة";
            return prev;
          }
          const expense = {
            id: newId("e"),
            captureId: id,
            advanceId: chosenAdvance,
            projectId: current.projectId,
            amountPiasters: current.amountPiasters,
            vendorName: current.vendorName,
            description: current.description,
            pettyNoReceipt: current.pettyNoReceipt,
            approvedBy: prev.currentUserId ?? "u-finance",
            approvedAt: nowIso(),
          };
          const nextCaptures = prev.captures.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: "approved" as const,
                  financeNote: note,
                  advanceId: chosenAdvance,
                }
              : c,
          );
          return addAuditTo(
            {
              ...prev,
              captures: nextCaptures,
              expenses: [expense, ...prev.expenses],
            },
            "اعتماد مصروف",
            "capture",
            id,
            current.status,
            "approved",
            "finance",
          );
        }
        const nextCaptures = prev.captures.map((c) =>
          c.id === id
            ? {
                ...c,
                status: decision,
                financeNote: note,
                returnReason: note,
              }
            : c,
        );
        return addAuditTo(
          { ...prev, captures: nextCaptures },
          decision === "rejected" ? "رفض" : "إرجاع",
          "capture",
          id,
          current.status,
          decision,
          "finance",
        );
      });
      return error;
    },
    [addAuditTo],
  );

  const reopenCaptureDraft: Store["reopenCaptureDraft"] = useCallback(
    (id) => {
      setState((prev) => {
        const current = prev.captures.find((c) => c.id === id);
        if (!current || current.status !== "rejected") return prev;
        const next = prev.captures.map((c) =>
          c.id === id ? { ...c, status: "draft" as const } : c,
        );
        return addAuditTo(
          { ...prev, captures: next },
          "إعادة فتح كمرفوض إلى مسودة",
          "capture",
          id,
          current.status,
          "draft",
          "web",
        );
      });
    },
    [addAuditTo],
  );

  const createAdvance: Store["createAdvance"] = useCallback((input) => {
    if (!input.title.trim() || input.disbursedPiasters <= 0) return;
    setState((prev) => {
      const advance = {
        id: newId("a"),
        ...input,
        title: input.title.trim(),
        status: "active" as const,
        createdAt: nowIso(),
      };
      return addAuditTo(
        { ...prev, advances: [advance, ...prev.advances] },
        "صرف عهدة",
        "advance",
        advance.id,
        "",
        String(input.disbursedPiasters),
        "finance",
      );
    });
  }, [addAuditTo]);

  const settleAdvance: Store["settleAdvance"] = useCallback((id) => {
    let error: string | null = null;
    setState((prev) => {
      const pending = prev.captures.some(
        (c) =>
          c.advanceId === id &&
          (c.status === "with_supervisor" ||
            c.status === "with_finance" ||
            c.status === "returned" ||
            c.status === "draft"),
      );
      if (pending) {
        error = "فيه حركات مفتوحة على العهدة";
        return prev;
      }
      const next = prev.advances.map((a) =>
        a.id === id ? { ...a, status: "settled" as const } : a,
      );
      return addAuditTo(
        { ...prev, advances: next },
        "تسوية عهدة",
        "advance",
        id,
        "active",
        "settled",
        "finance",
      );
    });
    return error;
  }, [addAuditTo]);

  const suggestAi = useCallback((id: string) => {
    setState((prev) => {
      const current = prev.captures.find((c) => c.id === id);
      if (!current) return prev;
      const match = current.originalText.match(/(\d+(?:\.\d+)?)/);
      const amount = match ? Math.round(Number(match[1]) * 100) : current.amountPiasters;
      const next = prev.captures.map((c) =>
        c.id === id
          ? {
              ...c,
              aiAmount: amount,
              aiVendor: current.vendorName || "مورد مقترح",
              amountPiasters: current.amountPiasters || amount,
            }
          : c,
      );
      return addAuditTo(
        { ...prev, captures: next },
        "اقتراح ذكاء",
        "capture",
        id,
        String(current.amountPiasters),
        String(amount),
        "ai",
      );
    });
  }, [addAuditTo]);

  const addBoq: Store["addBoq"] = useCallback(
    (projectId, name, unit, qty, unitPricePiasters) => {
      setState((prev) => ({
        ...prev,
        boq: [
          {
            id: newId("b"),
            projectId,
            name,
            unit,
            contractQty: qty,
            unitPricePiasters,
          },
          ...prev.boq,
        ],
      }));
    },
    [],
  );

  const addProgress: Store["addProgress"] = useCallback(
    (projectId, boqItemId, qty, note) => {
      if (!boqItemId || !Number.isFinite(qty) || qty <= 0) return;
      setState((prev) => ({
        ...prev,
        progress: [
          {
            id: newId("pr"),
            projectId,
            boqItemId,
            qty,
            note,
            status: "draft",
            createdAt: nowIso(),
          },
          ...prev.progress,
        ],
      }));
    },
    [],
  );

  const approveProgress = useCallback((id: string) => {
    setState((prev) =>
      addAuditTo(
        {
          ...prev,
          progress: prev.progress.map((p) =>
            p.id === id ? { ...p, status: "approved" as const } : p,
          ),
        },
        "اعتماد تقدم",
        "progress",
        id,
        "draft",
        "approved",
        "supervisor",
      ),
    );
  }, [addAuditTo]);

  const addVariation: Store["addVariation"] = useCallback(
    (projectId, boqItemId, name, qtyDelta) => {
      if (!boqItemId || !name.trim() || !Number.isFinite(qtyDelta)) return;
      setState((prev) => ({
        ...prev,
        variations: [
          {
            id: newId("v"),
            projectId,
            boqItemId,
            name,
            qtyDelta,
            status: "pending",
            createdAt: nowIso(),
          },
          ...prev.variations,
        ],
      }));
    },
    [],
  );

  const approveVariation = useCallback((id: string) => {
    setState((prev) =>
      addAuditTo(
        {
          ...prev,
          variations: prev.variations.map((v) =>
            v.id === id ? { ...v, status: "approved" as const } : v,
          ),
        },
        "اعتماد أمر تغيير",
        "variation",
        id,
        "pending",
        "approved",
        "owner",
      ),
    );
  }, [addAuditTo]);

  const issueClientIpc = useCallback((projectId: string, deductionsPiasters: number) => {
    let error: string | null = null;
    setState((prev) => {
      const draft = draftClientIpc(prev, projectId, deductionsPiasters);
      if (draft.current <= 0) {
        error = "مفيش عمل حالي معتمد لإصدار مستخلص";
        return prev;
      }
      const last = [...prev.clientIpcs]
        .filter((i) => i.projectId === projectId)
        .sort((a, b) => b.number - a.number)[0];
      const ipc = {
        id: newId("ipc"),
        projectId,
        number: (last?.number ?? 0) + 1,
        previousCertifiedPiasters: draft.previous,
        currentWorkPiasters: draft.current,
        retentionPiasters: draft.retention,
        deductionsPiasters,
        advanceRecoveryPiasters: draft.recovery,
        variationPiasters: draft.variation,
        netPiasters: draft.net,
        createdAt: nowIso(),
      };
      return addAuditTo(
        { ...prev, clientIpcs: [ipc, ...prev.clientIpcs] },
        "إصدار مستخلص عميل",
        "ipc",
        ipc.id,
        String(draft.previous),
        String(draft.net),
        "finance",
      );
    });
    return error;
  }, [addAuditTo]);

  const issueSubIpc = useCallback((subcontractId: string, currentWorkPiasters: number) => {
    if (!subcontractId || currentWorkPiasters <= 0) return;
    setState((prev) => {
      const last = [...prev.subIpcs]
        .filter((i) => i.subcontractId === subcontractId)
        .sort((a, b) => b.number - a.number)[0];
      const previous = last ? last.previousPiasters + last.currentWorkPiasters : 0;
      const retention = Math.round((currentWorkPiasters * prev.settings.retentionPct) / 100);
      const ipc = {
        id: newId("sipc"),
        subcontractId,
        number: (last?.number ?? 0) + 1,
        currentWorkPiasters,
        previousPiasters: previous,
        retentionPiasters: retention,
        netPiasters: currentWorkPiasters - retention,
        createdAt: nowIso(),
      };
      return addAuditTo(
        { ...prev, subIpcs: [ipc, ...prev.subIpcs] },
        "إصدار مستخلص باطن",
        "sub-ipc",
        ipc.id,
        String(previous),
        String(ipc.netPiasters),
        "finance",
      );
    });
  }, [addAuditTo]);

  const setPortal: Store["setPortal"] = useCallback((projectId, patch) => {
    setState((prev) => {
      const base = prev.portal[projectId] ?? {
        showProgress: true,
        showPhotos: true,
        showIpcs: true,
        showVariations: true,
        showPayments: true,
      };
      return {
        ...prev,
        portal: {
          ...prev.portal,
          [projectId]: { ...base, ...patch },
        },
      };
    });
  }, []);

  const setPettyLimit = useCallback((piastersValue: number) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, pettyLimitPiasters: piastersValue },
    }));
  }, []);

  const addAudit = useCallback(
    (
      action: string,
      entity: string,
      entityId: string,
      before: string,
      after: string,
      source: string,
    ) => {
      setState((prev) =>
        addAuditTo(prev, action, entity, entityId, before, after, source),
      );
    },
    [addAuditTo],
  );

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const value: Store = {
    state,
    currentUser,
    ready,
    syncRoomId,
    syncMessage,
    login,
    logout,
    resetDemo,
    enableSync,
    joinSync,
    leaveSync,
    addProject,
    assignUserProjects,
    addCapture,
    updateCapture,
    sendToSupervisor,
    sendToFinance,
    financeDecide,
    reopenCaptureDraft,
    createAdvance,
    settleAdvance,
    suggestAi,
    addBoq,
    addProgress,
    approveProgress,
    addVariation,
    approveVariation,
    issueClientIpc,
    issueSubIpc,
    setPortal,
    setPettyLimit,
    addAudit,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Store missing");
  return ctx;
}

export function can(role: Role | undefined, allowed: Role[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}
