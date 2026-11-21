import type { CharacterDTO, WorldBookDTO, WorldBookEntryCreateDTO } from "lumiverse-spindle-types";

export type RequiredPermission = "characters" | "world_books" | "chats";

export const REQUIRED_PERMISSIONS: readonly RequiredPermission[] = [
  "characters",
  "world_books",
  "chats",
];

export interface PermissionStatus {
  characters: boolean;
  world_books: boolean;
  chats: boolean;
  allGranted: boolean;
  missing: RequiredPermission[];
}

export interface WorldBookSummary {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}

export interface NormalizedEmbeddedEntry extends WorldBookEntryCreateDTO {
  key: string[];
  keysecondary: string[];
  content: string;
  comment: string;
  position: number;
  depth: number;
  order_value: number;
  selective: boolean;
  constant: boolean;
  disabled: boolean;
  group_name: string;
  group_override: boolean;
  group_weight: number;
  probability: number;
  case_sensitive: boolean;
  match_whole_words: boolean;
  use_regex: boolean;
  prevent_recursion: boolean;
  exclude_recursion: boolean;
  delay_until_recursion: boolean;
  priority: number;
  sticky: number;
  cooldown: number;
  delay: number;
  selective_logic: number;
  use_probability: boolean;
  vectorized: boolean;
  extensions: Record<string, unknown>;
}

export type EmbeddedBookStatus = "linked" | "imported_unlinked" | "embedded_only";

export interface EmbeddedBookInfo {
  name: string;
  description: string;
  entryCount: number;
  entries: NormalizedEmbeddedEntry[];
  status: EmbeddedBookStatus;
  linkedBookId: string | null;
  linkedBookName: string | null;
  importedBookId: string | null;
  importedBookName: string | null;
}

export interface AttachedWorldBookPill {
  id: string;
  name: string;
  missing: boolean;
  isEmbeddedSource: boolean;
}

export interface CharacterLorebookMemberState {
  characterId: string;
  characterName: string;
  avatarUrl: string | null;
  isActiveSpeaker: boolean;
  isMuted: boolean;
  isLoreActiveInGroup: boolean;
  attachedBookIds: string[];
  attachedBooks: AttachedWorldBookPill[];
  embeddedBook: EmbeddedBookInfo | null;
}

export type GroupCardMode = "swap" | "merge_ignore_muted" | "merge";
export type GroupLorebookMode = "follow_card_mode" | "active_character" | "all_unmuted" | "all";
export type EffectiveGroupLorebookMode = "active_character" | "all_unmuted" | "all";

export interface GroupChatInfo {
  isGroup: boolean;
  groupCardMode: GroupCardMode;
  groupLorebookMode: GroupLorebookMode;
  effectiveLorebookMode: EffectiveGroupLorebookMode;
}

export interface CharacterLorebooksState {
  source: "backend" | "frontend_fallback";
  permissions: PermissionStatus;
  chatId: string | null;
  activeCharacterId: string | null;
  group: GroupChatInfo | null;
  members: CharacterLorebookMemberState[];
  availableWorldBooks: WorldBookSummary[];
  error?: string | null;
}

export type FrontendToBackendMessage =
  | {
      type: "get_state";
      requestId?: string;
      chatId?: string | null;
      characterId?: string | null;
    }
  | {
      type: "attach_book";
      requestId?: string;
      characterId: string;
      worldBookId: string;
      chatId?: string | null;
      activeCharacterId?: string | null;
    }
  | {
      type: "unlink_book";
      requestId?: string;
      characterId: string;
      worldBookId: string;
      chatId?: string | null;
      activeCharacterId?: string | null;
    }
  | {
      type: "relink_book";
      requestId?: string;
      characterId: string;
      worldBookId: string;
      chatId?: string | null;
      activeCharacterId?: string | null;
    }
  | {
      type: "import_character_book";
      requestId?: string;
      characterId: string;
      chatId?: string | null;
      activeCharacterId?: string | null;
    };

export type BackendToFrontendMessage =
  | {
      type: "state";
      requestId?: string;
      state: CharacterLorebooksState;
    }
  | {
      type: "action_result";
      requestId?: string;
      ok: boolean;
      action: "attach_book" | "unlink_book" | "relink_book" | "import_character_book";
      characterId: string;
      worldBookId?: string;
      worldBookName?: string;
      entryCount?: number;
      deduplicated?: boolean;
      message?: string;
      error?: string;
      state?: CharacterLorebooksState;
    }
  | {
      type: "permission_status";
      permissions: PermissionStatus;
    };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getCharacterWorldBookIds(character: Pick<CharacterDTO, "world_book_ids" | "extensions">): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const pushId = (val: unknown) => {
    if (typeof val !== "string") return;
    const trimmed = val.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    out.push(trimmed);
  };

  if (Array.isArray(character.world_book_ids)) {
    for (const id of character.world_book_ids) pushId(id);
  }

  const ext = isRecord(character.extensions) ? character.extensions : null;
  if (ext) {
    if (Array.isArray(ext.world_book_ids)) {
      for (const id of ext.world_book_ids) pushId(id);
    }
    if (out.length === 0 && typeof ext.world_book_id === "string") {
      pushId(ext.world_book_id);
    }
  }

  return out;
}

