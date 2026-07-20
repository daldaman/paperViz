/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Smooth-scrolls to a section by id, offsetting for the fixed header height.
 * Shared by Nav, MobileMenu, Hero, and Footer so they all reproduce the
 * original App.tsx `scrollToSection` behavior identically.
 */
export function scrollToId(id: string, headerOffset: number) {
  const element = document.getElementById(id);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
}
