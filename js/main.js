/* ====================================================================
 * Monitor Laboral Chile — Orquestador principal
 *
 * Responsabilidades:
 *  - Inicializar filtros desde URL
 *  - Pintar portada (ICML)
 *  - Pintar todos los módulos
 *  - Manejar el drawer mobile
 *  - Suscribirse a cambios de filtros
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
    const btnMenu = document.getElementById('btnMenu');
    const btnClose = document.getElementById('btnClose');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (!btnMenu || !sidebar || !overlay) return;

    function openDrawer() {
      sidebar.classList.add('is-open');
      overlay.hidden = false;
      // Force reflow para activar la transición
      void overlay.offsetWidth;
      overlay.classList.add('is-active');
      btnMenu.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      sidebar.classList.remove('is-open');
      overlay.classList.remove('is-active');
      btnMenu.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      // ocultar después de la transición
      setTimeout(() => { overlay.hidden = true; }, 250);
    }

    btnMenu.addEventListener('click', openDrawer);
    btnClose.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('is-open')) closeDrawer();
    });

    // Cerrar al hacer click en un link
    sidebar.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 900) closeDrawer();
      });
    });

    // Resize: si pasa a desktop, cerrar overlay
    let lastW = window.innerWidth;
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      if (w > 900 && lastW <= 900) closeDrawer();
      lastW = w;
    });
  }

  // ============== NAVEGACIÓN ACTIVA ==============
  function setupNav() {
    const links = document.querySelectorAll('.nav__link');
    const sections = Array.from(links).map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

    function onScroll() {
      let current = sections[0];
      sections.forEach(s => { if (s && s.getBoundingClientRect().top < 120) current = s; });
      links.forEach(l => {
        l.classList.toggle('is-active', l.getAttribute('href') === '#' + (current ? current.id : ''));
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
      console.error('[main] D3.js no cargó');
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
