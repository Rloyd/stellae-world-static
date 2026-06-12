/**
 * Stellae Room · Lucide icon helpers (https://github.com/lucide-icons/lucide)
 * Requires vendor/lucide.min.js loaded first.
 */
(function (global) {
  'use strict';

  function toPascal(name) {
    return String(name)
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
  }

  // 默认 stroke 1.75 + linecap/linejoin round —— 更精致、更设计感
  var DEFAULT_STROKE = 1.75;

  function ic(name, opts) {
    const lucide = global.lucide;
    if (!lucide || !name) return '';
    opts = opts || {};
    const size = opts.size != null ? opts.size : 18;
    const stroke = opts.stroke != null ? opts.stroke : DEFAULT_STROKE;
    const cls = 'si' + (opts.class ? ' ' + opts.class : '');
    const Icon = lucide.icons[toPascal(name)];
    if (!Icon) {
      console.warn('[StellaeIcons] unknown icon:', name);
      return '';
    }
    const svg = lucide.createElement(Icon, {
      width: size,
      height: size,
      'stroke-width': stroke,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: cls,
      'aria-hidden': 'true',
    });
    return svg.outerHTML;
  }

  function mount(root) {
    const lucide = global.lucide;
    if (!lucide) return;
    lucide.createIcons({
      attrs: {
        class: 'si',
        'stroke-width': DEFAULT_STROKE,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
      },
      nameAttr: 'data-lucide',
      root: root || document,
    });
  }

  function init() {
    mount(document);
    document.querySelectorAll('[data-lucide-replace]').forEach((el) => {
      const name = el.getAttribute('data-lucide-replace');
      const size = parseInt(el.getAttribute('data-lucide-size') || '18', 10);
      if (name) el.innerHTML = ic(name, { size, class: el.getAttribute('data-lucide-class') || '' });
    });
  }

  global.StellaeIcons = { ic, mount, init, toPascal };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : global);
