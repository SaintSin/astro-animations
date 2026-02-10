// scripts/animations/init.ts
//
// Main entry point for the animation system.
// Wires up IntersectionObserver-based scroll-triggered animations,
// handles reduced motion, and Astro View Transitions lifecycle.

import { destroyInViewAnimations, initInViewAnimations } from './observer';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initAnimations(): void {
  // Guard against double-init
  if (document.body.hasAttribute('data-animate-ready')) return;

  if (prefersReducedMotion()) {
    // Force all animated elements visible — CSS handles the rest
    const animated = document.querySelectorAll<HTMLElement>('[data-animate]');
    for (const el of animated) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
    return;
  }

  initInViewAnimations();

  // Signal that JS has initialised — enables hidden state + will-change in CSS
  document.body.setAttribute('data-animate-ready', '');
}

function destroyAnimations(): void {
  destroyInViewAnimations();
  document.body.removeAttribute('data-animate-ready');
}

// Astro View Transitions lifecycle hooks.
// Harmless no-ops when ClientRouter / native VT is absent.
document.addEventListener('astro:page-load', initAnimations);
document.addEventListener('astro:before-swap', destroyAnimations);

// Module scripts are deferred. Astro's router may fire astro:page-load
// before this module registers its listener. Call immediately to cover
// initial load; the data-animate-ready guard prevents double-init.
initAnimations();