const KNOWN_RAW_ENTRY_KEYS = new Set([
  "id",
  "uid",
  "key",
  "keys",
  "keysecondary",
  "secondary_keys",
  "content",
  "comment",
  "name",
  "enabled",
  "disabled",
  "disable",
  "displayIndex",
  "insertion_order",
  "order_value",
  "order",
  "position",
  "role",
  "depth",
  "selective",
  "constant",
  "case_sensitive",
  "caseSensitive",
  "match_whole_words",
  "matchWholeWords",
  "group",
  "group_name",
  "groupName",
  "group_override",
  "groupOverride",
  "group_weight",
  "groupWeight",
  "probability",
  "scan_depth",
  "scanDepth",
  "automation_id",
  "automationId",
  "selective_logic",
  "selectiveLogic",
  "use_probability",
  "useProbability",
  "use_regex",
  "useRegex",
  "prevent_recursion",
  "preventRecursion",
  "exclude_recursion",
  "excludeRecursion",
  "delay_until_recursion",
  "delayUntilRecursion",
  "priority",
  "sticky",
  "cooldown",
  "delay",
  "vectorized",
  "extensions",
  "folder",
  "tags",
]);

function importField(
  raw: Record<string, unknown>,
  snake: string,
  camel?: string,
): unknown {
  if (raw[snake] !== undefined) return raw[snake];
  if (camel && raw[camel] !== undefined) return raw[camel];
  const ext = isRecord(raw.extensions) ? raw.extensions : null;
  if (ext) {
    if (ext[snake] !== undefined) return ext[snake];
    if (camel && ext[camel] !== undefined) return ext[camel];
  }
  return undefined;
}

function toStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    return trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return undefined;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toOptionalFiniteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return fallback;
}

function normalizePosition(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed !== "") {
      const asNum = Number(trimmed);
      if (Number.isFinite(asNum)) return Math.trunc(asNum);
    }
    const lower = trimmed.toLowerCase();
    if (lower === "before" || lower === "before_char" || lower === "before_character") return 0;
    if (lower === "after" || lower === "after_char" || lower === "after_character") return 1;
    if (lower === "before_an" || lower === "before_authors_note" || lower === "before_author_note") return 2;
    if (lower === "after_an" || lower === "after_authors_note" || lower === "after_author_note") return 3;
    if (lower === "at_depth" || lower === "depth") return 4;
    if (lower === "before_em" || lower.startsWith("before_example")) return 5;
    if (lower === "after_em" || lower.startsWith("after_example")) return 6;
  }
  return 0;
}

function normalizeRole(value: unknown): string | undefined {
  if (value === 0 || value === "0") return "system";
  if (value === 1 || value === "1") return "user";
  if (value === 2 || value === "2") return "assistant";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const lower = trimmed.toLowerCase();
    if (lower === "system" || lower === "user" || lower === "assistant") return lower;
    return trimmed;
  }
  return undefined;
}

