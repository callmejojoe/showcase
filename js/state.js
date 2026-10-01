/* state.js — tiny pub/sub event bus
 *
 * Events:
 *   content:ready     — all critical content parsed/loaded
 *   theme:ready       — CSS custom properties injected
 *   hero:ready        — video or fallback resolved
 *   scroll:progress   — morph value t ∈ [0, 1]
 *   category:toggled  — { category, open }
 */

const _listeners = {};

export function on(event, fn) {
  (_listeners[event] ||= []).push(fn);
}

export function off(event, fn) {
  const list = _listeners[event];
  if (!list) return;
  const i = list.indexOf(fn);
  if (i !== -1) list.splice(i, 1);
}

export function emit(event, data) {
  (_listeners[event] || []).forEach(fn => fn(data));
}
