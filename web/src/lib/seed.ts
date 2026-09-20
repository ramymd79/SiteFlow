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
  // من الصفر: مفيش مصروفات جاهزة. المستخدم يكتب أول حركة بنفسه.
  captures: [],
  expenses: [],
  audit: [],
  boq: [],
  progress: [],
  variations: [],
  contractAdvances: [],
  clientIpcs: [],
  subcontracts: [],
  subIpcs: [],
  clientPayments: [],
  portal: {
    "p-zayed": {
      showProgress: false,
      showPhotos: false,
      showIpcs: false,
      showVariations: false,
      showPayments: false,
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
