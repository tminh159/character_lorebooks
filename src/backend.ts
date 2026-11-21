import type {
  CharacterDTO,
  ChatDTO,
  SpindleAPI,
  WorldBookDTO,
} from "lumiverse-spindle-types";
import {
  buildMemberState,
  extractRawCharacterBook,
  findBestImportedCharacterBook,
  getCharacterWorldBookIds,
  isRecord,
  normalizeEmbeddedEntries,
  toWorldBookSummary,
  type BackendToFrontendMessage,
  type CharacterLorebookMemberState,
  type CharacterLorebooksState,
  type EffectiveGroupLorebookMode,
  type FrontendToBackendMessage,
  type GroupCardMode,
  type GroupChatInfo,
  type GroupLorebookMode,
  type PermissionStatus,
} from "./shared";

declare const spindle: SpindleAPI;

const trackedSessions = new Map<string, { chatId: string | null; characterId: string | null }>();

function getPermissionStatus(): PermissionStatus {
  const characters = spindle.permissions.has("characters");
  const world_books = spindle.permissions.has("world_books");
  const chats = spindle.permissions.has("chats");
  const missing: PermissionStatus["missing"] = [];
  if (!characters) missing.push("characters");
  if (!world_books) missing.push("world_books");
  if (!chats) missing.push("chats");
  return {
    characters,
    world_books,
    chats,
    allGranted: missing.length === 0,
    missing,
  };
}

function send(msg: BackendToFrontendMessage, userId?: string): void {
  spindle.sendToFrontend(msg, userId);
}

function resolveGroupCardMode(chat: ChatDTO): GroupCardMode {
  const raw = isRecord(chat.metadata) ? chat.metadata.group_card_mode : undefined;
  return raw === "merge_ignore_muted" || raw === "merge" ? raw : "swap";
}

function resolveGroupLorebookMode(chat: ChatDTO): GroupLorebookMode {
  const raw = isRecord(chat.metadata) ? chat.metadata.group_lorebook_mode : undefined;
  return raw === "active_character" || raw === "all_unmuted" || raw === "all"
    ? raw
    : "follow_card_mode";
}

