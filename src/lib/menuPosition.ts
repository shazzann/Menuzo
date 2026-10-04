import type { MenuPosition } from '@/types';

export function captureMenuPosition(root: HTMLElement, menu: Pick<MenuPosition, 'shopId' | 'viewMode' | 'activeTabId'>): MenuPosition {
  const horizontal: Record<string, number> = {};
  root.querySelectorAll<HTMLElement>('[data-menu-scroll]').forEach(element => {
    horizontal[element.dataset.menuScroll!] = element.scrollLeft;
  });
  return { ...menu, scrollY: window.scrollY, horizontal };
}

export function restoreMenuPosition(root: HTMLElement, position: MenuPosition) {
  root.querySelectorAll<HTMLElement>('[data-menu-scroll]').forEach(element => {
    element.scrollTo({ left: position.horizontal[element.dataset.menuScroll!] ?? 0, behavior: 'instant' });
  });
  // Override the site's smooth scrolling so Back restores before the first paint.
  window.scrollTo({ top: position.scrollY, left: 0, behavior: 'instant' });
}
