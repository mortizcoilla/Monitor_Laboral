/* ====================================================================
 * Monitor Laboral Chile — Núcleo (portada + ICML)
 *
 * - pintarPortada(filtros): actualiza scorecard, barra, comparaciones y KPIs
 * - pintarICMLTable(componentes): tabla de la metodología
 * - pintarComparaciones(cmp): 3 cards de comparación
 *
 * @namespace window.ML_CORE
 * ====================================================================
 */
(function (global) {
  'use strict';

  const D = global.ML_DATA;
  const A = global.ML_ANALYTICS;
  if (!D || !A) { console.error('[core] data/analytics no cargaron'); return; }

  // ============== PINTA LA PORTADA ==============
  /**
   * Actualiza el scorecard principal y los KPIs según los filtros activos.
   *
   * @param {Object} filtros  estado actual de los filtros
   */
  function pintarPortada(filtros) {
    // Recalcular ICML con los overrides por filtro
    const overrides = {};
    overrides['Tasa de desocupación'] = A.aplicarFiltros('desocupacion', filtros, D.SERIE_DESOC[D.SERIE_DESOC.length - 1].v);
    overrides['Subutilización SU3'] = A.aplicarFiltros('su3', filtros, D.SERIE_SU3[D.SERIE_SU3.length - 1].v);
    overrides['Ocupación informal'] = A.aplicarFiltros('informalidad', filtros, 26.8);
    // Otros componentes no son ajustables por filtro

    const icml = A.calcularICML(overrides);
    const valor = icml.valor;
    const nivel = icml.nivel;

    // Número grande
    const elNum = document.getElementById('icmlValor');
    if (elNum) elNum.textContent = A.fmt(valor, 1);

    // Marker en la barra
    const elMarker = document.getElementById('icmlMarker');
    if (elMarker) elMarker.style.left = `${Math.max(0, Math.min(100, valor))}%`;

    // Color del número
    if (elNum) elNum.style.color = nivel.rgb;

    // Badge
    const elBadge = document.getElementById('nivelBadge');
    if (elBadge) {
      elBadge.textContent = nivel.label;
      elBadge.style.background = nivel.rgb;
      elBadge.dataset.nivel = nivel.key;
    }

    // Etiqueta en el título
    const elNivel = document.getElementById('nivelLabel');
    if (elNivel) {
      elNivel.textContent = nivel.label;
      elNivel.style.color = nivel.rgb;
    }

    // Comparaciones (vs periodos de referencia)
    const icmlBase = 35.9;  // 2010: desocupación 8.1%, informal ~30%
    const icmlAnt = 53.1;   // FMA 2026
    const icml12m = 50.7;   // MAM 2025
    const cmpIni = +(valor - icmlBase).toFixed(1);
    const cmpAnt = +(valor - icmlAnt).toFixed(1);
    const cmp12m = +(valor - icml12m).toFixed(1);

    pintarComparaciones(cmpIni, cmpAnt, cmp12m);
    pintarKPIs(overrides);
    pintarICMLTable(icml.componentes);
  }

  // ============== COMPARACIONES ==============
  function pintarComparaciones(cmpIni, cmpAnt, cmp12m) {
    const ini = document.getElementById('cmpIni');
    const ant = document.getElementById('cmpAnt');
    const m12 = document.getElementById('cmp12m');
    if (ini) { ini.textContent = (cmpIni >= 0 ? '+' : '') + A.fmt(cmpIni, 1) + ' pts'; ini.style.color = cmpIni > 0 ? 'var(--red-7)' : 'var(--green-7)'; }
    if (ant) { ant.textContent = (cmpAnt >= 0 ? '+' : '') + A.fmt(cmpAnt, 1) + ' pts'; ant.style.color = cmpAnt > 0 ? 'var(--red-7)' : 'var(--green-7)'; }
    if (m12) { m12.textContent = (cmp12m >= 0 ? '+' : '') + A.fmt(cmp12m, 1) + ' pts'; m12.style.color = cmp12m > 0 ? 'var(--red-7)' : 'var(--green-7)'; }
  }

  // ============== KPIs ==============
  function pintarKPIs(overrides) {
    const kpis = document.querySelectorAll('.kpi');
    if (kpis.length < 4) return;
    const desoc = overrides['Tasa de desocupación'];
    const su3 = overrides['Subutilización SU3'];
    const inf = overrides['Ocupación informal'];
    kpis[0].querySelector('.kpi__value').textContent = A.fmtPct(desoc, 1);
    kpis[0].querySelector('.kpi__sub').textContent = `Ajustado por filtros · base INE 9,4%`;
    kpis[1].querySelector('.kpi__value').textContent = A.fmtPct(su3, 1);
    kpis[1].querySelector('.kpi__sub').textContent = `Ajustado por filtros · base INE 17,1%`;
    kpis[2].querySelector('.kpi__value').textContent = A.fmtPct(inf, 1);
    kpis[2].querySelector('.kpi__sub').textContent = `Ajustado por filtros · base INE 26,8%`;
    // kpis[3] se mantiene fijo: cotizantes AFP
  }

  // ============== TABLA DE COMPONENTES (metodología) ==============
  function pintarICMLTable(componentes) {
    const tbody = document.getElementById('icmlTbl');
    if (!tbody) return;
    tbody.innerHTML = componentes.map(c => `
      <tr>
        <td>${c.k}</td>
        <td>${A.fmt(c.raw, c.raw < 10 ? 1 : 0)}</td>
        <td>${A.fmt(c.normalizado, 1)} / 100</td>
        <td>${(c.peso * 100).toFixed(0)}%</td>
      </tr>
    `).join('');
  }

  // ============== EXPORT ==============
  global.ML_CORE = {
    pintarPortada
  };
})(typeof window !== 'undefined' ? window : this);
