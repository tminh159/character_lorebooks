import type {
  CharacterDTO,
  SpindleFrontendContext,
  SpindleFrontendTeardown,
  SpindleModalHandle,
  WorldBookDTO,
} from "lumiverse-spindle-types";
import {
  buildMemberState,
  getCharacterWorldBookIds,
  isRecord,
  toWorldBookSummary,
  type BackendToFrontendMessage,
  type CharacterLorebookMemberState,
  type CharacterLorebooksState,
  type EmbeddedBookInfo,
  type FrontendToBackendMessage,
  type GroupChatInfo,
  type NormalizedEmbeddedEntry,
} from "./shared";
import { STYLES } from "./styles";

const SECTION_ATTR = "data-char-lorebooks-section";

const POSITION_LABELS: Record<number, string> = {
  0: "Before Char",
  1: "After Char",
  2: "Before AN",
  3: "After AN",
  4: "At Depth",
  5: "Before Examples",
  6: "After Examples",
};

function createSvgIcon(
  paths: Array<{ tag: "path" | "circle" | "rect" | "polyline" | "line"; attrs: Record<string, string> }>,
  size = 12,
): SVGSVGElement {
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

function createBookUserIcon(size = 12): SVGSVGElement {
  return createSvgIcon(
    [
      { tag: "path", attrs: { d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" } },
      { tag: "circle", attrs: { cx: "12", cy: "8", r: "2" } },
      { tag: "path", attrs: { d: "M15 13a3 3 0 0 0-6 0" } },
    ],
    size,
  );
}

function createNotebookIcon(size = 14): SVGSVGElement {
  return createSvgIcon(
    [
      { tag: "path", attrs: { d: "M2 6h4" } },
      { tag: "path", attrs: { d: "M2 10h4" } },
      { tag: "path", attrs: { d: "M2 14h4" } },
      { tag: "path", attrs: { d: "M2 18h4" } },
      { tag: "rect", attrs: { width: "16", height: "20", x: "4", y: "2", rx: "2" } },
      { tag: "path", attrs: { d: "M16 2v20" } },
    ],
    size,
  );
}

function createPlusIcon(size = 11): SVGSVGElement {
  return createSvgIcon(
    [
      { tag: "path", attrs: { d: "M5 12h14" } },
      { tag: "path", attrs: { d: "M12 5v14" } },
    ],
    size,
  );
}

function createCloseIcon(size = 10): SVGSVGElement {
  return createSvgIcon(
    [
      { tag: "path", attrs: { d: "M18 6 6 18" } },
      { tag: "path", attrs: { d: "m6 6 12 12" } },
    ],
    size,
  );
}

function createChevronIcon(collapsed: boolean, size = 14): SVGSVGElement {
  return createSvgIcon(
    [
      {
        tag: "path",
        attrs: { d: collapsed ? "m9 18 6-6-6-6" : "m6 9 6 6 6-6" },
      },
    ],
    size,
  );
}

function coerceFrontendCharacter(raw: unknown): CharacterDTO | null {
  if (!isRecord(raw) || typeof raw.id !== "string" || typeof raw.name !== "string") {
    return null;
  }
  const extensions = isRecord(raw.extensions) ? raw.extensions : {};
  const worldBookIds = getCharacterWorldBookIds({
    world_book_ids: Array.isArray(raw.world_book_ids)
      ? raw.world_book_ids.filter((x): x is string => typeof x === "string")
      : [],
    extensions,
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
    post_history_instructions:
      typeof raw.post_history_instructions === "string" ? raw.post_history_instructions : "",
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === "string") : [],
    alternate_greetings: Array.isArray(raw.alternate_greetings)
      ? raw.alternate_greetings.filter((t): t is string => typeof t === "string")
      : [],
    creator: typeof raw.creator === "string" ? raw.creator : "",
    image_id: typeof raw.image_id === "string" ? raw.image_id : null,
    avatar_url: typeof raw.avatar_url === "string" ? raw.avatar_url : null,
    world_book_ids: worldBookIds,
    extensions,
    created_at: typeof raw.created_at === "number" ? raw.created_at : 0,
    updated_at: typeof raw.updated_at === "number" ? raw.updated_at : 0,
  };
}

function formatGroupModeLabel(group: GroupChatInfo): string {
  switch (group.effectiveLorebookMode) {
    case "active_character":
      return "Active Char";
    case "all_unmuted":
      return "All Unmuted";
    case "all":
      return "All Members";
  }
}

export function setup(ctx: SpindleFrontendContext): SpindleFrontendTeardown {
  ctx.deferReady();

  let disposed = false;
  let requestCounter = 0;
  let latestStateRequestId: string | null = null;
  let mobileCollapsed = true;
  let lastIsMobile: boolean | null = null;
  let state: CharacterLorebooksState | null = null;
  let statusNotice: { text: string; isError: boolean } | null = null;
  let statusTimer: ReturnType<typeof setTimeout> | null = null;
  let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  let refreshDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let syncScheduled = false;
  let isApplyingDom = false;
  const importingCharacters = new Set<string>();
  const busyActions = new Set<string>();

  let sectionEl: HTMLDivElement | null = null;
  let activePopoverEl: HTMLDivElement | null = null;
  let activeModalHandle: SpindleModalHandle | null = null;
  let bodyObserver: MutationObserver | null = null;
  let tabObserver: MutationObserver | null = null;
  let observedTabRoot: Element | null = null;

  const removeStyle = ctx.dom.addStyle(STYLES);
  const unsubs: Array<() => void> = [];

  function nextRequestId(): string {
    requestCounter += 1;
    return `clb_${Date.now()}_${requestCounter}`;
  }

  function showStatus(text: string, isError = false): void {
    statusNotice = { text, isError };
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      statusNotice = null;
      if (!disposed) renderSection();
    }, 4500);
    renderSection();
  }

  function closePopover(): void {
    if (activePopoverEl) {
      activePopoverEl.remove();
      activePopoverEl = null;
    }
  }

  function sendToBackend(msg: FrontendToBackendMessage): void {
    ctx.sendToBackend(msg);
  }

  function getActiveIds(): { chatId: string | null; characterId: string | null } {
    const active = ctx.getActiveChat();
    return {
      chatId: active?.chatId ?? null,
      characterId: active?.characterId ?? null,
    };
  }

  async function listAllWorldBooksFrontend(): Promise<WorldBookDTO[]> {
    if (!ctx.worldBooks) return [];
    const all: WorldBookDTO[] = [];
    let offset = 0;
    const limit = 200;
    while (true) {
      const rawPage: unknown = await ctx.worldBooks.list({ limit, offset });
      if (Array.isArray(rawPage)) {
        return rawPage as WorldBookDTO[];
      }
      const page = rawPage as { data?: WorldBookDTO[]; total?: number } | null;
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

  async function loadFrontendFallback(
    basePermissions?: CharacterLorebooksState["permissions"],
  ): Promise<void> {
    if (disposed) return;
    const { chatId, characterId } = getActiveIds();
    const permissions = basePermissions ?? {
      characters: false,
      world_books: false,
      chats: false,
      allGranted: false,
      missing: ["characters", "world_books", "chats"],
    };

    try {
      const [worldBooks, rawChar] = await Promise.all([
        listAllWorldBooksFrontend().catch(() => [] as WorldBookDTO[]),
        characterId ? ctx.characters.get(characterId).catch(() => null) : Promise.resolve(null),
      ]);

      if (disposed) return;
      worldBooks.sort((a, b) => a.name.localeCompare(b.name));

      const char = coerceFrontendCharacter(rawChar);
      const members: CharacterLorebookMemberState[] = [];
      if (char) {
        members.push(
          buildMemberState(char, worldBooks, {
            isActiveSpeaker: true,
            isMuted: false,
            isLoreActiveInGroup: true,
          }),
        );
      }

      state = {
        source: "frontend_fallback",
        permissions,
        chatId,
        activeCharacterId: characterId,
        group: null,
        members,
        availableWorldBooks: worldBooks.map(toWorldBookSummary),
        error: null,
      };
      renderSection();
    } catch {
      if (disposed) return;
      state = {
        source: "frontend_fallback",
        permissions,
        chatId,
        activeCharacterId: characterId,
        group: null,
        members: [],
        availableWorldBooks: [],
        error: null,
      };
      renderSection();
    }
  }

  function requestState(): void {
    if (disposed) return;
    const { chatId, characterId } = getActiveIds();
    const requestId = nextRequestId();
    latestStateRequestId = requestId;
    if (fallbackTimer) clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => {
      if (!disposed && !state) {
        void loadFrontendFallback();
      }
    }, 650);

    sendToBackend({
      type: "get_state",
      requestId,
      chatId,
      characterId,
    });
  }

  function scheduleRefresh(delayMs = 60): void {
    if (disposed) return;
    if (refreshDebounceTimer) clearTimeout(refreshDebounceTimer);
    refreshDebounceTimer = setTimeout(() => {
      requestState();
    }, delayMs);
  }

  function openBookInEditor(worldBookId: string): void {
    if (ctx.host?.surfaces?.invoke) {
      Promise.resolve(
        ctx.host.surfaces.invoke(
          { kind: "modal", id: "world_book_editor" },
          { id: worldBookId },
        ),
      ).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        showStatus(`Unable to open World Book editor: ${msg}`, true);
      });
      return;
    }
    showStatus("World Book editor modal surface is unavailable in this host version.", true);
  }

  async function requestPermissions(): Promise<void> {
    if (!ctx.permissions?.request) return;
    try {
      await ctx.permissions.request(["characters", "world_books", "chats"], {
        reason:
          "View and manage Character World Books, group chat lorebooks, and import embedded character lorebooks.",
      });
      requestState();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showStatus(`Permission request dismissed: ${msg}`, true);
    }
  }

  function openEmbeddedPreviewModal(
    member: CharacterLorebookMemberState,
    embedded: EmbeddedBookInfo,
  ): void {
    if (activeModalHandle) {
      activeModalHandle.dismiss();
      activeModalHandle = null;
    }

    const modal = ctx.ui.showModal({
      title: `${embedded.name} (${member.characterName})`,
      width: 640,
      maxHeight: 620,
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
    const statusLabel =
      embedded.status === "linked"
        ? "Linked to World Books"
        : embedded.status === "imported_unlinked"
          ? "Previously imported (currently unlinked)"
          : "Embedded in character card only";
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
        openBookInEditor(embedded.linkedBookId!);
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
          worldBookId: embedded.importedBookId!,
          chatId,
          activeCharacterId: characterId,
        });
        modal.dismiss();
      });
      metaRow.appendChild(relinkBtn);
    } else if (embedded.status === "embedded_only" && canMutate) {
      const importBtn = document.createElement("button");
      importBtn.type = "button";
      importBtn.className = "clb-btn clb-btn-primary";
      importBtn.textContent = importingCharacters.has(member.characterId)
        ? "Importing..."
        : "Import & Link";
      importBtn.disabled = importingCharacters.has(member.characterId);
      importBtn.addEventListener("click", () => {
        importingCharacters.add(member.characterId);
        const { chatId, characterId } = getActiveIds();
        sendToBackend({
          type: "import_character_book",
          requestId: nextRequestId(),
          characterId: member.characterId,
          chatId,
          activeCharacterId: characterId,
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

    const renderEntries = (query: string) => {
      entriesContainer.replaceChildren();
      const q = query.trim().toLowerCase();
      const filtered = q
        ? embedded.entries.filter((entry) => {
            const haystack = [
              entry.comment,
              ...entry.key,
              ...entry.keysecondary,
              entry.content,
            ]
              .join("\n")
              .toLowerCase();
            return haystack.includes(q);
          })
        : embedded.entries;

      if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "clb-picker-empty";
        empty.textContent = "No matching entries.";
        entriesContainer.appendChild(empty);
        return;
      }

      filtered.forEach((entry: NormalizedEmbeddedEntry, idx: number) => {
        const card = document.createElement("div");
        card.className = "clb-preview-entry";
        if (entry.disabled) card.classList.add("clb-preview-entry-disabled");

        const head = document.createElement("div");
        head.className = "clb-preview-entry-head";

        const title = document.createElement("span");
        title.className = "clb-preview-entry-title";
        title.textContent = entry.comment || `Entry #${idx + 1}`;
        head.appendChild(title);

        const badges = document.createElement("div");
        badges.className = "clb-preview-badges";

        const addBadge = (label: string, extraClass?: string) => {
          const b = document.createElement("span");
          b.className = extraClass ? `clb-preview-badge ${extraClass}` : "clb-preview-badge";
          b.textContent = label;
          badges.appendChild(b);
        };

        if (entry.disabled) addBadge("Disabled", "clb-preview-badge-disabled");
        if (entry.constant) addBadge("Constant", "clb-preview-badge-constant");
        if (entry.selective) addBadge("Selective");
        if (entry.use_regex) addBadge("Regex");
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

  function openAttachPicker(
    anchorBtn: HTMLButtonElement,
    member: CharacterLorebookMemberState,
  ): void {
    const wasSameAnchor =
      activePopoverEl !== null &&
      activePopoverEl.dataset.characterId === member.characterId;
    closePopover();
    if (wasSameAnchor) return;

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

    const renderList = (query: string) => {
      list.replaceChildren();
      const q = query.trim().toLowerCase();
      const filtered = q
        ? books.filter((b) => b.name.toLowerCase().includes(q))
        : books;

      if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "clb-picker-empty";
        empty.textContent =
          books.length === 0 ? "No World Books available" : "No matching World Books";
        list.appendChild(empty);
        return;
      }

      for (const book of filtered) {
        const isAttached = attachedSet.has(book.id);
        const item = document.createElement("button");
        item.type = "button";
        item.className = isAttached
          ? "clb-picker-item clb-picker-item-attached"
          : "clb-picker-item";

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
              activeCharacterId: characterId,
            });
          } else {
            attachedSet.add(book.id);
            sendToBackend({
              type: "attach_book",
              requestId: nextRequestId(),
              characterId: member.characterId,
              worldBookId: book.id,
              chatId,
              activeCharacterId: characterId,
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

    // Position anchored near the button, clamped within viewport
    const rect = anchorBtn.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = rect.right - popRect.width;
    if (left < 8) left = Math.min(rect.left, viewportW - popRect.width - 8);
    if (left + popRect.width > viewportW - 8) left = viewportW - popRect.width - 8;
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

  function renderMemberContent(
    member: CharacterLorebookMemberState,
    isGroup: boolean,
    canEdit: boolean,
    showAttachInMemberHeader: boolean,
  ): HTMLElement {
    const block = document.createElement("div");
    block.className = "clb-member-block";
    if (isGroup) block.classList.add("clb-member-group-item");
    if (isGroup && !member.isLoreActiveInGroup) block.classList.add("clb-member-dimmed");

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
        nameBtn.title = book.missing
          ? "World Book not found"
          : state?.permissions.world_books
            ? "Open in World Book editor"
            : "Approve world_books permission to open editor";
        nameBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!book.missing) openBookInEditor(book.id);
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
            activeCharacterId: characterId,
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
      const statusText =
        emb.status === "linked"
          ? "Linked"
          : emb.status === "imported_unlinked"
            ? "Imported (unlinked)"
            : "Embedded only";
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
          openBookInEditor(emb.linkedBookId!);
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
            worldBookId: emb.importedBookId!,
            chatId,
            activeCharacterId: characterId,
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
          openBookInEditor(emb.importedBookId!);
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
            activeCharacterId: characterId,
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

  function createAttachButton(
    member: CharacterLorebookMemberState,
    canEdit: boolean,
  ): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "clb-attach-btn";
    btn.disabled = !canEdit;
    btn.title = canEdit
      ? `Attach World Books to ${member.characterName}`
      : "Approve permissions to attach World Books";
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

  function buildPermissionBanner(missing: string[]): HTMLDivElement {
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
        void requestPermissions();
      });
      banner.appendChild(btn);
    }

    return banner;
  }

  function renderBodyContent(
    target: HTMLElement,
    isMobile: boolean,
  ): void {
    const current = state;
    if (!current) {
      const loading = document.createElement("span");
      loading.className = "clb-hint";
      loading.textContent = "Loading character lorebooks...";
      target.appendChild(loading);
      return;
    }

    const canEdit =
      current.source === "backend" &&
      current.permissions.characters &&
      current.permissions.world_books;

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
      noticeEl.className = statusNotice.isError
        ? "clb-status-msg clb-status-error"
        : "clb-status-msg";
      noticeEl.textContent = statusNotice.text;
      target.appendChild(noticeEl);
    }

    if (current.members.length === 0) {
      const empty = document.createElement("span");
      empty.className = "clb-hint";
      empty.textContent = current.chatId || current.activeCharacterId
        ? "No character data available"
        : "Open a character chat to manage its lorebooks";
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
      list.appendChild(
        renderMemberContent(member, isGroup, canEdit, showMemberAttach),
      );
    }
    target.appendChild(list);
  }

  function detectIsMobile(): boolean {
    const tabRoot = document.querySelector('[data-spindle-drawer-tab="lorebook"]');
    if (!tabRoot) return false;
    const panel = tabRoot.querySelector('[class*="panel"]');
    const panelScroll = tabRoot.querySelector('[class*="panelScroll"]');
    return Boolean(
      panel?.matches('[class*="panelMobile"]') ||
      panelScroll?.querySelector('[class*="attachmentAccordion"]'),
    );
  }

  function renderSection(): void {
    if (disposed || !sectionEl) return;
    isApplyingDom = true;
    try {
      const isMobile = detectIsMobile();
      lastIsMobile = isMobile;
      sectionEl.replaceChildren();

      const current = state;
      const members = current?.members ?? [];
      const isGroup = Boolean(current?.group?.isGroup);
      const soloMember = !isGroup && members.length === 1 ? members[0] : null;
      const canEdit = Boolean(
        current &&
        current.source === "backend" &&
        current.permissions.characters &&
        current.permissions.world_books,
      );

      if (isMobile) {
        sectionEl.className = mobileCollapsed
          ? "clb-accordion"
          : "clb-accordion clb-accordion-expanded";

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

        const attachedCount = members.reduce(
          (sum, m) => sum + m.attachedBooks.length,
          0,
        );
        const countPill = document.createElement("span");
        countPill.className = "clb-accordion-count";
        countPill.textContent = String(attachedCount);
        start.appendChild(countPill);

        headerBtn.appendChild(start);

        const preview = document.createElement("span");
        preview.className = "clb-accordion-preview";
        const allBookNames = members.flatMap((m) =>
          m.attachedBooks.map((b) => b.name),
        );
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
          empty.textContent = current?.chatId || current?.activeCharacterId
            ? "None attached"
            : "No character";
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
        sectionEl.className = disabled
          ? "clb-section clb-section-disabled"
          : "clb-section";

        const header = document.createElement("div");
        header.className = "clb-header";

        const iconWrap = document.createElement("span");
        iconWrap.className = "clb-header-icon";
        iconWrap.appendChild(createBookUserIcon(12));
        header.appendChild(iconWrap);

        const title = document.createElement("span");
        title.className = "clb-header-title";
        title.textContent = soloMember
          ? `Character: ${soloMember.characterName}`
          : isGroup
            ? "Character Lorebooks"
            : "Character Lorebooks";
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

  function attachTabObserver(tabRoot: Element): void {
    if (observedTabRoot === tabRoot && tabObserver) return;
    if (tabObserver) {
      tabObserver.disconnect();
      tabObserver = null;
    }
    observedTabRoot = tabRoot;
    tabObserver = new MutationObserver((mutations) => {
      if (disposed || isApplyingDom) return;
      const relevant = mutations.some((m) => {
        if (sectionEl && (m.target === sectionEl || sectionEl.contains(m.target))) {
          return false;
        }
        return true;
      });
      if (relevant) scheduleSyncDom();
    });
    tabObserver.observe(tabRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  function syncDom(): void {
    if (disposed) return;
    const tabRoot = document.querySelector('[data-spindle-drawer-tab="lorebook"]');
    if (!tabRoot) return;

    attachTabObserver(tabRoot);
    if (bodyObserver) {
      bodyObserver.disconnect();
      bodyObserver = null;
    }

    const panelScroll = tabRoot.querySelector('[class*="panelScroll"]');
    if (!panelScroll) return;

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
        if (
          sectionEl.parentElement !== panelScroll ||
          sectionEl.nextElementSibling !== wiSettings
        ) {
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

  function scheduleSyncDom(): void {
    if (disposed || syncScheduled) return;
    syncScheduled = true;
    queueMicrotask(() => {
      syncScheduled = false;
      syncDom();
    });
  }

  function startBodyObserver(): void {
    if (disposed || bodyObserver) return;
    const drawerRoot =
      document.querySelector('[data-lumiverse-surface="viewport-drawer"]') ??
      document.body;
    bodyObserver = new MutationObserver(() => {
      if (disposed) return;
      if (document.querySelector('[data-spindle-drawer-tab="lorebook"]')) {
        scheduleSyncDom();
      }
    });
    bodyObserver.observe(drawerRoot, { childList: true, subtree: true });
  }

  // Register backend message handler synchronously before ctx.ready()
  unsubs.push(
    ctx.onBackendMessage((rawPayload: unknown) => {
      if (disposed || !isRecord(rawPayload) || typeof rawPayload.type !== "string") {
        return;
      }
      const msg = rawPayload as BackendToFrontendMessage;

      if (msg.type === "state") {
        if (msg.requestId && latestStateRequestId && msg.requestId !== latestStateRequestId) {
          return;
        }
        if (!msg.requestId) {
          const active = getActiveIds();
          if ((msg.state.chatId ?? null) !== active.chatId) {
            scheduleRefresh(20);
            return;
          }
        }
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        const perms = msg.state.permissions;
        if (!perms.characters || !perms.world_books) {
          void loadFrontendFallback(perms);
          return;
        }
        state = msg.state;
        renderSection();
        return;
      }

      if (msg.type === "permission_status") {
        if (!msg.permissions.characters || !msg.permissions.world_books) {
          void loadFrontendFallback(msg.permissions);
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
            void loadFrontendFallback(perms);
          } else {
            state = msg.state;
          }
        }
        if (msg.ok) {
          if (msg.message) showStatus(msg.message, false);
          else renderSection();
        } else {
          showStatus(msg.error || "Operation failed.", true);
        }
      }
    }),
  );

  // Subscribe to reactive chat/character/world-book changes
  if (ctx.state) {
    unsubs.push(
      ctx.state.subscribe("chat.active", () => {
        closePopover();
        scheduleRefresh(40);
      }),
    );
    unsubs.push(
      ctx.state.subscribe("ui.drawer", () => {
        scheduleSyncDom();
      }),
    );
  }

  if (ctx.ui?.events) {
    unsubs.push(
      ctx.ui.events.onDrawerChange((drawer) => {
        if (drawer.open && drawer.tabId === "lorebook") {
          scheduleSyncDom();
          scheduleRefresh(30);
        }
      }),
    );
  }

  const refreshEvents = [
    "CHAT_SWITCHED",
    "CHAT_CHANGED",
    "CHARACTER_EDITED",
    "CHARACTER_DELETED",
    "WORLD_BOOK_CHANGED",
    "WORLD_BOOK_DELETED",
  ];
  for (const eventName of refreshEvents) {
    unsubs.push(
      ctx.events.on(eventName, () => {
        scheduleRefresh(60);
      }),
    );
  }

  const onDocumentMouseDown = (e: MouseEvent) => {
    if (!activePopoverEl) return;
    const target = e.target as Node | null;
    if (
      target &&
      !activePopoverEl.contains(target) &&
      !(target instanceof Element && target.closest(".clb-attach-btn"))
    ) {
      closePopover();
    }
  };
  const onDocumentKeyDown = (e: KeyboardEvent) => {
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
    if (statusTimer) clearTimeout(statusTimer);
    if (fallbackTimer) clearTimeout(fallbackTimer);
    if (refreshDebounceTimer) clearTimeout(refreshDebounceTimer);
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
      } catch {
        // Ignore teardown errors
      }
    }
    closePopover();
    if (activeModalHandle) {
      try {
        activeModalHandle.dismiss();
      } catch {
        // Ignore modal dismissal errors
      }
      activeModalHandle = null;
    }
    if (sectionEl) {
      sectionEl.remove();
      sectionEl = null;
    }
    removeStyle();
  };
}
