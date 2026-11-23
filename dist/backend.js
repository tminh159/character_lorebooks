// @bun
// character_lorebooks/repo/src/shared.ts
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

// character_lorebooks/repo/src/backend.ts
var trackedSessions = new Map;
function getPermissionStatus() {
  const characters = spindle.permissions.has("characters");
  const world_books = spindle.permissions.has("world_books");
  const chats = spindle.permissions.has("chats");
  const missing = [];
  if (!characters)
    missing.push("characters");
  if (!world_books)
    missing.push("world_books");
  if (!chats)
    missing.push("chats");
  return {
    characters,
    world_books,
    chats,
    allGranted: missing.length === 0,
    missing
  };
}
function send(msg, userId) {
  spindle.sendToFrontend(msg, userId);
}
function resolveGroupCardMode(chat) {
  const raw = isRecord(chat.metadata) ? chat.metadata.group_card_mode : undefined;
  return raw === "merge_ignore_muted" || raw === "merge" ? raw : "swap";
}
function resolveGroupLorebookMode(chat) {
  const raw = isRecord(chat.metadata) ? chat.metadata.group_lorebook_mode : undefined;
  return raw === "active_character" || raw === "all_unmuted" || raw === "all" ? raw : "follow_card_mode";
}
function resolveEffectiveGroupLorebookMode(cardMode, lorebookMode) {
  if (lorebookMode !== "follow_card_mode")
    return lorebookMode;
  switch (cardMode) {
    case "merge":
      return "all";
    case "merge_ignore_muted":
      return "all_unmuted";
    case "swap":
    default:
      return "active_character";
  }
}
function getOrderedStringIds(raw) {
  if (!Array.isArray(raw))
    return [];
  const seen = new Set;
  const out = [];
  for (const item of raw) {
    if (typeof item !== "string")
      continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed))
      continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}
