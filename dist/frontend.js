// src/shared.ts
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function getCharacterWorldBookIds(character) {
  const seen = new Set;
  const out = [];
  const pushId = (val) => {
    if (typeof val !== "string")
      return;
    const trimmed = val.trim();
    if (!trimmed || seen.has(trimmed))
      return;
    seen.add(trimmed);
    out.push(trimmed);
  };
  if (Array.isArray(character.world_book_ids)) {
    for (const id of character.world_book_ids)
      pushId(id);
  }
  const ext = isRecord(character.extensions) ? character.extensions : null;
  if (ext) {
    if (Array.isArray(ext.world_book_ids)) {
      for (const id of ext.world_book_ids)
        pushId(id);
    }
    if (out.length === 0 && typeof ext.world_book_id === "string") {
      pushId(ext.world_book_id);
    }
  }
  return out;
}
var KNOWN_RAW_ENTRY_KEYS = new Set([
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
  "tags"
]);
function importField(raw, snake, camel) {
  if (raw[snake] !== undefined)
    return raw[snake];
  if (camel && raw[camel] !== undefined)
    return raw[camel];
  const ext = isRecord(raw.extensions) ? raw.extensions : null;
  if (ext) {
    if (ext[snake] !== undefined)
      return ext[snake];
    if (camel && ext[camel] !== undefined)
      return ext[camel];
  }
  return;
}
function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed)
      return [];
    return trimmed.split(",").map((part) => part.trim()).filter(Boolean);
  }
  return;
}
function toFiniteNumber(value, fallback) {
  if (typeof value === "number" && Number.isFinite(value))
    return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed))
      return parsed;
  }
  return fallback;
}
function toOptionalFiniteNumber(value) {
  if (value === null || value === undefined || value === "")
    return;
  if (typeof value === "number" && Number.isFinite(value))
    return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed))
      return parsed;
  }
  return;
}
function toBoolean(value, fallback) {
  if (typeof value === "boolean")
    return value;
  if (typeof value === "number")
    return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1")
      return true;
    if (normalized === "false" || normalized === "0")
      return false;
  }
  return fallback;
}
function normalizePosition(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed !== "") {
      const asNum = Number(trimmed);
      if (Number.isFinite(asNum))
        return Math.trunc(asNum);
    }
    const lower = trimmed.toLowerCase();
    if (lower === "before" || lower === "before_char" || lower === "before_character")
      return 0;
    if (lower === "after" || lower === "after_char" || lower === "after_character")
      return 1;
    if (lower === "before_an" || lower === "before_authors_note" || lower === "before_author_note")
      return 2;
    if (lower === "after_an" || lower === "after_authors_note" || lower === "after_author_note")
      return 3;
    if (lower === "at_depth" || lower === "depth")
      return 4;
    if (lower === "before_em" || lower.startsWith("before_example"))
      return 5;
    if (lower === "after_em" || lower.startsWith("after_example"))
      return 6;
  }
  return 0;
}
function normalizeRole(value) {
  if (value === 0 || value === "0")
    return "system";
  if (value === 1 || value === "1")
    return "user";
  if (value === 2 || value === "2")
    return "assistant";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed)
      return;
    const lower = trimmed.toLowerCase();
    if (lower === "system" || lower === "user" || lower === "assistant")
      return lower;
    return trimmed;
  }
  return;
}
function normalizeImportedEntryInput(rawInput, index) {
  const raw = isRecord(rawInput) ? rawInput : {};
  const primaryKeys = (Array.isArray(raw.keys) ? toStringArray(raw.keys) : undefined) ?? (Array.isArray(raw.key) ? toStringArray(raw.key) : undefined) ?? toStringArray(raw.key) ?? toStringArray(raw.keys) ?? [];
  const secondaryKeys = (Array.isArray(raw.secondary_keys) ? toStringArray(raw.secondary_keys) : undefined) ?? (Array.isArray(raw.keysecondary) ? toStringArray(raw.keysecondary) : undefined) ?? toStringArray(raw.secondary_keys) ?? toStringArray(raw.keysecondary) ?? [];
  const content = typeof raw.content === "string" ? raw.content : "";
  const comment = typeof raw.comment === "string" ? raw.comment : typeof raw.name === "string" ? raw.name : "";
  const isEnabled = raw.enabled !== undefined ? toBoolean(raw.enabled, true) : raw.disabled !== undefined ? !toBoolean(raw.disabled, false) : raw.disable !== undefined ? !toBoolean(raw.disable, false) : true;
  const disabled = !isEnabled;
  const orderValue = toFiniteNumber(raw.displayIndex ?? raw.insertion_order ?? raw.order_value ?? raw.order, index);
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
  const automationId = typeof automationRaw === "string" && automationRaw.trim() !== "" ? automationRaw.trim() : undefined;
  const entry = {
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
    delay_until_recursion: toBoolean(importField(raw, "delay_until_recursion", "delayUntilRecursion"), false),
    priority: toFiniteNumber(importField(raw, "priority"), 10),
    sticky: toFiniteNumber(importField(raw, "sticky"), 0),
    cooldown: toFiniteNumber(importField(raw, "cooldown"), 0),
    delay: toFiniteNumber(importField(raw, "delay"), 0),
    selective_logic: toFiniteNumber(importField(raw, "selective_logic", "selectiveLogic"), 0),
    use_probability: toBoolean(importField(raw, "use_probability", "useProbability"), true),
    vectorized: toBoolean(importField(raw, "vectorized"), false),
    extensions: rawExtensions
  };
  const role = normalizeRole(importField(raw, "role"));
  if (role !== undefined)
    entry.role = role;
  const scanDepth = toOptionalFiniteNumber(importField(raw, "scan_depth", "scanDepth"));
  if (scanDepth !== undefined)
    entry.scan_depth = scanDepth;
  if (automationId !== undefined)
    entry.automation_id = automationId;
  return entry;
}
function extractRawCharacterBook(extensions) {
  if (!isRecord(extensions))
    return null;
  const book = extensions.character_book;
  if (!isRecord(book))
    return null;
  const rawEntriesField = book.entries;
  let rawEntries = [];
  if (Array.isArray(rawEntriesField)) {
    rawEntries = rawEntriesField;
  } else if (isRecord(rawEntriesField)) {
    rawEntries = Object.values(rawEntriesField);
  }
  if (rawEntries.length === 0)
    return null;
  const name = typeof book.name === "string" ? book.name.trim() : "";
  const description = typeof book.description === "string" ? book.description.trim() : "";
  return { name, description, rawEntries };
}
function normalizeEmbeddedEntries(rawEntries) {
  return rawEntries.map((entry, idx) => normalizeImportedEntryInput(entry, idx));
}
function isBookImportedFromCharacter(book, characterId) {
  if (!isRecord(book.metadata))
    return false;
  return book.metadata.source === "character" && book.metadata.source_character_id === characterId;
}
function findBestImportedCharacterBook(worldBooks, characterId, attachedIds) {
  const candidates = worldBooks.filter((b) => isBookImportedFromCharacter(b, characterId));
  if (candidates.length === 0)
    return null;
  const attachedSet = new Set(attachedIds);
  candidates.sort((a, b) => {
    const aAttached = attachedSet.has(a.id) ? 1 : 0;
    const bAttached = attachedSet.has(b.id) ? 1 : 0;
    if (aAttached !== bAttached)
      return bAttached - aAttached;
    const aAuto = a.metadata?.auto_managed_by_character === 1 || a.metadata?.auto_managed_by_character === true ? 1 : 0;
    const bAuto = b.metadata?.auto_managed_by_character === 1 || b.metadata?.auto_managed_by_character === true ? 1 : 0;
    if (aAuto !== bAuto)
      return bAuto - aAuto;
    const aTime = Math.max(a.updated_at || 0, a.created_at || 0);
    const bTime = Math.max(b.updated_at || 0, b.created_at || 0);
    return bTime - aTime;
  });
  return candidates[0] ?? null;
}
function buildEmbeddedBookInfo(character, worldBooks, attachedIds) {
  const extracted = extractRawCharacterBook(character.extensions);
  if (!extracted)
    return null;
  const entries = normalizeEmbeddedEntries(extracted.rawEntries);
  if (entries.length === 0)
    return null;
  const attachedSet = new Set(attachedIds);
  const matchingBooks = worldBooks.filter((b) => isBookImportedFromCharacter(b, character.id));
  const linkedBook = matchingBooks.find((b) => attachedSet.has(b.id)) ?? null;
  const bestImported = linkedBook ?? findBestImportedCharacterBook(worldBooks, character.id, attachedIds);
  const status = linkedBook ? "linked" : bestImported ? "imported_unlinked" : "embedded_only";
  return {
    name: extracted.name || `${character.name}'s Lorebook`,
    description: extracted.description,
    entryCount: entries.length,
    entries,
    status,
    linkedBookId: linkedBook?.id ?? null,
    linkedBookName: linkedBook?.name ?? null,
    importedBookId: bestImported?.id ?? null,
    importedBookName: bestImported?.name ?? null
  };
}
function buildMemberState(character, worldBooks, options) {
  const bookMap = new Map;
  for (const wb of worldBooks)
    bookMap.set(wb.id, wb);
  const attachedIds = getCharacterWorldBookIds(character);
  const attachedBooks = attachedIds.map((id) => {
    const wb = bookMap.get(id);
    return {
      id,
      name: wb ? wb.name : "Unknown World Book",
      missing: !wb,
      isEmbeddedSource: wb ? isBookImportedFromCharacter(wb, character.id) : false
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
    embeddedBook
  };
}
function toWorldBookSummary(wb) {
  return {
    id: wb.id,
    name: wb.name,
    description: wb.description,
    metadata: isRecord(wb.metadata) ? wb.metadata : {},
    created_at: wb.created_at,
    updated_at: wb.updated_at
  };
}

// src/styles.ts
var STYLES = `
.clb-section {
  --clb-accent: var(--lumiverse-warning, #f5a623);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: var(--lumiverse-fill-subtle);
  border: 1px solid var(--lumiverse-border);
  border-radius: 8px;
  flex-shrink: 0;
}

.clb-section.clb-section-disabled {
  opacity: 0.72;
}

.clb-header {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.clb-header-icon {
  color: var(--clb-accent);
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.clb-header-title {
  font-size: calc(12px * var(--lumiverse-font-scale, 1));
  font-weight: 600;
  color: var(--lumiverse-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clb-group-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: calc(10px * var(--lumiverse-font-scale, 1));
  font-weight: 600;
  background: color-mix(in srgb, var(--clb-accent) 14%, transparent);
  color: var(--clb-accent);
  white-space: nowrap;
  flex-shrink: 0;
}

.clb-perm-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--lumiverse-warning, #f5a623) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--lumiverse-warning, #f5a623) 35%, transparent);
  font-size: calc(11px * var(--lumiverse-font-scale, 1));
  color: var(--lumiverse-text-muted);
}

.clb-perm-text {
  flex: 1;
  min-width: 0;
}

.clb-perm-btn {
  padding: 4px 9px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--lumiverse-warning, #f5a623) 50%, transparent);
  background: color-mix(in srgb, var(--lumiverse-warning, #f5a623) 16%, transparent);
  color: var(--lumiverse-warning, #f5a623);
  font-size: calc(11px * var(--lumiverse-font-scale, 1));
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--lumiverse-transition-fast, 120ms ease);
}

.clb-perm-btn:hover {
  background: color-mix(in srgb, var(--lumiverse-warning, #f5a623) 24%, transparent);
}

.clb-members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.clb-member-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.clb-member-block.clb-member-group-item {
  padding: 8px;
  border-radius: 6px;
  background: var(--lumiverse-bg, rgba(0, 0, 0, 0.12));
  border: 1px solid var(--lumiverse-border);
}

.clb-member-block.clb-member-dimmed {
  opacity: 0.68;
}

.clb-member-header {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.clb-member-name {
  font-size: calc(11.5px * var(--lumiverse-font-scale, 1));
  font-weight: 600;
  color: var(--lumiverse-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clb-member-tags {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.clb-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: calc(9.5px * var(--lumiverse-font-scale, 1));
  font-weight: 600;
  background: var(--lumiverse-fill);
  color: var(--lumiverse-text-dim);
  border: 1px solid var(--lumiverse-border);
}

.clb-tag-active {
  background: color-mix(in srgb, var(--lumiverse-success, #4ade80) 14%, transparent);
  border-color: color-mix(in srgb, var(--lumiverse-success, #4ade80) 35%, transparent);
  color: var(--lumiverse-success, #4ade80);
}

.clb-tag-muted {
  background: color-mix(in srgb, var(--lumiverse-error, #ef4444) 12%, transparent);
  border-color: color-mix(in srgb, var(--lumiverse-error, #ef4444) 30%, transparent);
  color: var(--lumiverse-error, #ef4444);
}

.clb-attach-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--lumiverse-border);
  background: var(--lumiverse-fill-subtle);
  color: var(--lumiverse-text-muted);
  font-size: calc(11.5px * var(--lumiverse-font-scale, 1));
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--lumiverse-transition-fast, 120ms ease), border-color var(--lumiverse-transition-fast, 120ms ease), color var(--lumiverse-transition-fast, 120ms ease);
}

.clb-attach-btn:hover:not(:disabled) {
  background: var(--lumiverse-fill-hover);
  border-color: var(--lumiverse-border-hover, var(--lumiverse-border));
  color: var(--lumiverse-text);
}

.clb-attach-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.clb-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.clb-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--clb-accent) 14%, transparent);
  color: var(--clb-accent);
  font-size: calc(11.5px * var(--lumiverse-font-scale, 1));
  max-width: 100%;
}

.clb-pill.clb-pill-missing {
  background: color-mix(in srgb, var(--lumiverse-error, #ef4444) 14%, transparent);
  color: var(--lumiverse-error, #ef4444);
}

.clb-pill-name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.clb-pill-name:hover:not(:disabled) {
  text-decoration: underline;
}

.clb-pill-name:disabled {
  cursor: default;
  opacity: 0.8;
}

.clb-pill-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--lumiverse-btn-icon-xs, 16px);
  height: var(--lumiverse-btn-icon-xs, 16px);
  border-radius: 50%;
  background: transparent;
  border: none;
  padding: 0;
  color: inherit;
  opacity: 0.65;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity var(--lumiverse-transition-fast, 120ms ease), background var(--lumiverse-transition-fast, 120ms ease);
}

.clb-pill-remove:hover:not(:disabled) {
  opacity: 1;
  background: color-mix(in srgb, currentColor 14%, transparent);
}

.clb-pill-remove:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.clb-hint {
  font-size: calc(11px * var(--lumiverse-font-scale, 1));
  color: var(--lumiverse-text-dim);
  font-style: italic;
}

.clb-embedded-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 7px;
  background: var(--lumiverse-fill);
  border: 1px solid var(--lumiverse-border);
  flex-wrap: wrap;
}

.clb-embedded-icon {
  color: var(--clb-accent);
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.clb-embedded-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 110px;
}

.clb-embedded-title {
  font-size: calc(11.5px * var(--lumiverse-font-scale, 1));
  font-weight: 600;
  color: var(--lumiverse-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clb-embedded-meta {
  font-size: calc(10.5px * var(--lumiverse-font-scale, 1));
  color: var(--lumiverse-text-dim);
}

.clb-embedded-actions {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.clb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--lumiverse-border);
  color: var(--lumiverse-text-muted);
  font-size: calc(11.5px * var(--lumiverse-font-scale, 1));
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--lumiverse-transition-fast, 120ms ease), border-color var(--lumiverse-transition-fast, 120ms ease), color var(--lumiverse-transition-fast, 120ms ease);
}

.clb-btn:hover:not(:disabled) {
  background: var(--lumiverse-fill-hover);
  border-color: var(--lumiverse-border-hover, var(--lumiverse-border));
  color: var(--lumiverse-text);
}

.clb-btn-dashed {
  border-style: dashed;
  color: var(--lumiverse-text-dim);
}

.clb-btn-dashed:hover:not(:disabled) {
  border-color: var(--lumiverse-primary);
  color: var(--lumiverse-primary);
  background: color-mix(in srgb, var(--lumiverse-primary) 8%, transparent);
}

.clb-btn-primary {
  border-color: color-mix(in srgb, var(--clb-accent) 45%, transparent);
  background: color-mix(in srgb, var(--clb-accent) 14%, transparent);
  color: var(--clb-accent);
}

.clb-btn-primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--clb-accent) 22%, transparent);
  border-color: var(--clb-accent);
  color: var(--clb-accent);
}

.clb-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clb-status-msg {
  font-size: calc(11px * var(--lumiverse-font-scale, 1));
  color: var(--lumiverse-success, #4ade80);
  padding: 2px 0;
}

.clb-status-msg.clb-status-error {
  color: var(--lumiverse-error, #ef4444);
}

/* Mobile Accordion (mirrors MobileAttachmentAccordion in WorldBookPanel.module.css) */
.clb-accordion {
  --clb-accent: var(--lumiverse-warning, #f5a623);
  border: 1px solid var(--lumiverse-border);
  border-radius: 10px;
  background: var(--lumiverse-fill-subtle);
  overflow: hidden;
  flex-shrink: 0;
}

.clb-accordion.clb-accordion-expanded {
  border-color: color-mix(in srgb, var(--lumiverse-border) 70%, var(--lumiverse-text) 30%);
}

.clb-accordion-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 8px 7px 10px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.clb-accordion-start {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.clb-accordion-icon-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--clb-accent) 14%, transparent);
  color: var(--clb-accent);
  flex-shrink: 0;
}

.clb-accordion-label {
  font-size: calc(11px * var(--lumiverse-font-scale, 1));
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lumiverse-text);
}

.clb-accordion-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--lumiverse-border);
  color: var(--lumiverse-text-dim);
  font-size: calc(10px * var(--lumiverse-font-scale, 1));
  font-weight: 600;
}

.clb-accordion-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.clb-accordion-preview-chip {
  display: inline-flex;
  align-items: center;
  max-width: min(120px, 32vw);
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--clb-accent) 14%, transparent);
  color: var(--clb-accent);
  font-size: calc(10.5px * var(--lumiverse-font-scale, 1));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clb-accordion-preview-empty {
  font-size: calc(11px * var(--lumiverse-font-scale, 1));
  color: var(--lumiverse-text-dim);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clb-accordion-chevron {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--lumiverse-text-dim);
  flex-shrink: 0;
}

.clb-accordion-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 8px 8px;
}

.clb-accordion-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* Searchable Attach Picker Popover */
.clb-picker-popover {
  position: fixed;
  z-index: 10050;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 280px;
  max-width: calc(100vw - 16px);
  max-height: 320px;
  padding: 8px;
  border-radius: 8px;
  background: var(--lumiverse-bg-deep, var(--lumiverse-bg, #18181b));
  border: 1px solid var(--lumiverse-border);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
  color: var(--lumiverse-text);
}

.clb-picker-search {
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--lumiverse-border);
  background: var(--lumiverse-fill-subtle);
  color: var(--lumiverse-text);
  font-size: calc(12px * var(--lumiverse-font-scale, 1));
  outline: none;
}

.clb-picker-search:focus {
  border-color: var(--lumiverse-primary);
}

.clb-picker-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  max-height: 240px;
}

.clb-picker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--lumiverse-text);
  font-size: calc(12px * var(--lumiverse-font-scale, 1));
  text-align: left;
  cursor: pointer;
  transition: background var(--lumiverse-transition-fast, 120ms ease);
}

.clb-picker-item:hover {
  background: var(--lumiverse-fill-hover);
}

.clb-picker-item.clb-picker-item-attached {
  color: var(--lumiverse-warning, #f5a623);
}

.clb-picker-item-check {
  width: 14px;
  text-align: center;
  flex-shrink: 0;
  font-weight: 700;
}

.clb-picker-item-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clb-picker-empty {
  padding: 12px 8px;
  text-align: center;
  font-size: calc(11.5px * var(--lumiverse-font-scale, 1));
  color: var(--lumiverse-text-dim);
  font-style: italic;
}

/* Embedded Preview Modal */
.clb-preview-modal {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--lumiverse-text);
}

.clb-preview-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--lumiverse-fill-subtle);
  border: 1px solid var(--lumiverse-border);
}

.clb-preview-desc {
  font-size: calc(12px * var(--lumiverse-font-scale, 1));
  color: var(--lumiverse-text-muted);
  white-space: pre-wrap;
}

.clb-preview-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  font-size: calc(11.5px * var(--lumiverse-font-scale, 1));
  color: var(--lumiverse-text-dim);
}

.clb-preview-search {
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--lumiverse-border);
  background: var(--lumiverse-fill-subtle);
  color: var(--lumiverse-text);
  font-size: calc(12px * var(--lumiverse-font-scale, 1));
}

.clb-preview-entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.clb-preview-entry {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 9px 10px;
  border-radius: 8px;
  background: var(--lumiverse-fill-subtle);
  border: 1px solid var(--lumiverse-border);
}

.clb-preview-entry.clb-preview-entry-disabled {
  opacity: 0.6;
}

.clb-preview-entry-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
}

.clb-preview-entry-title {
  font-size: calc(12.5px * var(--lumiverse-font-scale, 1));
  font-weight: 600;
  color: var(--lumiverse-text);
}

.clb-preview-badges {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.clb-preview-badge {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: calc(10px * var(--lumiverse-font-scale, 1));
  font-weight: 600;
  background: var(--lumiverse-fill);
  color: var(--lumiverse-text-muted);
  border: 1px solid var(--lumiverse-border);
}

.clb-preview-badge-constant {
  background: color-mix(in srgb, var(--lumiverse-primary) 16%, transparent);
  border-color: color-mix(in srgb, var(--lumiverse-primary) 35%, transparent);
  color: var(--lumiverse-primary);
}

.clb-preview-badge-disabled {
  background: color-mix(in srgb, var(--lumiverse-error, #ef4444) 14%, transparent);
  border-color: color-mix(in srgb, var(--lumiverse-error, #ef4444) 30%, transparent);
  color: var(--lumiverse-error, #ef4444);
}

.clb-preview-keys {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  font-size: calc(11px * var(--lumiverse-font-scale, 1));
  color: var(--lumiverse-text-dim);
}

.clb-preview-key-chip {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--lumiverse-fill);
  border: 1px solid var(--lumiverse-border);
  color: var(--lumiverse-text);
  font-size: calc(11px * var(--lumiverse-font-scale, 1));
}

.clb-preview-content {
  font-size: calc(12px * var(--lumiverse-font-scale, 1));
  line-height: 1.45;
  color: var(--lumiverse-text-muted);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 180px;
  overflow-y: auto;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--lumiverse-bg, rgba(0, 0, 0, 0.14));
  border: 1px solid var(--lumiverse-border);
}

@media (max-height: 860px) and (min-width: 720px) {
  .clb-section {
    padding: 8px;
    gap: 6px;
  }
}

@media (max-width: 768px), (pointer: coarse) {
  .clb-attach-btn,
  .clb-btn,
  .clb-perm-btn,
  .clb-picker-item {
    min-height: 44px;
  }
}
`;

// src/frontend.ts
var SECTION_ATTR = "data-char-lorebooks-section";
var POSITION_LABELS = {
  0: "Before Char",
  1: "After Char",
  2: "Before AN",
  3: "After AN",
  4: "At Depth",
  5: "Before Examples",
  6: "After Examples"
};
function createSvgIcon(paths, size = 12) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  for (const item of paths) {
    const node = document.createElementNS(ns, item.tag);
    for (const [k, v] of Object.entries(item.attrs)) {
      node.setAttribute(k, v);
    }
    svg.appendChild(node);
  }
  return svg;
}
function createBookUserIcon(size = 12) {
  return createSvgIcon([
    { tag: "path", attrs: { d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" } },
    { tag: "circle", attrs: { cx: "12", cy: "8", r: "2" } },
    { tag: "path", attrs: { d: "M15 13a3 3 0 0 0-6 0" } }
  ], size);
}
function createNotebookIcon(size = 14) {
  return createSvgIcon([
    { tag: "path", attrs: { d: "M2 6h4" } },
    { tag: "path", attrs: { d: "M2 10h4" } },
    { tag: "path", attrs: { d: "M2 14h4" } },
    { tag: "path", attrs: { d: "M2 18h4" } },
    { tag: "rect", attrs: { width: "16", height: "20", x: "4", y: "2", rx: "2" } },
    { tag: "path", attrs: { d: "M16 2v20" } }
  ], size);
}
function createPlusIcon(size = 11) {
  return createSvgIcon([
    { tag: "path", attrs: { d: "M5 12h14" } },
    { tag: "path", attrs: { d: "M12 5v14" } }
  ], size);
}
function createCloseIcon(size = 10) {
  return createSvgIcon([
    { tag: "path", attrs: { d: "M18 6 6 18" } },
    { tag: "path", attrs: { d: "m6 6 12 12" } }
  ], size);
}
function createChevronIcon(collapsed, size = 14) {
  return createSvgIcon([
    {
      tag: "path",
      attrs: { d: collapsed ? "m9 18 6-6-6-6" : "m6 9 6 6 6-6" }
    }
  ], size);
}
function coerceFrontendCharacter(raw) {
  if (!isRecord(raw) || typeof raw.id !== "string" || typeof raw.name !== "string") {
    return null;
  }
  const extensions = isRecord(raw.extensions) ? raw.extensions : {};
  const worldBookIds = getCharacterWorldBookIds({
    world_book_ids: Array.isArray(raw.world_book_ids) ? raw.world_book_ids.filter((x) => typeof x === "string") : [],
    extensions
  });
  return {
    id: raw.id,
    name: raw.name,
    description: typeof raw.description === "string" ? raw.description : "",
    personality: typeof raw.personality === "string" ? raw.personality : "",
    scenario: typeof raw.scenario === "string" ? raw.scenario : "",
    first_mes: typeof raw.first_mes === "string" ? raw.first_mes : "",
    mes_example: typeof raw.mes_example === "string" ? raw.mes_example : "",
    creator_notes: typeof raw.creator_notes === "string" ? raw.creator_notes : "",
    system_prompt: typeof raw.system_prompt === "string" ? raw.system_prompt : "",
    post_history_instructions: typeof raw.post_history_instructions === "string" ? raw.post_history_instructions : "",
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t) => typeof t === "string") : [],
    alternate_greetings: Array.isArray(raw.alternate_greetings) ? raw.alternate_greetings.filter((t) => typeof t === "string") : [],
    creator: typeof raw.creator === "string" ? raw.creator : "",
    image_id: typeof raw.image_id === "string" ? raw.image_id : null,
    avatar_url: typeof raw.avatar_url === "string" ? raw.avatar_url : null,
    world_book_ids: worldBookIds,
    extensions,
    created_at: typeof raw.created_at === "number" ? raw.created_at : 0,
    updated_at: typeof raw.updated_at === "number" ? raw.updated_at : 0
  };
}
function formatGroupModeLabel(group) {
  switch (group.effectiveLorebookMode) {
    case "active_character":
      return "Active Char";
    case "all_unmuted":
      return "All Unmuted";
    case "all":
      return "All Members";
  }
}
function setup(ctx) {
  ctx.deferReady();
  let disposed = false;
  let requestCounter = 0;
  let mobileCollapsed = true;
  let lastIsMobile = null;
  let state = null;
  let statusNotice = null;
  let statusTimer = null;
  let fallbackTimer = null;
  let refreshDebounceTimer = null;
  let syncScheduled = false;
  let isApplyingDom = false;
  const importingCharacters = new Set;
  const busyActions = new Set;
  let sectionEl = null;
  let activePopoverEl = null;
  let activeModalHandle = null;
  let bodyObserver = null;
  let tabObserver = null;
  let observedTabRoot = null;
  const removeStyle = ctx.dom.addStyle(STYLES);
  const unsubs = [];
  function nextRequestId() {
    requestCounter += 1;
    return `clb_${Date.now()}_${requestCounter}`;
  }
  function showStatus(text, isError = false) {
    statusNotice = { text, isError };
    if (statusTimer)
      clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      statusNotice = null;
      if (!disposed)
        renderSection();
    }, 4500);
    renderSection();
  }
  function closePopover() {
    if (activePopoverEl) {
      activePopoverEl.remove();
      activePopoverEl = null;
    }
  }
  function sendToBackend(msg) {
    ctx.sendToBackend(msg);
  }
  function getActiveIds() {
    const active = ctx.getActiveChat();
    return {
      chatId: active?.chatId ?? null,
      characterId: active?.characterId ?? null
    };
  }
  async function listAllWorldBooksFrontend() {
    if (!ctx.worldBooks)
      return [];
    const all = [];
    let offset = 0;
    const limit = 200;
    while (true) {
      const rawPage = await ctx.worldBooks.list({ limit, offset });
      if (Array.isArray(rawPage)) {
        return rawPage;
      }
      const page = rawPage;
      const items = Array.isArray(page?.data) ? page.data : [];
      all.push(...items);
      const total = typeof page?.total === "number" ? page.total : all.length;
      if (items.length < limit || all.length >= total) {
        break;
      }
      offset += items.length;
    }
    return all;
  }
  async function loadFrontendFallback(basePermissions) {
    if (disposed)
      return;
    const { chatId, characterId } = getActiveIds();
    const permissions = basePermissions ?? {
      characters: false,
      world_books: false,
      chats: false,
      allGranted: false,
      missing: ["characters", "world_books", "chats"]
    };
    try {
      const [worldBooks, rawChar] = await Promise.all([
        listAllWorldBooksFrontend().catch(() => []),
        characterId ? ctx.characters.get(characterId).catch(() => null) : Promise.resolve(null)
      ]);
      if (disposed)
        return;
      worldBooks.sort((a, b) => a.name.localeCompare(b.name));
      const char = coerceFrontendCharacter(rawChar);
      const members = [];
      if (char) {
        members.push(buildMemberState(char, worldBooks, {
          isActiveSpeaker: true,
          isMuted: false,
          isLoreActiveInGroup: true
        }));
      }
      state = {
        source: "frontend_fallback",
        permissions,
        chatId,
        activeCharacterId: characterId,
        group: null,
        members,
        availableWorldBooks: worldBooks.map(toWorldBookSummary),
        error: null
      };
      renderSection();
    } catch {
      if (disposed)
        return;
      state = {
        source: "frontend_fallback",
        permissions,
        chatId,
        activeCharacterId: characterId,
        group: null,
        members: [],
        availableWorldBooks: [],
        error: null
      };
      renderSection();
    }
  }
  function requestState() {
    if (disposed)
      return;
    const { chatId, characterId } = getActiveIds();
    if (fallbackTimer)
      clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => {
      if (!disposed && !state) {
        loadFrontendFallback();
      }
    }, 650);
    sendToBackend({
      type: "get_state",
      requestId: nextRequestId(),
      chatId,
      characterId
    });
  }
  function scheduleRefresh(delayMs = 60) {
    if (disposed)
      return;
    if (refreshDebounceTimer)
      clearTimeout(refreshDebounceTimer);
    refreshDebounceTimer = setTimeout(() => {
      requestState();
    }, delayMs);
  }
  function openBookInEditor(worldBookId) {
    if (ctx.host?.surfaces?.invoke) {
      Promise.resolve(ctx.host.surfaces.invoke({ kind: "modal", id: "world_book_editor" }, { id: worldBookId })).catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        showStatus(`Unable to open World Book editor: ${msg}`, true);
      });
      return;
    }
    showStatus("World Book editor modal surface is unavailable in this host version.", true);
  }
  async function requestPermissions() {
    if (!ctx.permissions?.request)
      return;
    try {
      await ctx.permissions.request(["characters", "world_books", "chats"], {
        reason: "View and manage Character World Books, group chat lorebooks, and import embedded character lorebooks."
      });
      requestState();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showStatus(`Permission request dismissed: ${msg}`, true);
    }
  }
  function openEmbeddedPreviewModal(member, embedded) {
    if (activeModalHandle) {
      activeModalHandle.dismiss();
      activeModalHandle = null;
    }
    const modal = ctx.ui.showModal({
      title: `${embedded.name} (${member.characterName})`,
      width: 640,
      maxHeight: 620
    });
    activeModalHandle = modal;
    modal.onDismiss(() => {
      if (activeModalHandle === modal) {
        activeModalHandle = null;
      }
    });
    const container = document.createElement("div");
    container.className = "clb-preview-modal";
    const summary = document.createElement("div");
    summary.className = "clb-preview-summary";
    if (embedded.description) {
      const desc = document.createElement("div");
      desc.className = "clb-preview-desc";
      desc.textContent = embedded.description;
      summary.appendChild(desc);
    }
    const metaRow = document.createElement("div");
    metaRow.className = "clb-preview-meta-row";
    const countSpan = document.createElement("span");
    const statusLabel = embedded.status === "linked" ? "Linked to World Books" : embedded.status === "imported_unlinked" ? "Previously imported (currently unlinked)" : "Embedded in character card only";
    countSpan.textContent = `${embedded.entryCount} ${embedded.entryCount === 1 ? "entry" : "entries"} • ${statusLabel}`;
    metaRow.appendChild(countSpan);
    const canMutate = state?.permissions.characters && state?.permissions.world_books;
    if (embedded.status === "linked" && embedded.linkedBookId) {
      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "clb-btn clb-btn-primary";
      openBtn.textContent = "Open in Editor";
      openBtn.addEventListener("click", () => {
        modal.dismiss();
        openBookInEditor(embedded.linkedBookId);
      });
      metaRow.appendChild(openBtn);
    } else if (embedded.status === "imported_unlinked" && embedded.importedBookId && canMutate) {
      const relinkBtn = document.createElement("button");
      relinkBtn.type = "button";
      relinkBtn.className = "clb-btn clb-btn-primary";
      relinkBtn.textContent = "Re-link Book";
      relinkBtn.addEventListener("click", () => {
        const { chatId, characterId } = getActiveIds();
        sendToBackend({
          type: "relink_book",
          requestId: nextRequestId(),
          characterId: member.characterId,
          worldBookId: embedded.importedBookId,
          chatId,
          activeCharacterId: characterId
        });
        modal.dismiss();
      });
      metaRow.appendChild(relinkBtn);
    } else if (embedded.status === "embedded_only" && canMutate) {
      const importBtn = document.createElement("button");
      importBtn.type = "button";
      importBtn.className = "clb-btn clb-btn-primary";
      importBtn.textContent = importingCharacters.has(member.characterId) ? "Importing..." : "Import & Link";
      importBtn.disabled = importingCharacters.has(member.characterId);
      importBtn.addEventListener("click", () => {
        importingCharacters.add(member.characterId);
        const { chatId, characterId } = getActiveIds();
        sendToBackend({
          type: "import_character_book",
          requestId: nextRequestId(),
          characterId: member.characterId,
          chatId,
          activeCharacterId: characterId
        });
        modal.dismiss();
        renderSection();
      });
      metaRow.appendChild(importBtn);
    }
    summary.appendChild(metaRow);
    container.appendChild(summary);
    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.className = "clb-preview-search";
    searchInput.placeholder = "Filter embedded entries by title, keys, or content...";
    container.appendChild(searchInput);
    const entriesContainer = document.createElement("div");
    entriesContainer.className = "clb-preview-entries";
    container.appendChild(entriesContainer);
    const renderEntries = (query) => {
      entriesContainer.replaceChildren();
      const q = query.trim().toLowerCase();
      const filtered = q ? embedded.entries.filter((entry) => {
        const haystack = [
          entry.comment,
          ...entry.key,
          ...entry.keysecondary,
          entry.content
        ].join(`
`).toLowerCase();
        return haystack.includes(q);
      }) : embedded.entries;
      if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "clb-picker-empty";
        empty.textContent = "No matching entries.";
        entriesContainer.appendChild(empty);
        return;
      }
      filtered.forEach((entry, idx) => {
        const card = document.createElement("div");
        card.className = "clb-preview-entry";
        if (entry.disabled)
          card.classList.add("clb-preview-entry-disabled");
        const head = document.createElement("div");
        head.className = "clb-preview-entry-head";
        const title = document.createElement("span");
        title.className = "clb-preview-entry-title";
        title.textContent = entry.comment || `Entry #${idx + 1}`;
        head.appendChild(title);
        const badges = document.createElement("div");
        badges.className = "clb-preview-badges";
        const addBadge = (label, extraClass) => {
          const b = document.createElement("span");
          b.className = extraClass ? `clb-preview-badge ${extraClass}` : "clb-preview-badge";
          b.textContent = label;
          badges.appendChild(b);
        };
        if (entry.disabled)
          addBadge("Disabled", "clb-preview-badge-disabled");
        if (entry.constant)
          addBadge("Constant", "clb-preview-badge-constant");
        if (entry.selective)
          addBadge("Selective");
        if (entry.use_regex)
          addBadge("Regex");
        addBadge(POSITION_LABELS[entry.position] ?? `Pos ${entry.position}`);
        addBadge(`Order ${entry.order_value}`);
        head.appendChild(badges);
        card.appendChild(head);
        if (entry.key.length > 0 || entry.keysecondary.length > 0) {
          const keysRow = document.createElement("div");
          keysRow.className = "clb-preview-keys";
          if (entry.key.length > 0) {
            const label = document.createElement("span");
            label.textContent = "Keys:";
            keysRow.appendChild(label);
            for (const k of entry.key) {
              const chip = document.createElement("span");
              chip.className = "clb-preview-key-chip";
              chip.textContent = k;
              keysRow.appendChild(chip);
            }
          }
          if (entry.keysecondary.length > 0) {
            const label2 = document.createElement("span");
            label2.textContent = "Secondary:";
            keysRow.appendChild(label2);
            for (const k of entry.keysecondary) {
              const chip = document.createElement("span");
              chip.className = "clb-preview-key-chip";
              chip.textContent = k;
              keysRow.appendChild(chip);
            }
          }
          card.appendChild(keysRow);
        }
        const contentEl = document.createElement("div");
        contentEl.className = "clb-preview-content";
        contentEl.textContent = entry.content || "(empty content)";
        card.appendChild(contentEl);
        entriesContainer.appendChild(card);
      });
    };
    searchInput.addEventListener("input", () => {
      renderEntries(searchInput.value);
    });
    renderEntries("");
    modal.root.appendChild(container);
  }
  function openAttachPicker(anchorBtn, member) {
    const wasSameAnchor = activePopoverEl !== null && activePopoverEl.dataset.characterId === member.characterId;
    closePopover();
    if (wasSameAnchor)
      return;
    const books = state?.availableWorldBooks ?? [];
    const attachedSet = new Set(member.attachedBookIds);
    const popover = document.createElement("div");
    popover.className = "clb-picker-popover";
    popover.dataset.characterId = member.characterId;
    const search = document.createElement("input");
    search.type = "search";
    search.className = "clb-picker-search";
    search.placeholder = "Search World Books...";
    popover.appendChild(search);
    const list = document.createElement("div");
    list.className = "clb-picker-list";
    popover.appendChild(list);
    const renderList = (query) => {
      list.replaceChildren();
      const q = query.trim().toLowerCase();
      const filtered = q ? books.filter((b) => b.name.toLowerCase().includes(q)) : books;
      if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "clb-picker-empty";
        empty.textContent = books.length === 0 ? "No World Books available" : "No matching World Books";
        list.appendChild(empty);
        return;
      }
      for (const book of filtered) {
        const isAttached = attachedSet.has(book.id);
        const item = document.createElement("button");
        item.type = "button";
        item.className = isAttached ? "clb-picker-item clb-picker-item-attached" : "clb-picker-item";
        const check = document.createElement("span");
        check.className = "clb-picker-item-check";
        check.textContent = isAttached ? "✓" : "";
        item.appendChild(check);
        const name = document.createElement("span");
        name.className = "clb-picker-item-name";
        name.textContent = book.name;
        item.appendChild(name);
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const { chatId, characterId } = getActiveIds();
          if (isAttached) {
            attachedSet.delete(book.id);
            sendToBackend({
              type: "unlink_book",
              requestId: nextRequestId(),
              characterId: member.characterId,
              worldBookId: book.id,
              chatId,
              activeCharacterId: characterId
            });
          } else {
            attachedSet.add(book.id);
            sendToBackend({
              type: "attach_book",
              requestId: nextRequestId(),
              characterId: member.characterId,
              worldBookId: book.id,
              chatId,
              activeCharacterId: characterId
            });
          }
          renderList(search.value);
        });
        list.appendChild(item);
      }
    };
    search.addEventListener("input", () => renderList(search.value));
    renderList("");
    document.body.appendChild(popover);
    activePopoverEl = popover;
    const rect = anchorBtn.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    let left = rect.right - popRect.width;
    if (left < 8)
      left = Math.min(rect.left, viewportW - popRect.width - 8);
    if (left + popRect.width > viewportW - 8)
      left = viewportW - popRect.width - 8;
    left = Math.max(8, left);
    let top = rect.bottom + 6;
    if (top + popRect.height > viewportH - 8) {
      const aboveTop = rect.top - popRect.height - 6;
      top = aboveTop >= 8 ? aboveTop : Math.max(8, viewportH - popRect.height - 8);
    }
    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
    setTimeout(() => {
      if (!disposed && activePopoverEl === popover) {
        search.focus();
      }
    }, 0);
  }
  function renderMemberContent(member, isGroup, canEdit, showAttachInMemberHeader) {
    const block = document.createElement("div");
    block.className = "clb-member-block";
    if (isGroup)
      block.classList.add("clb-member-group-item");
    if (isGroup && !member.isLoreActiveInGroup)
      block.classList.add("clb-member-dimmed");
    if (isGroup || showAttachInMemberHeader) {
      const memberHeader = document.createElement("div");
      memberHeader.className = "clb-member-header";
      const nameEl = document.createElement("span");
      nameEl.className = "clb-member-name";
      nameEl.textContent = member.characterName;
      memberHeader.appendChild(nameEl);
      const tagsEl = document.createElement("div");
      tagsEl.className = "clb-member-tags";
      if (isGroup && member.isActiveSpeaker) {
        const tag = document.createElement("span");
        tag.className = "clb-tag clb-tag-active";
        tag.textContent = "Active";
        tagsEl.appendChild(tag);
      }
      if (isGroup && member.isMuted) {
        const tag = document.createElement("span");
        tag.className = "clb-tag clb-tag-muted";
        tag.textContent = "Muted";
        tagsEl.appendChild(tag);
      }
      if (isGroup && !member.isLoreActiveInGroup) {
        const tag = document.createElement("span");
        tag.className = "clb-tag";
        tag.textContent = "Inactive in mode";
        tagsEl.appendChild(tag);
      }
      memberHeader.appendChild(tagsEl);
      if (showAttachInMemberHeader) {
        const attachBtn = createAttachButton(member, canEdit);
        memberHeader.appendChild(attachBtn);
      }
      block.appendChild(memberHeader);
    }
    if (member.attachedBooks.length > 0) {
      const pills = document.createElement("div");
      pills.className = "clb-pills";
      for (const book of member.attachedBooks) {
        const pill = document.createElement("span");
        pill.className = book.missing ? "clb-pill clb-pill-missing" : "clb-pill";
        const nameBtn = document.createElement("button");
        nameBtn.type = "button";
        nameBtn.className = "clb-pill-name";
        nameBtn.textContent = book.name;
        nameBtn.disabled = book.missing || !state?.permissions.world_books;
        nameBtn.title = book.missing ? "World Book not found" : state?.permissions.world_books ? "Open in World Book editor" : "Approve world_books permission to open editor";
        nameBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!book.missing)
            openBookInEditor(book.id);
        });
        pill.appendChild(nameBtn);
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "clb-pill-remove";
        removeBtn.disabled = !canEdit || busyActions.has(`unlink:${member.characterId}:${book.id}`);
        removeBtn.title = "Unlink World Book from character";
        removeBtn.setAttribute("aria-label", `Unlink ${book.name}`);
        removeBtn.appendChild(createCloseIcon(10));
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const key = `unlink:${member.characterId}:${book.id}`;
          busyActions.add(key);
          const { chatId, characterId } = getActiveIds();
          sendToBackend({
            type: "unlink_book",
            requestId: nextRequestId(),
            characterId: member.characterId,
            worldBookId: book.id,
            chatId,
            activeCharacterId: characterId
          });
          renderSection();
        });
        pill.appendChild(removeBtn);
        pills.appendChild(pill);
      }
      block.appendChild(pills);
    } else {
      const hint = document.createElement("span");
      hint.className = "clb-hint";
      hint.textContent = "No world books attached";
      block.appendChild(hint);
    }
    if (member.embeddedBook && member.embeddedBook.entryCount > 0) {
      const emb = member.embeddedBook;
      const bar = document.createElement("div");
      bar.className = "clb-embedded-bar";
      const iconWrap = document.createElement("span");
      iconWrap.className = "clb-embedded-icon";
      iconWrap.appendChild(createNotebookIcon(14));
      bar.appendChild(iconWrap);
      const info = document.createElement("div");
      info.className = "clb-embedded-info";
      const title = document.createElement("span");
      title.className = "clb-embedded-title";
      title.textContent = emb.name ? `Embedded: ${emb.name}` : "Embedded Lorebook";
      info.appendChild(title);
      const meta = document.createElement("span");
      meta.className = "clb-embedded-meta";
      const statusText = emb.status === "linked" ? "Linked" : emb.status === "imported_unlinked" ? "Imported (unlinked)" : "Embedded only";
      meta.textContent = `${emb.entryCount} ${emb.entryCount === 1 ? "entry" : "entries"} • ${statusText}`;
      info.appendChild(meta);
      bar.appendChild(info);
      const actions = document.createElement("div");
      actions.className = "clb-embedded-actions";
      const previewBtn = document.createElement("button");
      previewBtn.type = "button";
      previewBtn.className = "clb-btn";
      previewBtn.textContent = "Preview";
      previewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEmbeddedPreviewModal(member, emb);
      });
      actions.appendChild(previewBtn);
      if (emb.status === "linked" && emb.linkedBookId) {
        const openBtn = document.createElement("button");
        openBtn.type = "button";
        openBtn.className = "clb-btn clb-btn-primary";
        openBtn.textContent = "Open";
        openBtn.disabled = !state?.permissions.world_books;
        openBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openBookInEditor(emb.linkedBookId);
        });
        actions.appendChild(openBtn);
      } else if (emb.status === "imported_unlinked" && emb.importedBookId) {
        const relinkBtn = document.createElement("button");
        relinkBtn.type = "button";
        relinkBtn.className = "clb-btn clb-btn-primary";
        relinkBtn.textContent = "Re-link";
        relinkBtn.disabled = !canEdit;
        relinkBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const { chatId, characterId } = getActiveIds();
          sendToBackend({
            type: "relink_book",
            requestId: nextRequestId(),
            characterId: member.characterId,
            worldBookId: emb.importedBookId,
            chatId,
            activeCharacterId: characterId
          });
        });
        actions.appendChild(relinkBtn);
        const openExistingBtn = document.createElement("button");
        openExistingBtn.type = "button";
        openExistingBtn.className = "clb-btn";
        openExistingBtn.textContent = "Open";
        openExistingBtn.disabled = !state?.permissions.world_books;
        openExistingBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openBookInEditor(emb.importedBookId);
        });
        actions.appendChild(openExistingBtn);
      } else {
        const isImporting = importingCharacters.has(member.characterId);
        const importBtn = document.createElement("button");
        importBtn.type = "button";
        importBtn.className = "clb-btn clb-btn-dashed";
        importBtn.textContent = isImporting ? "Importing..." : "Import & Link";
        importBtn.disabled = !canEdit || isImporting;
        importBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          importingCharacters.add(member.characterId);
          const { chatId, characterId } = getActiveIds();
          sendToBackend({
            type: "import_character_book",
            requestId: nextRequestId(),
            characterId: member.characterId,
            chatId,
            activeCharacterId: characterId
          });
          renderSection();
        });
        actions.appendChild(importBtn);
      }
      bar.appendChild(actions);
      block.appendChild(bar);
    }
    return block;
  }
  function createAttachButton(member, canEdit) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "clb-attach-btn";
    btn.disabled = !canEdit;
    btn.title = canEdit ? `Attach World Books to ${member.characterName}` : "Approve permissions to attach World Books";
    btn.appendChild(createPlusIcon(11));
    const span = document.createElement("span");
    span.textContent = "Attach";
    btn.appendChild(span);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openAttachPicker(btn, member);
    });
    return btn;
  }
  function buildPermissionBanner(missing) {
    const banner = document.createElement("div");
    banner.className = "clb-perm-banner";
    const text = document.createElement("span");
    text.className = "clb-perm-text";
    text.textContent = `Read-only preview (missing: ${missing.join(", ")})`;
    banner.appendChild(text);
    if (typeof ctx.permissions?.request === "function") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "clb-perm-btn";
      btn.textContent = "Grant";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        requestPermissions();
      });
      banner.appendChild(btn);
    }
    return banner;
  }
  function renderBodyContent(target, isMobile) {
    const current = state;
    if (!current) {
      const loading = document.createElement("span");
      loading.className = "clb-hint";
      loading.textContent = "Loading character lorebooks...";
      target.appendChild(loading);
      return;
    }
    const canEdit = current.source === "backend" && current.permissions.characters && current.permissions.world_books;
    if (!current.permissions.allGranted) {
      target.appendChild(buildPermissionBanner(current.permissions.missing));
    }
    if (current.error) {
      const errEl = document.createElement("div");
      errEl.className = "clb-status-msg clb-status-error";
      errEl.textContent = current.error;
      target.appendChild(errEl);
    }
    if (statusNotice) {
      const noticeEl = document.createElement("div");
      noticeEl.className = statusNotice.isError ? "clb-status-msg clb-status-error" : "clb-status-msg";
      noticeEl.textContent = statusNotice.text;
      target.appendChild(noticeEl);
    }
    if (current.members.length === 0) {
      const empty = document.createElement("span");
      empty.className = "clb-hint";
      empty.textContent = current.chatId || current.activeCharacterId ? "No character data available" : "Open a character chat to manage its lorebooks";
      target.appendChild(empty);
      return;
    }
    const isGroup = Boolean(current.group?.isGroup && current.members.length > 0);
    const soloMember = !isGroup && current.members.length === 1 ? current.members[0] : null;
    if (isMobile && soloMember) {
      const actionsRow = document.createElement("div");
      actionsRow.className = "clb-accordion-actions";
      const charName = document.createElement("span");
      charName.className = "clb-member-name";
      charName.textContent = soloMember.characterName;
      actionsRow.appendChild(charName);
      actionsRow.appendChild(createAttachButton(soloMember, canEdit));
      target.appendChild(actionsRow);
    }
    const list = document.createElement("div");
    list.className = "clb-members-list";
    for (const member of current.members) {
      const showMemberAttach = isGroup;
      list.appendChild(renderMemberContent(member, isGroup, canEdit, showMemberAttach));
    }
    target.appendChild(list);
  }
  function detectIsMobile() {
    const tabRoot = document.querySelector('[data-spindle-drawer-tab="lorebook"]');
    if (!tabRoot)
      return false;
    const panel = tabRoot.querySelector('[class*="panel"]');
    const panelScroll = tabRoot.querySelector('[class*="panelScroll"]');
    return Boolean(panel?.matches('[class*="panelMobile"]') || panelScroll?.querySelector('[class*="attachmentAccordion"]'));
  }
  function renderSection() {
    if (disposed || !sectionEl)
      return;
    isApplyingDom = true;
    try {
      const isMobile = detectIsMobile();
      lastIsMobile = isMobile;
      sectionEl.replaceChildren();
      const current = state;
      const members = current?.members ?? [];
      const isGroup = Boolean(current?.group?.isGroup);
      const soloMember = !isGroup && members.length === 1 ? members[0] : null;
      const canEdit = Boolean(current && current.source === "backend" && current.permissions.characters && current.permissions.world_books);
      if (isMobile) {
        sectionEl.className = mobileCollapsed ? "clb-accordion" : "clb-accordion clb-accordion-expanded";
        const headerBtn = document.createElement("button");
        headerBtn.type = "button";
        headerBtn.className = "clb-accordion-header";
        headerBtn.setAttribute("aria-expanded", String(!mobileCollapsed));
        headerBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          mobileCollapsed = !mobileCollapsed;
          renderSection();
        });
        const start = document.createElement("span");
        start.className = "clb-accordion-start";
        const badge = document.createElement("span");
        badge.className = "clb-accordion-icon-badge";
        badge.appendChild(createBookUserIcon(12));
        start.appendChild(badge);
        const label = document.createElement("span");
        label.className = "clb-accordion-label";
        label.textContent = isGroup ? "Group Lorebooks" : "Character";
        start.appendChild(label);
        const attachedCount = members.reduce((sum, m) => sum + m.attachedBooks.length, 0);
        const countPill = document.createElement("span");
        countPill.className = "clb-accordion-count";
        countPill.textContent = String(attachedCount);
        start.appendChild(countPill);
        headerBtn.appendChild(start);
        const preview = document.createElement("span");
        preview.className = "clb-accordion-preview";
        const allBookNames = members.flatMap((m) => m.attachedBooks.map((b) => b.name));
        const hasEmbedded = members.some((m) => Boolean(m.embeddedBook));
        if (allBookNames.length > 0) {
          for (const name of allBookNames.slice(0, 2)) {
            const chip = document.createElement("span");
            chip.className = "clb-accordion-preview-chip";
            chip.textContent = name;
            preview.appendChild(chip);
          }
          if (allBookNames.length > 2) {
            const more = document.createElement("span");
            more.className = "clb-accordion-preview-chip";
            more.textContent = `+${allBookNames.length - 2}`;
            preview.appendChild(more);
          }
        } else if (hasEmbedded) {
          const chip = document.createElement("span");
          chip.className = "clb-accordion-preview-chip";
          chip.textContent = "Embedded";
          preview.appendChild(chip);
        } else {
          const empty = document.createElement("span");
          empty.className = "clb-accordion-preview-empty";
          empty.textContent = current?.chatId || current?.activeCharacterId ? "None attached" : "No character";
          preview.appendChild(empty);
        }
        headerBtn.appendChild(preview);
        const chevron = document.createElement("span");
        chevron.className = "clb-accordion-chevron";
        chevron.appendChild(createChevronIcon(mobileCollapsed, 14));
        headerBtn.appendChild(chevron);
        sectionEl.appendChild(headerBtn);
        if (!mobileCollapsed) {
          const body = document.createElement("div");
          body.className = "clb-accordion-body";
          renderBodyContent(body, true);
          sectionEl.appendChild(body);
        }
      } else {
        const disabled = current ? !current.chatId && !current.activeCharacterId : false;
        sectionEl.className = disabled ? "clb-section clb-section-disabled" : "clb-section";
        const header = document.createElement("div");
        header.className = "clb-header";
        const iconWrap = document.createElement("span");
        iconWrap.className = "clb-header-icon";
        iconWrap.appendChild(createBookUserIcon(12));
        header.appendChild(iconWrap);
        const title = document.createElement("span");
        title.className = "clb-header-title";
        title.textContent = soloMember ? `Character: ${soloMember.characterName}` : isGroup ? "Character Lorebooks" : "Character Lorebooks";
        header.appendChild(title);
        if (isGroup && current?.group) {
          const modeBadge = document.createElement("span");
          modeBadge.className = "clb-group-badge";
          modeBadge.textContent = formatGroupModeLabel(current.group);
          header.appendChild(modeBadge);
        }
        if (soloMember) {
          header.appendChild(createAttachButton(soloMember, canEdit));
        }
        sectionEl.appendChild(header);
        renderBodyContent(sectionEl, false);
      }
    } finally {
      isApplyingDom = false;
    }
  }
  function attachTabObserver(tabRoot) {
    if (observedTabRoot === tabRoot && tabObserver)
      return;
    if (tabObserver) {
      tabObserver.disconnect();
      tabObserver = null;
    }
    observedTabRoot = tabRoot;
    tabObserver = new MutationObserver((mutations) => {
      if (disposed || isApplyingDom)
        return;
      const relevant = mutations.some((m) => {
        if (sectionEl && (m.target === sectionEl || sectionEl.contains(m.target))) {
          return false;
        }
        return true;
      });
      if (relevant)
        scheduleSyncDom();
    });
    tabObserver.observe(tabRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  }
  function syncDom() {
    if (disposed)
      return;
    const tabRoot = document.querySelector('[data-spindle-drawer-tab="lorebook"]');
    if (!tabRoot)
      return;
    attachTabObserver(tabRoot);
    if (bodyObserver) {
      bodyObserver.disconnect();
      bodyObserver = null;
    }
    const panelScroll = tabRoot.querySelector('[class*="panelScroll"]');
    if (!panelScroll)
      return;
    const existing = panelScroll.querySelector(`[${SECTION_ATTR}="true"]`);
    if (existing instanceof HTMLDivElement && existing !== sectionEl) {
      existing.remove();
    }
    if (!sectionEl) {
      sectionEl = document.createElement("div");
      sectionEl.setAttribute(SECTION_ATTR, "true");
    }
    const wiSettings = panelScroll.querySelector('[class*="wiSettingsSection"]');
    isApplyingDom = true;
    try {
      if (wiSettings) {
        if (sectionEl.parentElement !== panelScroll || sectionEl.nextElementSibling !== wiSettings) {
          panelScroll.insertBefore(sectionEl, wiSettings);
        }
      } else if (sectionEl.parentElement !== panelScroll) {
        panelScroll.appendChild(sectionEl);
      }
    } finally {
      isApplyingDom = false;
    }
    const currentIsMobile = detectIsMobile();
    if (sectionEl.childElementCount === 0 || lastIsMobile !== currentIsMobile) {
      renderSection();
    }
  }
  function scheduleSyncDom() {
    if (disposed || syncScheduled)
      return;
    syncScheduled = true;
    queueMicrotask(() => {
      syncScheduled = false;
      syncDom();
    });
  }
  function startBodyObserver() {
    if (disposed || bodyObserver)
      return;
    const drawerRoot = document.querySelector('[data-lumiverse-surface="viewport-drawer"]') ?? document.body;
    bodyObserver = new MutationObserver(() => {
      if (disposed)
        return;
      if (document.querySelector('[data-spindle-drawer-tab="lorebook"]')) {
        scheduleSyncDom();
      }
    });
    bodyObserver.observe(drawerRoot, { childList: true, subtree: true });
  }
  unsubs.push(ctx.onBackendMessage((rawPayload) => {
    if (disposed || !isRecord(rawPayload) || typeof rawPayload.type !== "string") {
      return;
    }
    const msg = rawPayload;
    if (msg.type === "state") {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      const perms = msg.state.permissions;
      if (!perms.characters || !perms.world_books) {
        loadFrontendFallback(perms);
        return;
      }
      state = msg.state;
      renderSection();
      return;
    }
    if (msg.type === "permission_status") {
      if (!msg.permissions.characters || !msg.permissions.world_books) {
        loadFrontendFallback(msg.permissions);
      } else {
        scheduleRefresh(20);
      }
      return;
    }
    if (msg.type === "action_result") {
      if (msg.action === "import_character_book") {
        importingCharacters.delete(msg.characterId);
      }
      if (msg.action === "unlink_book" && msg.worldBookId) {
        busyActions.delete(`unlink:${msg.characterId}:${msg.worldBookId}`);
      }
      if (msg.state) {
        const perms = msg.state.permissions;
        if (!perms.characters || !perms.world_books) {
          loadFrontendFallback(perms);
        } else {
          state = msg.state;
        }
      }
      if (msg.ok) {
        if (msg.message)
          showStatus(msg.message, false);
        else
          renderSection();
      } else {
        showStatus(msg.error || "Operation failed.", true);
      }
    }
  }));
  if (ctx.state) {
    unsubs.push(ctx.state.subscribe("chat.active", () => {
      closePopover();
      scheduleRefresh(40);
    }));
    unsubs.push(ctx.state.subscribe("ui.drawer", () => {
      scheduleSyncDom();
    }));
  }
  if (ctx.ui?.events) {
    unsubs.push(ctx.ui.events.onDrawerChange((drawer) => {
      if (drawer.open && drawer.tabId === "lorebook") {
        scheduleSyncDom();
        scheduleRefresh(30);
      }
    }));
  }
  const refreshEvents = [
    "CHAT_SWITCHED",
    "CHAT_CHANGED",
    "CHARACTER_EDITED",
    "CHARACTER_DELETED",
    "WORLD_BOOK_CHANGED",
    "WORLD_BOOK_DELETED"
  ];
  for (const eventName of refreshEvents) {
    unsubs.push(ctx.events.on(eventName, () => {
      scheduleRefresh(60);
    }));
  }
  const onDocumentMouseDown = (e) => {
    if (!activePopoverEl)
      return;
    const target = e.target;
    if (target && !activePopoverEl.contains(target) && !(target instanceof Element && target.closest(".clb-attach-btn"))) {
      closePopover();
    }
  };
  const onDocumentKeyDown = (e) => {
    if (e.key === "Escape" && activePopoverEl) {
      closePopover();
    }
  };
  document.addEventListener("mousedown", onDocumentMouseDown);
  document.addEventListener("keydown", onDocumentKeyDown);
  unsubs.push(() => {
    document.removeEventListener("mousedown", onDocumentMouseDown);
    document.removeEventListener("keydown", onDocumentKeyDown);
  });
  ctx.ready();
  startBodyObserver();
  syncDom();
  requestState();
  return () => {
    disposed = true;
    if (statusTimer)
      clearTimeout(statusTimer);
    if (fallbackTimer)
      clearTimeout(fallbackTimer);
    if (refreshDebounceTimer)
      clearTimeout(refreshDebounceTimer);
    if (bodyObserver) {
      bodyObserver.disconnect();
      bodyObserver = null;
    }
    if (tabObserver) {
      tabObserver.disconnect();
      tabObserver = null;
    }
    for (const unsub of unsubs) {
      try {
        unsub();
      } catch {}
    }
    closePopover();
    if (activeModalHandle) {
      try {
        activeModalHandle.dismiss();
      } catch {}
      activeModalHandle = null;
    }
    if (sectionEl) {
      sectionEl.remove();
      sectionEl = null;
    }
    removeStyle();
  };
}
export {
  setup
};
