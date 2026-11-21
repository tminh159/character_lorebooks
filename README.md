# Character Lorebooks (`character_lorebooks`)

Mirrors the **Character Editor -> Advanced** tab's World Books and Embedded Lorebook controls directly inside the **Lorebook** drawer tab (positioned right below *Always Active* and *This Chat Only*).

## Features

- **Solo & Group Chat Support**: Shows the active character's attached World Books in solo chats, and lists group members with their active/muted/lorebook-mode status (`active_character`, `all_unmuted`, `all`) in group chats.
- **Attach / Unlink / Open**: Attach standalone World Books via a searchable picker, unlink attached books with `×`, or click any attached pill to open it in the native World Book editor modal.
- **Embedded Lorebook 3-State Handling**:
  - **Linked**: Click **Open** to edit the linked World Book, or **Preview** to inspect the embedded entries.
  - **Imported (Unlinked)**: Re-links an existing imported copy (`metadata.source === "character"` & `source_character_id`) without duplicating it, or opens it directly.
  - **Embedded Only**: Imports normalized CCSv2/CCSv3 `character_book` entries into a standalone World Book and links it to the character.
- **Responsive Desktop & Mobile UI**: Renders a native card + pill layout on desktop and a collapsible accordion matching `MobileAttachmentAccordion` on mobile.
- **Read-Only Fallback**: Falls back to read-only character/world-book preview if extension permissions are pending approval.

## Permissions

- `characters` — Read character cards and update `world_book_ids`
- `world_books` — List, create, and populate imported World Books and open the World Book editor modal
- `chats` — Inspect active solo/group chat metadata (`group_card_mode`, `group_lorebook_mode`, `character_ids`, `muted_character_ids`)

## Build & Typecheck

```bash
bun run typecheck
bun run build
```