async function listAllWorldBooks(userId) {
  const all = [];
  let offset = 0;
  const limit = 200;
  while (true) {
    const page = await spindle.world_books.list({ limit, offset, userId });
    all.push(...page.data);
    if (page.data.length < limit || all.length >= page.total) {
      break;
    }
    offset += page.data.length;
  }
  return all;
}
async function buildState(userId, requestedChatId, requestedCharacterId) {
  const permissions = getPermissionStatus();
  let chatId = requestedChatId ?? null;
  let activeCharacterId = requestedCharacterId ?? null;
  let groupInfo = null;
  let chat = null;
  if (permissions.chats) {
    try {
      if (chatId) {
        chat = await spindle.chats.get(chatId, userId);
      } else if (requestedChatId === undefined) {
        chat = await spindle.chats.getActive(userId);
      }
      if (chat) {
        chatId = chat.id;
        if (!activeCharacterId) {
          activeCharacterId = chat.character_id || null;
        }
      }
    } catch {
      chat = null;
    }
  }
  if (!permissions.characters || !permissions.world_books) {
    return {
      source: "backend",
      permissions,
      chatId,
      activeCharacterId,
      group: null,
      members: [],
      availableWorldBooks: [],
      error: null
    };
  }
  const worldBooks = await listAllWorldBooks(userId);
  worldBooks.sort((a, b) => a.name.localeCompare(b.name));
  let memberIds = [];
  let mutedIds = new Set;
  const isGroup = chat !== null && isRecord(chat.metadata) && (chat.metadata.group === true || chat.metadata.group === 1);
  if (chat && isGroup) {
    const groupCardMode = resolveGroupCardMode(chat);
    const groupLorebookMode = resolveGroupLorebookMode(chat);
    const effectiveLorebookMode = resolveEffectiveGroupLorebookMode(groupCardMode, groupLorebookMode);
    groupInfo = {
      isGroup: true,
      groupCardMode,
      groupLorebookMode,
      effectiveLorebookMode
    };
    const rawMembers = getOrderedStringIds(chat.metadata.character_ids);
    mutedIds = new Set(getOrderedStringIds(chat.metadata.muted_character_ids));
    memberIds = rawMembers.length > 0 ? rawMembers : activeCharacterId ? [activeCharacterId] : [];
  } else if (activeCharacterId) {
    memberIds = [activeCharacterId];
  }
  const loadedCharacters = await Promise.all(memberIds.map(async (id) => {
    try {
      return await spindle.characters.get(id, userId);
    } catch {
      return null;
    }
  }));
  const members = [];
  for (const char of loadedCharacters) {
    if (!char)
      continue;
    const isActiveSpeaker = activeCharacterId ? char.id === activeCharacterId : false;
    const isMuted = mutedIds.has(char.id);
    let isLoreActiveInGroup = true;
    if (groupInfo) {
      if (groupInfo.effectiveLorebookMode === "active_character") {
        isLoreActiveInGroup = isActiveSpeaker;
      } else if (groupInfo.effectiveLorebookMode === "all_unmuted") {
        isLoreActiveInGroup = !isMuted;
      } else {
        isLoreActiveInGroup = true;
      }
    }
    members.push(buildMemberState(char, worldBooks, {
      isActiveSpeaker,
      isMuted,
      isLoreActiveInGroup
    }));
  }
  return {
    source: "backend",
    permissions,
    chatId,
    activeCharacterId,
    group: groupInfo,
    members,
    availableWorldBooks: worldBooks.map(toWorldBookSummary),
    error: null
  };
}
async function handleAttachOrRelink(action, characterId, worldBookId, userId, chatId, activeCharacterId, requestId) {
  const perms = getPermissionStatus();
  if (!perms.characters || !perms.world_books) {
    send({
      type: "action_result",
      requestId,
      ok: false,
      action,
      characterId,
      worldBookId,
      error: `Missing required permissions: ${perms.missing.join(", ")}`
    }, userId);
    return;
  }
  const [character, book] = await Promise.all([
    spindle.characters.get(characterId, userId),
    spindle.world_books.get(worldBookId, userId)
  ]);
  if (!character) {
    send({
      type: "action_result",
      requestId,
      ok: false,
      action,
      characterId,
      worldBookId,
      error: "Character not found."
    }, userId);
    return;
  }
  if (!book) {
    send({
      type: "action_result",
      requestId,
      ok: false,
      action,
      characterId,
      worldBookId,
      error: "World Book not found."
    }, userId);
    return;
  }
  const currentIds = getCharacterWorldBookIds(character);
  if (!currentIds.includes(worldBookId)) {
    await spindle.characters.update(characterId, { world_book_ids: [...currentIds, worldBookId] }, userId);
  }
  const state = await buildState(userId, chatId, activeCharacterId ?? characterId);
  send({
    type: "action_result",
    requestId,
    ok: true,
    action,
    characterId,
    worldBookId: book.id,
    worldBookName: book.name,
    message: action === "relink_book" ? `Re-linked "${book.name}" to ${character.name}` : `Attached "${book.name}" to ${character.name}`,
    state
  }, userId);
}
async function handleUnlink(characterId, worldBookId, userId, chatId, activeCharacterId, requestId) {
  const perms = getPermissionStatus();
  if (!perms.characters) {
    send({
      type: "action_result",
      requestId,
      ok: false,
      action: "unlink_book",
      characterId,
      worldBookId,
      error: "Missing characters permission."
    }, userId);
    return;
  }
  const character = await spindle.characters.get(characterId, userId);
  if (!character) {
    send({
      type: "action_result",
      requestId,
      ok: false,
      action: "unlink_book",
      characterId,
      worldBookId,
      error: "Character not found."
    }, userId);
    return;
  }
  const currentIds = getCharacterWorldBookIds(character);
  const nextIds = currentIds.filter((id) => id !== worldBookId);
  await spindle.characters.update(characterId, { world_book_ids: nextIds }, userId);
  const state = await buildState(userId, chatId, activeCharacterId ?? characterId);
  send({
    type: "action_result",
    requestId,
    ok: true,
    action: "unlink_book",
    characterId,
    worldBookId,
    message: `Unlinked World Book from ${character.name}`,
    state
  }, userId);
}
async function handleImportCharacterBook(characterId, userId, chatId, activeCharacterId, requestId) {
  const perms = getPermissionStatus();
  if (!perms.characters || !perms.world_books) {
    send({
      type: "action_result",
      requestId,
      ok: false,
      action: "import_character_book",
      characterId,
      error: `Missing required permissions: ${perms.missing.join(", ")}`
    }, userId);
    return;
  }
  const character = await spindle.characters.get(characterId, userId);
  if (!character) {
    send({
      type: "action_result",
      requestId,
      ok: false,
      action: "import_character_book",
      characterId,
      error: "Character not found."
    }, userId);
    return;
  }
  const extracted = extractRawCharacterBook(character.extensions);
  if (!extracted) {
    send({
      type: "action_result",
      requestId,
      ok: false,
      action: "import_character_book",
      characterId,
      error: "This character does not have an embedded lorebook with entries."
    }, userId);
    return;
  }
  const normalizedEntries = normalizeEmbeddedEntries(extracted.rawEntries);
  if (normalizedEntries.length === 0) {
    send({
      type: "action_result",
      requestId,
      ok: false,
      action: "import_character_book",
      characterId,
      error: "No embedded lorebook entries found."
    }, userId);
    return;
  }
  const currentIds = getCharacterWorldBookIds(character);
  const worldBooks = await listAllWorldBooks(userId);
  const existing = findBestImportedCharacterBook(worldBooks, characterId, currentIds);
  if (existing) {
    if (!currentIds.includes(existing.id)) {
      await spindle.characters.update(characterId, { world_book_ids: [...currentIds, existing.id] }, userId);
    }
    const state = await buildState(userId, chatId, activeCharacterId ?? characterId);
    send({
      type: "action_result",
      requestId,
      ok: true,
      action: "import_character_book",
      characterId,
      worldBookId: existing.id,
      worldBookName: existing.name,
      entryCount: normalizedEntries.length,
      deduplicated: true,
      message: `Linked existing imported lorebook "${existing.name}"`,
      state
    }, userId);
    return;
  }
  const bookName = extracted.name || `${character.name}'s Lorebook`;
  const bookDescription = extracted.description || `Imported from ${character.name} at ${new Date().toLocaleString()}`;
  const createdBook = await spindle.world_books.create({
    name: bookName,
    description: bookDescription,
    metadata: {
      source: "character",
      source_character_id: characterId,
      auto_managed_by_character: false
    }
  }, userId);
  for (const entryInput of normalizedEntries) {
    await spindle.world_books.entries.create(createdBook.id, entryInput, userId);
  }
  if (!currentIds.includes(createdBook.id)) {
    await spindle.characters.update(characterId, { world_book_ids: [...currentIds, createdBook.id] }, userId);
  }
  const state = await buildState(userId, chatId, activeCharacterId ?? characterId);
  send({
    type: "action_result",
    requestId,
    ok: true,
    action: "import_character_book",
    characterId,
    worldBookId: createdBook.id,
    worldBookName: createdBook.name,
    entryCount: normalizedEntries.length,
    deduplicated: false,
    message: `Imported ${normalizedEntries.length} entries into "${createdBook.name}"`,
    state
  }, userId);
}
spindle.permissions.onChanged(async () => {
  const permissions = getPermissionStatus();
  if (trackedSessions.size === 0) {
    send({ type: "permission_status", permissions });
    return;
  }
  for (const [userId, ctx] of trackedSessions.entries()) {
    send({ type: "permission_status", permissions }, userId);
    try {
      const state = await buildState(userId, ctx.chatId, ctx.characterId);
      send({ type: "state", state }, userId);
    } catch {}
  }
});
spindle.onFrontendMessage(async (rawPayload, userId) => {
  if (!isRecord(rawPayload) || typeof rawPayload.type !== "string")
    return;
  const msg = rawPayload;
  if (msg.type === "get_state") {
    trackedSessions.set(userId, {
      chatId: msg.chatId ?? null,
      characterId: msg.characterId ?? null
    });
    try {
      const state = await buildState(userId, msg.chatId, msg.characterId);
      send({ type: "state", requestId: msg.requestId, state }, userId);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      send({
        type: "state",
        requestId: msg.requestId,
        state: {
          source: "backend",
          permissions: getPermissionStatus(),
          chatId: msg.chatId ?? null,
          activeCharacterId: msg.characterId ?? null,
          group: null,
          members: [],
          availableWorldBooks: [],
          error: errMsg
        }
      }, userId);
    }
    return;
  }
  if (msg.type === "attach_book" || msg.type === "relink_book") {
    try {
      await handleAttachOrRelink(msg.type, msg.characterId, msg.worldBookId, userId, msg.chatId, msg.activeCharacterId, msg.requestId);
    } catch (err) {
      send({
        type: "action_result",
        requestId: msg.requestId,
        ok: false,
        action: msg.type,
        characterId: msg.characterId,
        worldBookId: msg.worldBookId,
        error: err instanceof Error ? err.message : String(err)
      }, userId);
    }
    return;
  }
  if (msg.type === "unlink_book") {
    try {
      await handleUnlink(msg.characterId, msg.worldBookId, userId, msg.chatId, msg.activeCharacterId, msg.requestId);
    } catch (err) {
      send({
        type: "action_result",
        requestId: msg.requestId,
        ok: false,
        action: "unlink_book",
        characterId: msg.characterId,
        worldBookId: msg.worldBookId,
        error: err instanceof Error ? err.message : String(err)
      }, userId);
    }
    return;
  }
  if (msg.type === "import_character_book") {
    try {
      await handleImportCharacterBook(msg.characterId, userId, msg.chatId, msg.activeCharacterId, msg.requestId);
    } catch (err) {
      send({
        type: "action_result",
        requestId: msg.requestId,
        ok: false,
        action: "import_character_book",
        characterId: msg.characterId,
        error: err instanceof Error ? err.message : String(err)
      }, userId);
    }
  }
});