function resolveEffectiveGroupLorebookMode(
  cardMode: GroupCardMode,
  lorebookMode: GroupLorebookMode,
): EffectiveGroupLorebookMode {
  if (lorebookMode !== "follow_card_mode") return lorebookMode;
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

function getOrderedStringIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

async function listAllWorldBooks(userId?: string): Promise<WorldBookDTO[]> {
  const all: WorldBookDTO[] = [];
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

async function buildState(
  userId?: string,
  requestedChatId?: string | null,
  requestedCharacterId?: string | null,
): Promise<CharacterLorebooksState> {
  const permissions = getPermissionStatus();
  let chatId: string | null = requestedChatId ?? null;
  let activeCharacterId: string | null = requestedCharacterId ?? null;
  let groupInfo: GroupChatInfo | null = null;
  let chat: ChatDTO | null = null;

  if (permissions.chats) {
    try {
      chat = chatId
        ? await spindle.chats.get(chatId, userId)
        : await spindle.chats.getActive(userId);
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
      error: null,
    };
  }

  const worldBooks = await listAllWorldBooks(userId);
  worldBooks.sort((a, b) => a.name.localeCompare(b.name));

  let memberIds: string[] = [];
  let mutedIds = new Set<string>();

  const isGroup =
    chat !== null &&
    isRecord(chat.metadata) &&
    (chat.metadata.group === true || chat.metadata.group === 1);

  if (chat && isGroup) {
    const groupCardMode = resolveGroupCardMode(chat);
    const groupLorebookMode = resolveGroupLorebookMode(chat);
    const effectiveLorebookMode = resolveEffectiveGroupLorebookMode(
      groupCardMode,
      groupLorebookMode,
    );
    groupInfo = {
      isGroup: true,
      groupCardMode,
      groupLorebookMode,
      effectiveLorebookMode,
    };

    const rawMembers = getOrderedStringIds(chat.metadata.character_ids);
    mutedIds = new Set(getOrderedStringIds(chat.metadata.muted_character_ids));
    memberIds = rawMembers.length > 0
      ? rawMembers
      : activeCharacterId
        ? [activeCharacterId]
        : [];
  } else if (activeCharacterId) {
    memberIds = [activeCharacterId];
  }

  const loadedCharacters = await Promise.all(
    memberIds.map(async (id) => {
      try {
        return await spindle.characters.get(id, userId);
      } catch {
        return null;
      }
    }),
  );

  const members: CharacterLorebookMemberState[] = [];
  for (const char of loadedCharacters) {
    if (!char) continue;
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

    members.push(
      buildMemberState(char, worldBooks, {
        isActiveSpeaker,
        isMuted,
        isLoreActiveInGroup,
      }),
    );
  }

  return {
    source: "backend",
    permissions,
    chatId,
    activeCharacterId,
    group: groupInfo,
    members,
    availableWorldBooks: worldBooks.map(toWorldBookSummary),
    error: null,
  };
}

async function handleAttachOrRelink(
  action: "attach_book" | "relink_book",
  characterId: string,
  worldBookId: string,
  userId: string,
  chatId?: string | null,
  activeCharacterId?: string | null,
  requestId?: string,
): Promise<void> {
  const perms = getPermissionStatus();
  if (!perms.characters || !perms.world_books) {
    send(
      {
        type: "action_result",
        requestId,
        ok: false,
        action,
        characterId,
        worldBookId,
        error: `Missing required permissions: ${perms.missing.join(", ")}`,
      },
      userId,
    );
    return;
  }

  const [character, book] = await Promise.all([
    spindle.characters.get(characterId, userId),
    spindle.world_books.get(worldBookId, userId),
  ]);

  if (!character) {
    send(
      {
        type: "action_result",
        requestId,
        ok: false,
        action,
        characterId,
        worldBookId,
        error: "Character not found.",
      },
      userId,
    );
    return;
  }

  if (!book) {
    send(
      {
        type: "action_result",
        requestId,
        ok: false,
        action,
        characterId,
        worldBookId,
        error: "World Book not found.",
      },
      userId,
    );
    return;
  }

  const currentIds = getCharacterWorldBookIds(character);
  if (!currentIds.includes(worldBookId)) {
    await spindle.characters.update(
      characterId,
      { world_book_ids: [...currentIds, worldBookId] },
      userId,
    );
  }

  const state = await buildState(userId, chatId, activeCharacterId ?? characterId);
  send(
    {
      type: "action_result",
      requestId,
      ok: true,
      action,
      characterId,
      worldBookId: book.id,
      worldBookName: book.name,
      message:
        action === "relink_book"
          ? `Re-linked "${book.name}" to ${character.name}`
          : `Attached "${book.name}" to ${character.name}`,
      state,
    },
    userId,
  );
}

async function handleUnlink(
  characterId: string,
  worldBookId: string,
  userId: string,
  chatId?: string | null,
  activeCharacterId?: string | null,
  requestId?: string,
): Promise<void> {
  const perms = getPermissionStatus();
  if (!perms.characters) {
    send(
      {
        type: "action_result",
        requestId,
        ok: false,
        action: "unlink_book",
        characterId,
        worldBookId,
        error: "Missing characters permission.",
      },
      userId,
    );
    return;
  }

  const character = await spindle.characters.get(characterId, userId);
  if (!character) {
    send(
      {
        type: "action_result",
        requestId,
        ok: false,
        action: "unlink_book",
        characterId,
        worldBookId,
        error: "Character not found.",
      },
      userId,
    );
    return;
  }

  const currentIds = getCharacterWorldBookIds(character);
  const nextIds = currentIds.filter((id) => id !== worldBookId);
  await spindle.characters.update(characterId, { world_book_ids: nextIds }, userId);

  const state = await buildState(userId, chatId, activeCharacterId ?? characterId);
  send(
    {
      type: "action_result",
      requestId,
      ok: true,
      action: "unlink_book",
      characterId,
      worldBookId,
      message: `Unlinked World Book from ${character.name}`,
      state,
    },
    userId,
  );
}

async function handleImportCharacterBook(
  characterId: string,
  userId: string,
  chatId?: string | null,
  activeCharacterId?: string | null,
  requestId?: string,
): Promise<void> {
  const perms = getPermissionStatus();
  if (!perms.characters || !perms.world_books) {
    send(
      {
        type: "action_result",
        requestId,
        ok: false,
        action: "import_character_book",
        characterId,
        error: `Missing required permissions: ${perms.missing.join(", ")}`,
      },
      userId,
    );
    return;
  }

  const character = await spindle.characters.get(characterId, userId);
  if (!character) {
    send(
      {
        type: "action_result",
        requestId,
        ok: false,
        action: "import_character_book",
        characterId,
        error: "Character not found.",
      },
      userId,
    );
    return;
  }

  const extracted = extractRawCharacterBook(character.extensions);
  if (!extracted) {
    send(
      {
        type: "action_result",
        requestId,
        ok: false,
        action: "import_character_book",
        characterId,
        error: "This character does not have an embedded lorebook with entries.",
      },
      userId,
    );
    return;
  }

  const normalizedEntries = normalizeEmbeddedEntries(extracted.rawEntries);
  if (normalizedEntries.length === 0) {
    send(
      {
        type: "action_result",
        requestId,
        ok: false,
        action: "import_character_book",
        characterId,
        error: "No embedded lorebook entries found.",
      },
      userId,
    );
    return;
  }

  const currentIds = getCharacterWorldBookIds(character);
  const worldBooks = await listAllWorldBooks(userId);
  const existing = findBestImportedCharacterBook(worldBooks, characterId, currentIds);

  if (existing) {
    if (!currentIds.includes(existing.id)) {
      await spindle.characters.update(
        characterId,
        { world_book_ids: [...currentIds, existing.id] },
        userId,
      );
    }

    const state = await buildState(userId, chatId, activeCharacterId ?? characterId);
    send(
      {
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
        state,
      },
      userId,
    );
    return;
  }

  const bookName = extracted.name || `${character.name}'s Lorebook`;
  const bookDescription =
    extracted.description || `Imported from ${character.name} at ${new Date().toLocaleString()}`;

  const createdBook = await spindle.world_books.create(
    {
      name: bookName,
      description: bookDescription,
      metadata: {
        source: "character",
        source_character_id: characterId,
        auto_managed_by_character: false,
      },
    },
    userId,
  );

  for (const entryInput of normalizedEntries) {
    await spindle.world_books.entries.create(createdBook.id, entryInput, userId);
  }

  if (!currentIds.includes(createdBook.id)) {
    await spindle.characters.update(
      characterId,
      { world_book_ids: [...currentIds, createdBook.id] },
      userId,
    );
  }

  const state = await buildState(userId, chatId, activeCharacterId ?? characterId);
  send(
    {
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
      state,
    },
    userId,
  );
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
    } catch {
      // Ignore transient errors while permissions settle
    }
  }
});