export function normalizeImportedEntryInput(
  rawInput: unknown,
  index: number,
): NormalizedEmbeddedEntry {
  const raw = isRecord(rawInput) ? rawInput : {};

  const primaryKeys =
    (Array.isArray(raw.keys) ? toStringArray(raw.keys) : undefined) ??
    (Array.isArray(raw.key) ? toStringArray(raw.key) : undefined) ??
    toStringArray(raw.key) ??
    toStringArray(raw.keys) ??
    [];

  const secondaryKeys =
    (Array.isArray(raw.secondary_keys) ? toStringArray(raw.secondary_keys) : undefined) ??
    (Array.isArray(raw.keysecondary) ? toStringArray(raw.keysecondary) : undefined) ??
    toStringArray(raw.secondary_keys) ??
    toStringArray(raw.keysecondary) ??
    [];

  const content = typeof raw.content === "string" ? raw.content : "";
  const comment =
    typeof raw.comment === "string"
      ? raw.comment
      : typeof raw.name === "string"
        ? raw.name
        : "";

  const isEnabled =
    raw.enabled !== undefined
      ? toBoolean(raw.enabled, true)
      : raw.disabled !== undefined
        ? !toBoolean(raw.disabled, false)
        : raw.disable !== undefined
          ? !toBoolean(raw.disable, false)
          : true;
  const disabled = !isEnabled;

  const orderValue = toFiniteNumber(
    raw.displayIndex ?? raw.insertion_order ?? raw.order_value ?? raw.order,
    index,
  );

  const rawExtensions = isRecord(raw.extensions) ? { ...raw.extensions } : {};
  for (const [k, v] of Object.entries(raw)) {
    if (!KNOWN_RAW_ENTRY_KEYS.has(k) && v !== undefined && rawExtensions[k] === undefined) {
      rawExtensions[k] = v;
    }
  }

  const outletName = importField(raw, "outlet_name", "outletName");
  if (typeof outletName === "string" && outletName !== "" && rawExtensions.outlet_name === undefined) {
    rawExtensions.outlet_name = outletName;
  }
  const wiMarker = importField(raw, "wi_marker", "wiMarker");
  if (wiMarker !== undefined && rawExtensions.wi_marker === undefined) {
    rawExtensions.wi_marker = wiMarker;
  }
  const wiMarkerSide = importField(raw, "wi_marker_side", "wiMarkerSide");
  if (wiMarkerSide !== undefined && rawExtensions.wi_marker_side === undefined) {
    rawExtensions.wi_marker_side = wiMarkerSide;
  }

  const groupRaw = importField(raw, "group_name", "groupName") ?? raw.group;
  const groupName = typeof groupRaw === "string" ? groupRaw : "";

  const automationRaw = importField(raw, "automation_id", "automationId");
  const automationId =
    typeof automationRaw === "string" && automationRaw.trim() !== ""
      ? automationRaw.trim()
      : undefined;

  const entry: NormalizedEmbeddedEntry = {
    key: primaryKeys,
    keysecondary: secondaryKeys,
    content,
    comment,
    position: normalizePosition(importField(raw, "position")),
    depth: toFiniteNumber(importField(raw, "depth"), 4),
    order_value: orderValue,
    selective: toBoolean(importField(raw, "selective"), false),
    constant: toBoolean(importField(raw, "constant"), false),
    disabled,
    group_name: groupName,
    group_override: toBoolean(importField(raw, "group_override", "groupOverride"), false),
    group_weight: toFiniteNumber(importField(raw, "group_weight", "groupWeight"), 100),
    probability: toFiniteNumber(importField(raw, "probability"), 100),
    case_sensitive: toBoolean(importField(raw, "case_sensitive", "caseSensitive"), false),
    match_whole_words: toBoolean(importField(raw, "match_whole_words", "matchWholeWords"), false),
    use_regex: toBoolean(importField(raw, "use_regex", "useRegex"), false),
    prevent_recursion: toBoolean(importField(raw, "prevent_recursion", "preventRecursion"), false),
    exclude_recursion: toBoolean(importField(raw, "exclude_recursion", "excludeRecursion"), false),
    delay_until_recursion: toBoolean(
      importField(raw, "delay_until_recursion", "delayUntilRecursion"),
      false,
    ),
    priority: toFiniteNumber(importField(raw, "priority"), 10),
    sticky: toFiniteNumber(importField(raw, "sticky"), 0),
    cooldown: toFiniteNumber(importField(raw, "cooldown"), 0),
    delay: toFiniteNumber(importField(raw, "delay"), 0),
    selective_logic: toFiniteNumber(importField(raw, "selective_logic", "selectiveLogic"), 0),
    use_probability: toBoolean(importField(raw, "use_probability", "useProbability"), true),
    vectorized: toBoolean(importField(raw, "vectorized"), false),
    extensions: rawExtensions,
  };

  const role = normalizeRole(importField(raw, "role"));
  if (role !== undefined) entry.role = role;

  const scanDepth = toOptionalFiniteNumber(importField(raw, "scan_depth", "scanDepth"));
  if (scanDepth !== undefined) entry.scan_depth = scanDepth;

  if (automationId !== undefined) entry.automation_id = automationId;

  return entry;
}

export function extractRawCharacterBook(
  extensions: Record<string, unknown> | undefined | null,
): { name: string; description: string; rawEntries: unknown[] } | null {
  if (!isRecord(extensions)) return null;
  const book = extensions.character_book;
  if (!isRecord(book)) return null;

  const rawEntriesField = book.entries;
  let rawEntries: unknown[] = [];
  if (Array.isArray(rawEntriesField)) {
    rawEntries = rawEntriesField;
  } else if (isRecord(rawEntriesField)) {
    rawEntries = Object.values(rawEntriesField);
  }

  if (rawEntries.length === 0) return null;

  const name = typeof book.name === "string" ? book.name.trim() : "";
  const description = typeof book.description === "string" ? book.description.trim() : "";
  return { name, description, rawEntries };
}

