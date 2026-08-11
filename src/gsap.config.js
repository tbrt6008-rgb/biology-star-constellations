import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.defaults({
  duration: 0.45,
  ease: 'power2.out',
  overwrite: 'auto',
});

ScrollTrigger.config({
  ignoreMobileResize: true,
});

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createScopedGsap(callback, scope) {
  return gsap.context(callback, scope);
}

export { gsap, ScrollTrigger };