spindle.onFrontendMessage(async (rawPayload: unknown, userId: string) => {
  if (!isRecord(rawPayload) || typeof rawPayload.type !== "string") return;
  const msg = rawPayload as FrontendToBackendMessage;

  if (msg.type === "get_state") {
    trackedSessions.set(userId, {
      chatId: msg.chatId ?? null,
      characterId: msg.characterId ?? null,
    });
    try {
      const state = await buildState(userId, msg.chatId, msg.characterId);
      send({ type: "state", requestId: msg.requestId, state }, userId);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      send(
        {
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
            error: errMsg,
          },
        },
        userId,
      );
    }
    return;
  }

  if (msg.type === "attach_book" || msg.type === "relink_book") {
    try {
      await handleAttachOrRelink(
        msg.type,
        msg.characterId,
        msg.worldBookId,
        userId,
        msg.chatId,
        msg.activeCharacterId,
        msg.requestId,
      );
    } catch (err: unknown) {
      send(
        {
          type: "action_result",
          requestId: msg.requestId,
          ok: false,
          action: msg.type,
          characterId: msg.characterId,
          worldBookId: msg.worldBookId,
          error: err instanceof Error ? err.message : String(err),
        },
        userId,
      );
    }
    return;
  }

  if (msg.type === "unlink_book") {
    try {
      await handleUnlink(
        msg.characterId,
        msg.worldBookId,
        userId,
        msg.chatId,
        msg.activeCharacterId,
        msg.requestId,
      );
    } catch (err: unknown) {
      send(
        {
          type: "action_result",
          requestId: msg.requestId,
          ok: false,
          action: "unlink_book",
          characterId: msg.characterId,
          worldBookId: msg.worldBookId,
          error: err instanceof Error ? err.message : String(err),
        },
        userId,
      );
    }
    return;
  }

  if (msg.type === "import_character_book") {
    try {
      await handleImportCharacterBook(
        msg.characterId,
        userId,
        msg.chatId,
        msg.activeCharacterId,
        msg.requestId,
      );
    } catch (err: unknown) {
      send(
        {
          type: "action_result",
          requestId: msg.requestId,
          ok: false,
          action: "import_character_book",
          characterId: msg.characterId,
          error: err instanceof Error ? err.message : String(err),
        },
        userId,
      );
    }
  }
});