export function normalizeEmbeddedEntries(rawEntries: unknown[]): NormalizedEmbeddedEntry[] {
  return rawEntries.map((entry, idx) => normalizeImportedEntryInput(entry, idx));
}

export function isBookImportedFromCharacter(
  book: Pick<WorldBookDTO, "metadata">,
  characterId: string,
): boolean {
  if (!isRecord(book.metadata)) return false;
  return (
    book.metadata.source === "character" &&
    book.metadata.source_character_id === characterId
  );
}

export function findBestImportedCharacterBook(
  worldBooks: WorldBookDTO[],
  characterId: string,
  attachedIds: readonly string[],
): WorldBookDTO | null {
  const candidates = worldBooks.filter((b) => isBookImportedFromCharacter(b, characterId));
  if (candidates.length === 0) return null;

  const attachedSet = new Set(attachedIds);
  candidates.sort((a, b) => {
    const aAttached = attachedSet.has(a.id) ? 1 : 0;
    const bAttached = attachedSet.has(b.id) ? 1 : 0;
    if (aAttached !== bAttached) return bAttached - aAttached;

    const aAuto =
      a.metadata?.auto_managed_by_character === 1 ||
      a.metadata?.auto_managed_by_character === true
        ? 1
        : 0;
    const bAuto =
      b.metadata?.auto_managed_by_character === 1 ||
      b.metadata?.auto_managed_by_character === true
        ? 1
        : 0;
    if (aAuto !== bAuto) return bAuto - aAuto;

    const aTime = Math.max(a.updated_at || 0, a.created_at || 0);
    const bTime = Math.max(b.updated_at || 0, b.created_at || 0);
    return bTime - aTime;
  });

  return candidates[0] ?? null;
}

export function buildEmbeddedBookInfo(
  character: Pick<CharacterDTO, "id" | "name" | "extensions">,
  worldBooks: WorldBookDTO[],
  attachedIds: readonly string[],
): EmbeddedBookInfo | null {
  const extracted = extractRawCharacterBook(character.extensions);
  if (!extracted) return null;

  const entries = normalizeEmbeddedEntries(extracted.rawEntries);
  if (entries.length === 0) return null;

  const attachedSet = new Set(attachedIds);
  const matchingBooks = worldBooks.filter((b) =>
    isBookImportedFromCharacter(b, character.id),
  );

  const linkedBook =
    matchingBooks.find((b) => attachedSet.has(b.id)) ?? null;
  const bestImported =
    linkedBook ?? findBestImportedCharacterBook(worldBooks, character.id, attachedIds);

  const status: EmbeddedBookStatus = linkedBook
    ? "linked"
    : bestImported
      ? "imported_unlinked"
      : "embedded_only";

  return {
    name: extracted.name || `${character.name}'s Lorebook`,
    description: extracted.description,
    entryCount: entries.length,
    entries,
    status,
    linkedBookId: linkedBook?.id ?? null,
    linkedBookName: linkedBook?.name ?? null,
    importedBookId: bestImported?.id ?? null,
    importedBookName: bestImported?.name ?? null,
  };
}

export function buildMemberState(
  character: CharacterDTO,
  worldBooks: WorldBookDTO[],
  options: {
    isActiveSpeaker: boolean;
    isMuted: boolean;
    isLoreActiveInGroup: boolean;
  },
): CharacterLorebookMemberState {
  const bookMap = new Map<string, WorldBookDTO>();
  for (const wb of worldBooks) bookMap.set(wb.id, wb);

  const attachedIds = getCharacterWorldBookIds(character);
  const attachedBooks: AttachedWorldBookPill[] = attachedIds.map((id) => {
    const wb = bookMap.get(id);
    return {
      id,
      name: wb ? wb.name : "Unknown World Book",
      missing: !wb,
      isEmbeddedSource: wb ? isBookImportedFromCharacter(wb, character.id) : false,
    };
  });

  const embeddedBook = buildEmbeddedBookInfo(character, worldBooks, attachedIds);

  return {
    characterId: character.id,
    characterName: character.name,
    avatarUrl: character.avatar_url ?? null,
    isActiveSpeaker: options.isActiveSpeaker,
    isMuted: options.isMuted,
    isLoreActiveInGroup: options.isLoreActiveInGroup,
    attachedBookIds: attachedIds,
    attachedBooks,
    embeddedBook,
  };
}

export function toWorldBookSummary(wb: WorldBookDTO): WorldBookSummary {
  return {
    id: wb.id,
    name: wb.name,
    description: wb.description,
    metadata: isRecord(wb.metadata) ? wb.metadata : {},
    created_at: wb.created_at,
    updated_at: wb.updated_at,
  };
}
