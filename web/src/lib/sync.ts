"use client";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { AppState } from "./types";
import { seedState } from "./seed";

const ROOM_KEY = "siteflow-sync-room-v2";
const WS = "wss://demos.yjs.dev";

export type SyncEnvelope = {
  updatedAt: string;
  companyId: string;
  state: AppState;
};

type RoomHandle = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  map: Y.Map<unknown>;
};

let handle: RoomHandle | null = null;
let applyingRemote = false;

export function getStoredRoomId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ROOM_KEY);
}

export function setStoredRoomId(roomId: string | null) {
  if (typeof window === "undefined") return;
  if (!roomId) {
    window.localStorage.removeItem(ROOM_KEY);
    return;
  }
  window.localStorage.setItem(ROOM_KEY, roomId);
}

export function newRoomId(): string {
  return `sf${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Strip heavy file payloads so the shared room stays small. */
export function forSync(state: AppState): AppState {
  return {
    ...state,
    captures: state.captures.map((c) => ({
      ...c,
      originalFileDataUrl: undefined,
    })),
    currentUserId: null,
  };
}

export function mergeRemote(
  local: AppState,
  remote: AppState,
  keepUserId: string | null,
): AppState {
  const seed = seedState();
  return {
    ...seed,
    ...remote,
    users: seed.users.map((u) => {
      const saved = remote.users?.find((x) => x.id === u.id);
      return saved ? { ...u, projectIds: saved.projectIds } : u;
    }),
    currentUserId: keepUserId,
    captures: remote.captures.map((c) => {
      const localMatch = local.captures.find((x) => x.id === c.id);
      if (localMatch?.originalFileDataUrl && !c.originalFileDataUrl) {
        return {
          ...c,
          originalFileDataUrl: localMatch.originalFileDataUrl,
          originalFileName: localMatch.originalFileName ?? c.originalFileName,
        };
      }
      return c;
    }),
  };
}

export function disconnectRoom() {
  if (!handle) return;
  handle.provider.destroy();
  handle.doc.destroy();
  handle = null;
}

export function connectRoom(
  roomId: string,
  onRemote: (state: AppState, updatedAt: string) => void,
): void {
  disconnectRoom();
  const doc = new Y.Doc();
  const provider = new WebsocketProvider(WS, `siteflow-${roomId}`, doc, {
    connect: true,
  });
  const map = doc.getMap("app");
  handle = { doc, provider, map };

  map.observe(() => {
    if (applyingRemote) return;
    const raw = map.get("state");
    const updatedAt = String(map.get("updatedAt") ?? "");
    if (typeof raw !== "string" || !raw) return;
    try {
      const state = JSON.parse(raw) as AppState;
      onRemote(state, updatedAt);
    } catch {
      // ignore bad payloads
    }
  });
}

export function pushRoomState(state: AppState): string {
  if (!handle) throw new Error("الغرفة مش متصلة");
  const updatedAt = new Date().toISOString();
  applyingRemote = true;
  handle.doc.transact(() => {
    handle!.map.set("state", JSON.stringify(forSync(state)));
    handle!.map.set("updatedAt", updatedAt);
    handle!.map.set("companyId", getStoredRoomId() ?? "");
  });
  applyingRemote = false;
  return updatedAt;
}

export async function createRoom(state: AppState): Promise<string> {
  const id = newRoomId();
  setStoredRoomId(id);
  return id;
}

export function attachRoom(
  roomId: string,
  onRemote: (state: AppState, updatedAt: string) => void,
): void {
  connectRoom(roomId, onRemote);
}

export function publishState(state: AppState): string {
  return pushRoomState(state);
}

/** Wait briefly for an existing room payload after connecting. */
export async function joinRoomWait(
  roomId: string,
  onRemote: (state: AppState, updatedAt: string) => void,
): Promise<SyncEnvelope | null> {
  return new Promise((resolve) => {
    let first: SyncEnvelope | null = null;
    connectRoom(roomId, (state, updatedAt) => {
      const env = { updatedAt, companyId: roomId, state };
      if (!first) {
        first = env;
        resolve(env);
      }
      onRemote(state, updatedAt);
    });
    window.setTimeout(() => {
      if (!first) resolve(null);
    }, 3000);
  });
}

