/* ====================================================================
 * Monitor Laboral Chile — Orquestador principal
 *
 * Responsabilidades:
 *  - Inicializar filtros desde URL
 *  - Pintar portada (ICML)
 *  - Pintar todos los módulos
 *  - Manejar el drawer mobile (patrón MSS alineado)
 *  - Suscribirse a cambios de filtros
 *  - Scroll-spy de la navegación
 *
 * @namespace window.ML_MAIN
 * ====================================================================
 */
(function (global) {
  'use strict';

  const D = global.ML_DATA;
  const A = global.ML_ANALYTICS;
  const F = global.ML_FILTERS;
  const C = global.ML_CORE;
  const M = global.ML_MODULES;

  if (!D || !A || !F || !C || !M) {
    console.error('[main] Dependencias no cargaron');
    return;
  }

  // ============== DRAWER MOBILE ==============
  function setupDrawer() {
    const btn = document.getElementById('ml-menu-btn');
    const sidebar = document.getElementById('ml-sidebar');
    const overlay = document.getElementById('ml-overlay');
    const closeBtn = document.getElementById('ml-drawer-close');
    if (!btn || !sidebar || !overlay) return;

    function open() {
      sidebar.classList.add('is-open');
      overlay.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      sidebar.setAttribute('aria-hidden', 'false');
      document.body.classList.add('drawer-open');
      const first = sidebar.querySelector('button, a, select');
      if (first && window.matchMedia('(max-width: 900px)').matches) first.focus();
    }
    function close() {
      sidebar.classList.remove('is-open');
      overlay.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      sidebar.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('drawer-open');
    }
    function toggle() { sidebar.classList.contains('is-open') ? close() : open(); }

    btn.addEventListener('click', toggle);
    overlay.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && sidebar.classList.contains('is-open')) close();
    });
    sidebar.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', close);
    });
    // En desktop el sidebar siempre es visible: aria-hidden solo aplica al drawer móvil
    window.matchMedia('(min-width: 901px)').addEventListener('change', (ev) => {
      if (ev.matches) { close(); sidebar.setAttribute('aria-hidden', 'false'); }
    });
    sidebar.setAttribute('aria-hidden', window.matchMedia('(max-width: 900px)').matches ? 'true' : 'false');
  }

  // ============== NAVEGACIÓN ACTIVA (scroll-spy) ==============
  function setupNav() {
    const links = document.querySelectorAll('.ml-nav a[href^="#"]');
    const sections = Array.from(links)
      .map((l) => document.querySelector(l.getAttribute('href')))
      .filter(Boolean);

    if (!sections.length) return;

    function onScroll() {
      let current = sections[0];
      sections.forEach((s) => {
        if (s && s.getBoundingClientRect().top < 120) current = s;
      });
      const currentId = current ? '#' + current.id : '';
      links.forEach((l) => {
        l.classList.toggle('is-active', l.getAttribute('href') === currentId);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ============== PINTAR PORTADA ==============
  function pintarPortadaInicial() {
    try {
      C.pintarPortada(F.getState());
    } catch (e) { console.error('[main] Error portada:', e); }
  }

  // ============== PINTAR TODOS LOS MÓDULOS ==============
  function pintarModulos() {
    const f = F.getState();
    const fns = [
      ['m1Series',     M.m1Series],
      ['m1Piramide',   M.m1Piramide],
      ['m1Decomp',     M.m1Decomp],
      ['m1Scatter',    M.m1Scatter],
      ['m2Cluster',    M.m2Cluster],
      ['m2Empresa',    M.m2Empresa],
      ['m2Decomp',     M.m2Decomp],
      ['m2Ocde',       M.m2Ocde],
      ['m3Decil',      M.m3Decil],
      ['m3Bite',       M.m3Bite],
      ['m3Genero',     M.m3Genero],
      ['m3Inm',        M.m3Inm],
      ['m4Tramo',      M.m4Tramo],
      ['m4Prod',       M.m4Prod],
      ['m4Plat',       M.m4Plat],
      ['m5Prev',       M.m5Prev],
      ['m5Lm',         M.m5Lm],
      ['m5Nc',         M.m5Nc],
      ['m6Brechas',    M.m6Brechas],
      ['m6Su3',        M.m6Su3],
      ['m6Mig',        M.m6Mig],
      ['m7Ciclo',      M.m7Ciclo],
      ['m7Sect',       M.m7Sect],
      ['m7Beveridge',  M.m7Beveridge]
    ];
    fns.forEach(([name, fn]) => {
      try { fn(f); }
      catch (e) { console.error(`[main] Error en ${name}:`, e); }
    });
  }

  // ============== INIT ==============
  function init() {
    if (typeof d3 === 'undefined') {
      console.error('[main] D3.js no cargó (vendor local)');
      return;
    }

    // 1) Leer filtros desde URL
    F.readURL();
    F.bind();
    F.onChange(() => {
      pintarPortadaInicial();
      pintarModulos();
    });

    // 2) Drawer mobile
    setupDrawer();

    // 3) Navegación activa
    setupNav();

    // 4) Pintar todo
    pintarPortadaInicial();
    pintarModulos();

    console.info('[main] Monitor Laboral inicializado. Periodo:', D.META.periodo);
  }

  // ============== EXPORT ==============
  global.ML_MAIN = { init };

  // ============== DOM READY ==============
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
