export const STYLES = `
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
