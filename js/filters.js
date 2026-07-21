/* ====================================================================
 * Monitor Laboral Chile — Filtros globales
 *
 * - getState(): devuelve el estado actual de los 4 filtros
 * - setState(key, value): cambia un filtro + emite evento + URL
 * - bind(onChange): enlaza los <select>, los chips y el botón Limpiar
 * - readURL(): hidrata desde query string
 * - writeURL(): serializa a query string
 * - paintChips(): pinta los chips activos con botón × y estado vacío
 *
 * UI alineada con el sistema Monitor_Salud (chips con borde + chip-x).
 * Namespace: window.ML_FILTERS (mismo API que antes).
 * @namespace window.ML_FILTERS
 * ====================================================================
 */
(function (global) {
  'use strict';

  const FILTROS_KEYS = ['sexo', 'edad', 'nacionalidad', 'region'];
  const DEFAULT_VALUE = 'all';

  const LABELS = {
    sexo: 'Sexo',
    edad: 'Tramo de edad',
    nacionalidad: 'Nacionalidad',
    region: 'Región'
  };

  // Etiqueta legible para chips y selects (mapea códigos → texto)
  const VALUE_LABELS = {
    sexo: { all: 'Todos', mujeres: 'Mujeres', hombres: 'Hombres' },
    edad: { all: 'Todos', '15-24': '15–24', '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55-64': '55–64' },
    nacionalidad: { all: 'Chilenos y extranjeros', chilenos: 'Chilenos', extranjeros: 'Extranjeros' },
    region: {
      all: 'Nacional',
      RM: 'Región Metropolitana',
      Antofagasta: 'Antofagasta',
      Valparaiso: 'Valparaíso',
      Biobio: 'Biobío',
      Araucania: 'La Araucanía',
      Magallanes: 'Magallanes'
    }
  };

  let state = {
    sexo: DEFAULT_VALUE,
    edad: DEFAULT_VALUE,
    nacionalidad: DEFAULT_VALUE,
    region: DEFAULT_VALUE
  };

  const listeners = [];

  // ============== STATE ==============
  function getState() { return Object.assign({}, state); }

  function isDefault() {
    return FILTROS_KEYS.every((k) => state[k] === DEFAULT_VALUE);
  }

  function setState(key, value) {
    if (!FILTROS_KEYS.includes(key)) return;
    state[key] = value || DEFAULT_VALUE;
    writeURL();
    paintChips();
    syncClearButton();
    emit();
  }

  function reset() {
    FILTROS_KEYS.forEach((k) => { state[k] = DEFAULT_VALUE; });
    document.querySelectorAll('select[data-filter]').forEach((sel) => { sel.value = DEFAULT_VALUE; });
    if (history && history.replaceState) {
      const u = new URL(window.location.href);
      u.search = '';
      history.replaceState(null, '', u);
    }
    paintChips();
    syncClearButton();
    emit();
  }

  // ============== EVENTOS ==============
  function onChange(fn) { listeners.push(fn); }
  function emit() {
    listeners.forEach((fn) => {
      try { fn(getState()); }
      catch (e) { console.error(e); }
    });
  }

  // ============== URL (deep linking) ==============
  function readURL() {
    try {
      const u = new URL(window.location.href);
      FILTROS_KEYS.forEach((k) => {
        const v = u.searchParams.get(k);
        if (v) state[k] = v;
      });
    } catch (e) { /* noop */ }
    return state;
  }

  function writeURL() {
    try {
      const u = new URL(window.location.href);
      FILTROS_KEYS.forEach((k) => {
        if (state[k] && state[k] !== DEFAULT_VALUE) u.searchParams.set(k, state[k]);
        else u.searchParams.delete(k);
      });
      if (history && history.replaceState) {
        history.replaceState(null, '', u);
      }
    } catch (e) { /* noop */ }
  }

  // ============== CHIPS ==============
  function paintChips() {
    const box = document.getElementById('ml-chips');
    if (!box) return;
    const active = FILTROS_KEYS.filter((k) => state[k] !== DEFAULT_VALUE);
    if (!active.length) {
      box.innerHTML = '<span class="ml-chip ml-chip-empty">Sin filtros activos</span>';
      return;
    }
    box.innerHTML = active.map((k) => {
      const v = state[k];
      const vLabel = (VALUE_LABELS[k] && VALUE_LABELS[k][v]) || v;
      return '<span class="ml-chip" data-key="' + k + '">' +
        LABELS[k] + ': <strong>' + vLabel + '</strong>' +
        '<button type="button" class="chip-x" aria-label="Quitar filtro ' + LABELS[k] + '" data-clear="' + k + '">×</button>' +
        '</span>';
    }).join('');
  }

  function syncClearButton() {
    const btn = document.getElementById('ml-btn-clear');
    if (btn) btn.disabled = isDefault();
  }

  // ============== BIND ==============
  function bind() {
    document.querySelectorAll('select[data-filter]').forEach((sel) => {
      const key = sel.dataset.filter;
      if (state[key] && state[key] !== DEFAULT_VALUE) sel.value = state[key];
      sel.addEventListener('change', (e) => setState(key, e.target.value));
    });
    const btnReset = document.getElementById('ml-btn-clear');
    if (btnReset) {
      btnReset.addEventListener('click', reset);
    }
    const chipsBox = document.getElementById('ml-chips');
    if (chipsBox) {
      chipsBox.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-clear]');
        if (!btn) return;
        const key = btn.getAttribute('data-clear');
        setState(key, DEFAULT_VALUE);
        const sel = document.querySelector('select[data-filter="' + key + '"]');
        if (sel) sel.value = DEFAULT_VALUE;
      });
    }
    paintChips();
    syncClearButton();
  }

  // ============== EXPORT ==============
  global.ML_FILTERS = {
    getState, setState, reset,
    onChange, bind,
    readURL, writeURL, paintChips,
    isDefault,
    KEYS: FILTROS_KEYS,
    DEFAULT: DEFAULT_VALUE
  };
})(typeof window !== 'undefined' ? window : this);
