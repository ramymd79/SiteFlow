import { piasters } from "./money";
import type { AppState } from "./types";

export const DEMO_PASSWORD = "demo1234";

export const seedState = (): AppState => ({
  currentUserId: null,
  settings: {
    pettyLimitPiasters: piasters(200),
    retentionPct: 5,
  },
  users: [
    {
      id: "u-owner",
      name: "صاحب الشركة",
      email: "owner@demo.siteflow",
      password: DEMO_PASSWORD,
      role: "owner",
      phone: "01000000001",
      projectIds: ["p-maadi", "p-zayed"],
    },
    {
      id: "u-finance",
      name: "سارة — الحسابات",
      email: "finance@demo.siteflow",
      password: DEMO_PASSWORD,
      role: "finance",
      phone: "01000000002",
      projectIds: ["p-maadi", "p-zayed"],
    },
    {
      id: "u-supervisor",
      name: "كريم — المشرف",
      email: "supervisor@demo.siteflow",
      password: DEMO_PASSWORD,
      role: "supervisor",
      phone: "01000000003",
      projectIds: ["p-maadi", "p-zayed"],
    },
    {
      id: "u-engineer",
      name: "أحمد — المهندس",
      email: "engineer@demo.siteflow",
      password: DEMO_PASSWORD,
      role: "engineer",
      phone: "01000000004",
      projectIds: ["p-maadi", "p-zayed"],
    },
    {
      id: "u-client",
      name: "العميل — فيلا زايد",
      email: "client@demo.siteflow",
      password: DEMO_PASSWORD,
      role: "client",
      phone: "01000000005",
      projectIds: ["p-zayed"],
    },
  ],
  projects: [
    {
      id: "p-maadi",
      name: "شقة المعادي",
      location: "المعادي، القاهرة",
      clientName: "عميل المعادي",
    },
    {
      id: "p-zayed",
      name: "فيلا الشيخ زايد",
      location: "الشيخ زايد",
      clientName: "عميل فيلا زايد",
    },
  ],
  advances: [
    {
      id: "a-maadi",
      personUserId: "u-engineer",
      projectId: "p-maadi",
      title: "عهدة تشطيب المعادي",
      disbursedPiasters: piasters(15000),
      status: "active",
      createdAt: "2026-09-01T09:00:00.000Z",
    },
    {
      id: "a-zayed",
      personUserId: "u-engineer",
      projectId: "p-zayed",
      title: "عهدة فيلا زايد",
      disbursedPiasters: piasters(8000),
      status: "active",
      createdAt: "2026-09-04T09:00:00.000Z",
    },
  ],
  // مسار العهد يبدأ فاضي من المصروفات — المستخدم يكتب أول حركة.
  captures: [],
  expenses: [],
  audit: [],
  // بذرة مسار الصورة الكبيرة: بنود + تقدم جاهز للاعتماد + بوابة مفتوحة.
  boq: [
    {
      id: "b1",
      projectId: "p-zayed",
      name: "خرسانة أساسات",
      unit: "م³",
      contractQty: 120,
      unitPricePiasters: piasters(2500),
    },
    {
      id: "b2",
      projectId: "p-zayed",
      name: "حديد تسليح",
      unit: "طن",
      contractQty: 18,
      unitPricePiasters: piasters(42000),
    },
    {
      id: "b3",
      projectId: "p-zayed",
      name: "مباني طوب",
      unit: "م²",
      contractQty: 400,
      unitPricePiasters: piasters(180),
    },
  ],
  progress: [
    {
      id: "pr1",
      projectId: "p-zayed",
      boqItemId: "b1",
      qty: 40,
      note: "دفعة أولى معتمدة",
      status: "approved",
      createdAt: "2026-09-10T09:00:00.000Z",
    },
    {
      id: "pr2",
      projectId: "p-zayed",
      boqItemId: "b1",
      qty: 20,
      note: "مستني اعتماد — جرّب تفعيله قبل المستخلص",
      status: "draft",
      createdAt: "2026-09-18T09:00:00.000Z",
    },
    {
      id: "pr3",
      projectId: "p-zayed",
      boqItemId: "b2",
      qty: 5,
      note: "حديد معتمد",
      status: "approved",
      createdAt: "2026-09-12T09:00:00.000Z",
    },
  ],
  variations: [
    {
      id: "v1",
      projectId: "p-zayed",
      boqItemId: "b3",
      name: "زيادة مساحة مباني",
      qtyDelta: 50,
      status: "pending",
      createdAt: "2026-09-08T09:00:00.000Z",
    },
  ],
  contractAdvances: [
    {
      id: "ca1",
      projectId: "p-zayed",
      amountPiasters: piasters(100000),
    },
  ],
  clientIpcs: [],
  subcontracts: [
    {
      id: "sc1",
      projectId: "p-zayed",
      name: "مقاول تشطيب باطن",
    },
  ],
  subIpcs: [],
  clientPayments: [
    {
      id: "pay1",
      projectId: "p-zayed",
      amountPiasters: piasters(150000),
      note: "دفعة مقدمة ظاهرة في البوابة",
      at: "2026-09-05T09:00:00.000Z",
    },
  ],
  portal: {
    "p-zayed": {
      showProgress: true,
      showPhotos: true,
      showIpcs: true,
      showVariations: true,
      showPayments: true,
    },
    "p-maadi": {
      showProgress: false,
      showPhotos: false,
      showIpcs: false,
      showVariations: false,
      showPayments: false,
    },
  },
});
