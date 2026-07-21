/* ====================================================================
 * Monitor Laboral Chile — Capa analítica
 *
 * - normalizar(valor, piso, techo): 0–100
 * - calcularICML(filtros): índice compuesto 0–100 (mayor = peor)
 * - aplicarFiltros(filtros, indicador): aplica AJUSTES a una serie
 * - construirBeveridge(serie): serie de pares (desoc, vacantes)
 * - clusteringInformal(ocupaciones): ranking + concentración
 * - decilToPobreza(decil, ingMin): etiqueta "bajo línea"
 * - icePorOcupacion(ocup): calidad individual del empleo
 *
 * @namespace window.ML_ANALYTICS
 * @author Miguel Ortiz C.
 * ====================================================================
 */
(function (global) {
  'use strict';

  const D = global.ML_DATA;
  if (!D) { console.error('[analytics] data.js no cargó'); return; }

  // ============== NORMALIZACIÓN ==============
  /**
   * Normaliza un valor entre 0 y 100 dado un piso y techo.
   * Mayor valor crudo → mayor puntaje (peor calidad).
   *
   * @param {number} valor  valor crudo del indicador
   * @param {number} piso   mínimo (calidad óptima, devuelve 0)
   * @param {number} techo  máximo (peor escenario, devuelve 100)
   * @returns {number} 0–100
   */
  function normalizar(valor, piso, techo) {
    if (techo === piso) return 50;
    const clamped = Math.max(piso, Math.min(techo, valor));
    return ((clamped - piso) / (techo - piso)) * 100;
  }

  // ============== CÁLCULO DEL ICML ==============
  /**
   * Calcula el Índice de Calidad del Mercado Laboral (0–100, mayor = peor).
   * Aplica la tabla ICML_COMPONENTES; cada componente se normaliza y pondera.
   *
   * @param {Object} [overrides]  permite inyectar valores distintos
   * @returns {{valor:number, componentes:Array, nivel:Object}}
   */
  function calcularICML(overrides = {}) {
    let suma = 0;
    const comps = D.ICML_COMPONENTES.map(c => {
      const raw = overrides[c.k] !== undefined ? overrides[c.k] : c.raw;
      const norm = normalizar(raw, c.piso, c.techo);
      const contrib = norm * c.peso;
      suma += contrib;
      return { ...c, raw, normalizado: norm, contribucion: contrib };
    });
    const valor = Math.round(suma * 10) / 10;
    const nivel = nivelICML(valor);
    return { valor, componentes: comps, nivel };
  }

  /**
   * Devuelve el nivel (Bajo/Moderado/Elevado/Alto/Crítico) para un valor.
   *
   * @param {number} valor 0–100
   * @returns {Object} {key, label, color, rgb}
   */
  function nivelICML(valor) {
    return D.ICML_NIVELES.find(n => valor >= n.min && valor < n.max) || D.ICML_NIVELES[4];
  }

  // ============== APLICAR FILTROS A UN INDICADOR ==============
  /**
   * Aplica los factores multiplicativos AJUSTES a un valor base
   * según los filtros activos. Si un filtro no tiene ajuste, asume 1.
   *
   * @param {string} indicador  'desocupacion' | 'informalidad' | 'participacion' | 'su3'
   * @param {Object} filtros    {sexo, edad, nacionalidad, region}
   * @param {number} base       valor base (nacional)
   * @returns {number} valor ajustado
   */
  function aplicarFiltros(indicador, filtros, base) {
    let factor = 1;
    ['sexo', 'edad', 'nacionalidad', 'region'].forEach(key => {
      const sel = (filtros[key] || 'all');
      const adj = D.AJUSTES[key] && D.AJUSTES[key][sel] && D.AJUSTES[key][sel][indicador];
      if (typeof adj === 'number') factor *= adj;
    });
    return base * factor;
  }

  // ============== CURVA DE BEVERIDGE ==============
  /**
   * Genera los puntos (desempleo, vacantes) para graficar la Curva de Beveridge.
   * Si la serie no tiene vacantes, devuelve [].
   *
   * @returns {Array<{p:string, x:number, y:number}>}
   */
  function construirBeveridge() {
    return (D.BVERIDGE || []).map(d => ({ p: d.p, x: d.desempleo, y: d.vacantes }));
  }

  // ============== CLUSTERING DE OCUPACIONES INFORMALES ==============
  /**
   * Ranking de ocupaciones por concentración de empleo informal.
   * Devuelve un array con la participación porcentual y una marca top5.
   *
   * @returns {Array<{ocup:string, pct:number, top5:boolean}>}
   */
  function clusteringInformal() {
    return (D.TOP5_INFORMAL || []).map((o, i) => ({ ...o, top5: i < 5 }));
  }

  // ============== ICE POR OCUPACIÓN (proxy) ==============
  /**
   * Calcula un Índice de Calidad del Empleo simplificado (0–100) para
   * una ocupación, combinando informalidad (peso 0.5) y un proxy de
   * subutilización horaria (peso 0.3) y brecha de género (peso 0.2).
   * Sin datos directos, se devuelve un puntaje de referencia.
   *
   * @param {Object} ocup {ocup:string, informal:number, genero:number, sub:number}
   * @returns {number}
   */
  function icePorOcupacion(ocup) {
    if (!ocup) return 0;
    const a = normalizar(ocup.informal || 30, 0, 50) * 0.5;
    const b = normalizar(ocup.sub || 10, 0, 25) * 0.3;
    const c = normalizar(ocup.genero || 0, 0, 10) * 0.2;
    return Math.round((a + b + c) * 10) / 10;
  }

  // ============== UTILIDADES ==============
  /**
   * Formatea un número con separador de miles y decimales.
   * @param {number} v
   * @param {number} d decimales
   * @returns {string}
   */
  function fmt(v, d = 0) {
    if (v == null || isNaN(v)) return '–';
    return d === 0
      ? Math.round(v).toLocaleString('es-CL')
      : v.toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  /**
   * Formatea un porcentaje con 1 decimal.
   */
  function fmtPct(v, d = 1) {
    if (v == null || isNaN(v)) return '–';
    return v.toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%';
  }

  /**
   * Formatea un valor de pesos (CLP).
   */
  function fmtCLP(v) {
    if (!v) return '–';
    return '$' + Math.round(v).toLocaleString('es-CL');
  }

  // ============== EXPORT ==============
  global.ML_ANALYTICS = {
    normalizar,
    calcularICML,
    nivelICML,
    aplicarFiltros,
    construirBeveridge,
    clusteringInformal,
    icePorOcupacion,
    fmt, fmtPct, fmtCLP
  };

  // Alias compatible con el spec original
  global.MFHC_ANALYTICS = global.ML_ANALYTICS;
})(typeof window !== 'undefined' ? window : this);
