export type Role =
  | "owner"
  | "finance"
  | "supervisor"
  | "engineer"
  | "client";

export type CaptureStatus =
  | "draft"
  | "with_supervisor"
  | "with_finance"
  | "approved"
  | "rejected"
  | "returned";

export type CaptureSource = "web" | "whatsapp";
export type MovementType = "expense" | "advance_topup" | "other";
export type AdvanceStatus = "active" | "settling" | "settled";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  projectIds: string[];
};

export type Project = {
  id: string;
  name: string;
  location: string;
  clientName: string;
};

export type Capture = {
  id: string;
  projectId: string;
  createdBy: string;
  source: CaptureSource;
  originalText: string;
  originalFileName?: string;
  originalFileDataUrl?: string;
  amountPiasters: number;
  vendorName: string;
  description: string;
  movementType: MovementType;
  pettyNoReceipt: boolean;
  status: CaptureStatus;
  advanceId?: string;
  aiAmount?: number;
  aiVendor?: string;
  supervisorNote: string;
  financeNote: string;
  returnReason: string;
  createdAt: string;
};

export type Advance = {
  id: string;
  personUserId: string;
  projectId: string;
  title: string;
  disbursedPiasters: number;
  status: AdvanceStatus;
  createdAt: string;
};

export type Expense = {
  id: string;
  captureId: string;
  advanceId: string;
  projectId: string;
  amountPiasters: number;
  vendorName: string;
  description: string;
  pettyNoReceipt: boolean;
  approvedBy: string;
  approvedAt: string;
};

export type AuditEvent = {
  id: string;
  at: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  before: string;
  after: string;
  source: string;
};

export type BoqItem = {
  id: string;
  projectId: string;
  name: string;
  unit: string;
  contractQty: number;
  unitPricePiasters: number;
};

export type ProgressEntry = {
  id: string;
  projectId: string;
  boqItemId: string;
  qty: number;
  note: string;
  status: "draft" | "approved";
  createdAt: string;
};

export type Variation = {
  id: string;
  projectId: string;
  boqItemId: string;
  name: string;
  qtyDelta: number;
  status: "pending" | "approved";
  createdAt: string;
};

export type ContractAdvance = {
  id: string;
  projectId: string;
  amountPiasters: number;
};

export type ClientIpc = {
  id: string;
  projectId: string;
  number: number;
  previousCertifiedPiasters: number;
  currentWorkPiasters: number;
  retentionPiasters: number;
  deductionsPiasters: number;
  advanceRecoveryPiasters: number;
  variationPiasters: number;
  netPiasters: number;
  createdAt: string;
};

export type Subcontract = {
  id: string;
  projectId: string;
  name: string;
};

export type SubIpc = {
  id: string;
  subcontractId: string;
  number: number;
  currentWorkPiasters: number;
  previousPiasters: number;
  retentionPiasters: number;
  netPiasters: number;
  createdAt: string;
};

export type ClientPayment = {
  id: string;
  projectId: string;
  amountPiasters: number;
  note: string;
  at: string;
};

export type PortalVisibility = {
  showProgress: boolean;
  showPhotos: boolean;
  showIpcs: boolean;
  showVariations: boolean;
  showPayments: boolean;
};

export type Settings = {
  pettyLimitPiasters: number;
  retentionPct: number;
};

export type AppState = {
  users: User[];
  projects: Project[];
  captures: Capture[];
  advances: Advance[];
  expenses: Expense[];
  audit: AuditEvent[];
  boq: BoqItem[];
  progress: ProgressEntry[];
  variations: Variation[];
  contractAdvances: ContractAdvance[];
  clientIpcs: ClientIpc[];
  subcontracts: Subcontract[];
  subIpcs: SubIpc[];
  clientPayments: ClientPayment[];
  portal: Record<string, PortalVisibility>;
  settings: Settings;
  currentUserId: string | null;
};
