/* ====================================================================
 * Monitor Laboral Chile — Filtros globales
 *
 * - getState(): devuelve el estado actual de los 4 filtros
 * - setState(key, value): cambia un filtro + emite evento + URL
 * - bind(onChange): enlaza los <select> y los chips
 * - readURL(): hidrata desde query string
 * - writeURL(): serializa a query string
 * - paintChips(): pinta los chips activos
 *
 * @namespace window.ML_FILTERS
 * ====================================================================
 */
(function (global) {
  'use strict';

  const FILTROS_KEYS = ['sexo', 'edad', 'nacionalidad', 'region'];

  let state = {
    sexo: 'all',
    edad: 'all',
    nacionalidad: 'all',
    region: 'all'
  };

  const listeners = [];

  // ============== STATE ==============
  function getState() { return Object.assign({}, state); }

  function isDefault() {
    return FILTROS_KEYS.every(k => state[k] === 'all');
  }

  function setState(key, value) {
    if (!FILTROS_KEYS.includes(key)) return;
    state[key] = value || 'all';
    writeURL();
    paintChips();
    emit();
  }

  function reset() {
    FILTROS_KEYS.forEach(k => state[k] = 'all');
    document.querySelectorAll('select[data-filter]').forEach(sel => sel.value = 'all');
    // Limpiar querystring
    if (history && history.replaceState) {
      const u = new URL(window.location.href);
      u.search = '';
      history.replaceState(null, '', u);
    }
    paintChips();
    emit();
  }

  // ============== EVENTOS ==============
  function onChange(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(fn => { try { fn(getState()); } catch (e) { console.error(e); } }); }

  // ============== URL (deep linking) ==============
  function readURL() {
    try {
      const u = new URL(window.location.href);
      FILTROS_KEYS.forEach(k => {
        const v = u.searchParams.get(k);
        if (v) state[k] = v;
      });
    } catch (e) { /* noop */ }
    return state;
  }

  function writeURL() {
    try {
      const u = new URL(window.location.href);
      FILTROS_KEYS.forEach(k => {
        if (state[k] && state[k] !== 'all') u.searchParams.set(k, state[k]);
        else u.searchParams.delete(k);
      });
      if (history && history.replaceState) {
        history.replaceState(null, '', u);
      }
    } catch (e) { /* noop */ }
  }

  // ============== CHIPS ==============
  const LABELS = {
    sexo: 'Sexo',
    edad: 'Edad',
    nacionalidad: 'Nacionalidad',
    region: 'Región'
  };

  function paintChips() {
    const cont = document.getElementById('activeChips');
    if (!cont) return;
    cont.innerHTML = FILTROS_KEYS
      .filter(k => state[k] !== 'all')
      .map(k => `<span class="chip" data-key="${k}">${LABELS[k]}: ${state[k]} <span class="chip__x" data-x="${k}">×</span></span>`)
      .join('');
    cont.querySelectorAll('.chip__x').forEach(el => {
      el.addEventListener('click', e => {
        const k = e.target.dataset.x;
        setState(k, 'all');
        const sel = document.querySelector(`select[data-filter="${k}"]`);
        if (sel) sel.value = 'all';
      });
    });
  }

  // ============== BIND ==============
  function bind() {
    document.querySelectorAll('select[data-filter]').forEach(sel => {
      const key = sel.dataset.filter;
      if (state[key] && state[key] !== 'all') sel.value = state[key];
      sel.addEventListener('change', e => setState(key, e.target.value));
    });
    const btnReset = document.getElementById('btnReset');
    if (btnReset) {
      btnReset.addEventListener('click', reset);
    }
    paintChips();

    // Actualizar estado del botón reset en cada cambio
    onChange(() => {
      if (btnReset) btnReset.disabled = isDefault();
    });
    if (btnReset) btnReset.disabled = isDefault();
  }

  // ============== EXPORT ==============
  global.ML_FILTERS = {
    getState, setState, reset,
    onChange, bind,
    readURL, writeURL, paintChips,
    isDefault,
    KEYS: FILTROS_KEYS
  };
})(typeof window !== 'undefined' ? window : this);
