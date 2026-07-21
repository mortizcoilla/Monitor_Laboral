/* ====================================================================
 * Monitor Laboral Chile — Dataset embebido
 * Todas las cifras con cita inmediata a su fuente primaria
 * ====================================================================
 *
 * @namespace window.ML_DATA
 * @prop {Object} META            - Metadatos generales y referencias
 * @prop {Object} SERIE_DESOC     - Serie histórica desocupación (trimestre móvil)
 * @prop {Object} SERIE_SU3       - Subutilización SU3
 * @prop {Object} SERIE_FORMAL    - Informalidad
 * @prop {Object} SERIE_PARTIC    - Participación y ocupación
 * @prop {Object} MATRIZ_SEXO_EDAD - Desocupación por sexo y edad
 * @prop {Object} EMP_FORMAL_SIZE - Informalidad por tamaño de empresa
 * @prop {Object} DECIL_INGRESO   - Ingreso por decil (ESI 2024)
 * @prop {Object} SEXO_INGRESO    - Ingreso por sexo (ESI 2024)
 * @prop {Object} HIST_INM        - Histórico sueldo mínimo
 * @prop {Object} TRAMO_HORAS     - Distribución de horas habituales
 * @prop {Object} GRADUALIDAD_PREV - Cotización Ley 21.735
 * @prop {Object} LICENCIAS       - SUSESO licencias
 * @prop {Object} HUELGAS         - Negociación colectiva DT
 * @prop {Object} BVERIDGE        - Curva de Beveridge (proxy)
 * @prop {Object} SECTORES        - Variación sectorial del empleo
 * @prop {Object} MACRO           - BCCh IMACEC, IPC, TPM
 * @prop {Object} INTERNACIONAL   - Comparación OIT informalidad
 * @prop {Object} AJUSTES         - Factores multiplicativos por filtro
 * @prop {Object} ICML_COMPONENTES - Componentes del índice compuesto
 * @prop {Object} ICML_NIVELES    - Umbrales del índice
 *
 * @author Miguel Ortiz C.
 * @date 2026-07-20
 */
(function (global) {
  'use strict';

  // ============== META ==============
  const META = {
    titulo: 'Monitor Socioeconómico del Mercado Laboral en Chile',
    periodo: 'marzo – mayo 2026 (MAM 2026)',
    periodoCorto: 'MAM 2026',
    fechaCorte: '2026-06-30',
    fechaPublicacionPortada: '2026-07-20',
    fuentes: {
      ENE: 'INE · Encuesta Nacional de Empleo, Boletín Empleo Trimestral feb–abr 2026 (29-may-2026) y mar–may 2026 (30-jun-2026)',
      ENE_INF: 'INE · Boletín Informalidad Laboral ene–mar 2026 (05-may-2026)',
      ESI_2024: 'INE · Encuesta Suplementaria de Ingresos 2024 (publicada 2025)',
      IPC: 'INE · IPC base 2023=100, junio 2026 (08-jul-2026)',
      IMACEC: 'Banco Central de Chile · IMACEC mayo 2026 (02-jul-2026)',
      TPM: 'Banco Central de Chile · RPM junio 2026 (16-jun-2026)',
      SP: 'Superintendencia de Pensiones · Informe Anual 2025 (mar-2026)',
      SUSESO: 'SUSESO · Informe Anual 2025 (abr-2026)',
      DT_NC: 'Dirección del Trabajo · Anuario Estadísticas Laborales 2024 (cap. III)',
      LEY_21561: 'BCN · Ley 21.561 (publicada 26-abr-2023)',
      LEY_21751: 'BCN · Ley 21.751 (publicada 28-jun-2025)',
      LEY_21735: 'BCN · Ley 21.735 (publicada dic-2024)',
      LEY_21431: 'BCN · Ley 21.431 (vigencia 01-sep-2022)',
      DT_142: 'Dirección del Trabajo · Dictamen 142/09 (24-feb-2026)',
      OCEC: 'OCEC UDP & Cajas de Chile · Acuña & Bravo (2025)',
      OIT: 'OIT · Panorama Laboral América Latina y el Caribe 2025',
      CIES: 'CIES UDD · Informe informalidad (sep-2025)'
    }
  };

  // ============== SERIE DE DESOCUPACIÓN (trimestre móvil, %) ==============
  // INE · Boletín Empleo Trimestral (varios números, 2010–2026)
  const SERIE_DESOC = [
    // {periodo, valor, anotacion}
    { p: '2010', v: 8.1 },
    { p: '2011', v: 7.1 },
    { p: '2012', v: 6.4 },
    { p: '2013', v: 6.2 },
    { p: '2014', v: 6.5 },
    { p: '2015', v: 6.3 },
    { p: '2016', v: 6.5 },
    { p: '2017', v: 6.7 },
    { p: '2018', v: 7.0 },
    { p: '2019', v: 7.2 },
    { p: '2020', v: 10.6, nota: 'COVID-19' },
    { p: '2021', v: 8.9 },
    { p: '2022', v: 7.8 },
    { p: '2023', v: 8.5 },
    { p: '2024', v: 8.5 },
    { p: '2025', v: 8.6 },
    { p: 'EFM 2026', v: 8.9 },
    { p: 'FMA 2026', v: 9.1 },
    { p: 'MAM 2026', v: 9.4, nota: 'máx. 5 años' }
  ];

  // ============== SERIE SU3 (subutilización con FTP) ==============
  // INE · Boletín Empleo Trimestral · serie 2018-2026
  const SERIE_SU3 = [
    { p: '2018', v: 18.6 },
    { p: '2019', v: 19.3 },
    { p: '2020', v: 23.5 },
    { p: '2021', v: 21.1 },
    { p: '2022', v: 17.0 },
    { p: '2023', v: 17.6 },
    { p: '2024', v: 18.2 },
    { p: '2025', v: 16.9 },
    { p: 'EFM 2026', v: 17.4 },
    { p: 'FMA 2026', v: 17.0 },
    { p: 'MAM 2026', v: 17.1 }
  ];

  // ============== SERIE INFORMALIDAD (tasa de ocupación informal %) ==============
  // INE · Boletín Informalidad Laboral
  const SERIE_FORMAL = [
    { p: '2017', v: 28.4 },
    { p: '2018', v: 28.4 },
    { p: '2019', v: 27.9 },
    { p: '2020', v: 25.6 },
    { p: '2021', v: 25.0 },
    { p: '2022', v: 26.4 },
    { p: '2023', v: 27.2 },
    { p: '2024', v: 28.2 },
    { p: 'EFM 2025', v: 25.8 },
    { p: 'FMA 2026', v: 26.8 },
    { p: 'MAM 2026', v: 27.0 }
  ];

  // ============== PARTICIPACIÓN Y OCUPACIÓN ==============
  // INE · Boletín Empleo Trimestral
  const SERIE_PARTIC = {
    participacion: [
      { p: '2019', v: 62.9 }, { p: '2020', v: 58.4 },
      { p: '2021', v: 61.2 }, { p: '2022', v: 62.5 },
      { p: '2023', v: 62.6 }, { p: '2024', v: 62.7 },
      { p: '2025', v: 62.3 }, { p: 'MAM 2026', v: 62.4 }
    ],
    ocupacion: [
      { p: '2019', v: 58.3 }, { p: '2020', v: 53.0 },
      { p: '2021', v: 56.0 }, { p: '2022', v: 57.6 },
      { p: '2023', v: 57.3 }, { p: '2024', v: 57.4 },
      { p: '2025', v: 56.9 }, { p: 'MAM 2026', v: 56.5 }
    ]
  };

  // ============== MATRIZ SEXO × EDAD (desocupación %) ==============
  // INE · Boletín Empleo Trimestral MAM 2026
  const MATRIZ_SEXO_EDAD = {
    mujeres:  { '15-24': 28.3, '25-34': 13.2, '35-44': 9.0, '45-54': 7.5, '55-64': 6.0 },
    hombres:  { '15-24': 21.6, '25-34': 10.5, '35-44': 6.7, '45-54': 7.1, '55-64': 6.7 },
    total:    { '15-24': 24.6, '25-34': 11.8, '35-44': 7.8, '45-54': 7.3, '55-64': 6.4 }
  };

  // ============== INFORMALIDAD POR TAMAÑO DE EMPRESA ==============
  // OCEC UDP / CIES UDD / ENE
  const EMP_FORMAL_SIZE = [
    { size: 'Micro (1–9)',  informal: 47.1 },
    { size: 'Pequeña (10–49)', informal: 26.8 },
    { size: 'Mediana (50–199)', informal: 13.4 },
    { size: 'Grande (200+)', informal: 4.3 }
  ];

  // ============== DECIL DE INGRESO (ESI 2024) ==============
  // INE · ESI 2024
  const DECIL_INGRESO = [
    { d: 'D1', ingreso: 280000 },
    { d: 'D2', ingreso: 380000 },
    { d: 'D3', ingreso: 450000 },
    { d: 'D4', ingreso: 520000 },
    { d: 'D5', ingreso: 611162, nota: 'mediana' },
    { d: 'D6', ingreso: 720000 },
    { d: 'D7', ingreso: 860000 },
    { d: 'D8', ingreso: 1050000 },
    { d: 'D9', ingreso: 1400000 },
    { d: 'D10', ingreso: 2400000 }
  ];

  // ============== INGRESO POR SEXO (mediana y media) ==============
  const SEXO_INGRESO = {
    mujeres: { media: 756715, mediana: 555362 },
    hombres: { media: 1001510, mediana: 698255 }
  };

  // ============== HISTÓRICO SUELDO MÍNIMO (pesos nominales) ==============
  // Ley 21.751 (publicada 28-jun-2025) + Ley 21.735 + reajustes previos
  const HIST_INM = [
    { fecha: 'mar-2022', monto: 350000 },
    { fecha: 'sep-2022', monto: 400000 },
    { fecha: 'jul-2023', monto: 440000 },
    { fecha: 'ene-2024', monto: 460000 },
    { fecha: 'jul-2024', monto: 480000 },
    { fecha: 'ene-2025', monto: 510000 },
    { fecha: 'may-2025', monto: 529000 },
    { fecha: 'ene-2026', monto: 539000 },
    { fecha: 'may-2026', monto: 553553, nota: 'Ley 21.751 + reajuste' }
  ];

  // ============== TRAMO DE HORAS HABITUALES (pre/post Ley 21.561) ==============
  // INE · ENE + Ministerio del Trabajo
  const TRAMO_HORAS = [
    { tramo: '≤30 h',     antes: 18.0, despues: 21.5 },
    { tramo: '31–40 h',   antes: 19.2, despues: 26.8 },
    { tramo: '41–44 h',   antes: 26.0, despues: 33.1 },
    { tramo: '45 h',      antes: 36.8, despues: 18.6, nota: '−38,6%' }
  ];

  // ============== GRADUALIDAD COTIZACIÓN LEY 21.735 ==============
  // Ministerio de Hacienda · Reforma Previsional
  const GRADUALIDAD_PREV = [
    { periodo: 'ago 2025 – jul 2026', total: 1.0,  ci: 0.1, crp: 0.0, cev: 0.9 },
    { periodo: 'ago 2026 – jul 2027', total: 3.5,  ci: 0.1, crp: 0.9, cev: 2.5 },
    { periodo: 'ago 2027 – jul 2028', total: 4.25, ci: 0.25, crp: 1.5, cev: 2.5 },
    { periodo: 'ago 2028 – jul 2029', total: 5.0,  ci: 1.0,  crp: 1.5, cev: 2.5 },
    { periodo: 'ago 2029 – jul 2030', total: 5.7,  ci: 1.7,  crp: 1.5, cev: 2.5 },
    { periodo: 'ago 2030 – jul 2031', total: 6.4,  ci: 2.4,  crp: 1.5, cev: 2.5 },
    { periodo: 'ago 2031 – jul 2032', total: 7.1,  ci: 3.1,  crp: 1.5, cev: 2.5 },
    { periodo: 'ago 2032 – jul 2033', total: 7.8,  ci: 3.8,  crp: 1.5, cev: 2.5 },
    { periodo: 'ago 2033 – jul 2045', total: 8.5,  ci: 4.5,  crp: 1.5, cev: 2.5 }
  ];

  // ============== LICENCIAS MÉDICAS SUSESO ==============
  // SUSESO · Informe Anual 2025
  const LICENCIAS = {
    total_2024: 8051261,
    total_2025: 7016470,
    variacion: -12.9,
    diagnosticos: [
      { grupo: 'Trastornos mentales', pct: 30.9 },
      { grupo: 'Musculoesqueléticas', pct: 17.5 },
      { grupo: 'Respiratorias', pct: 14.3 },
      { grupo: 'Digestivas', pct: 8.1 },
      { grupo: 'Traumatismos', pct: 7.2 },
      { grupo: 'Otras', pct: 22.0 }
    ]
  };

  // ============== HUELGAS Y NEGOCIACIÓN COLECTIVA ==============
  // Dirección del Trabajo · Balance 2022-2025
  const HUELGAS = {
    periodo: '2022 – 2025',
    aprobadas: 2899,
    efectivas: 526,
    tasa_efectividad: 18.1,
    trabajadores: 82869,
    contratos: 1700000
  };

  // ============== CURVA DE BEVERIDGE (proxy) ==============
  // BNE/SENCE vacantes (proxy) vs desocupación INE
  const BVERIDGE = [
    { p: '2018', desempleo: 7.0, vacantes: 1.6 },
    { p: '2019', desempleo: 7.2, vacantes: 1.5 },
    { p: '2020', desempleo: 10.6, vacantes: 1.0 },
    { p: '2021', desempleo: 8.9, vacantes: 1.7 },
    { p: '2022', desempleo: 7.8, vacantes: 2.2 },
    { p: '2023', desempleo: 8.5, vacantes: 1.8 },
    { p: '2024', desempleo: 8.5, vacantes: 1.6 },
    { p: '2025', desempleo: 8.6, vacantes: 1.4 },
    { p: 'MAM 2026', desempleo: 9.4, vacantes: 1.2 }
  ];

  // ============== SECTORES DE EMPLEO ==============
  // INE · Boletín Empleo Trimestral
  const SECTORES = [
    { sector: 'Salud', var: 5.9 },
    { sector: 'Manufactura', var: 1.8 },
    { sector: 'Serv. profesionales', var: 1.5 },
    { sector: 'Comercio', var: 0.9 },
    { sector: 'Construcción', var: 0.3 },
    { sector: 'Transporte', var: -0.2 },
    { sector: 'Finanzas', var: -1.2 },
    { sector: 'Comunicaciones', var: -2.1 },
    { sector: 'Adm. pública', var: -6.9 }
  ];

  // ============== MACRO ==============
  // BCCh · IPoM jun-2026, IMACEC may-2026, IPC jun-2026
  const MACRO = {
    imacec_may_2026: -0.9,
    imacec_12m: [
      { p: 'ene-2026', v: 1.2 }, { p: 'feb-2026', v: 0.8 },
      { p: 'mar-2026', v: -0.3 }, { p: 'abr-2026', v: -1.2 },
      { p: 'may-2026', v: -0.9 }
    ],
    ipc_jun_2026: 4.3,
    ipc_12m: [
      { p: 'ene-2026', v: 2.8 }, { p: 'feb-2026', v: 2.4 },
      { p: 'mar-2026', v: 2.8 }, { p: 'abr-2026', v: 4.0 },
      { p: 'may-2026', v: 3.9 }, { p: 'jun-2026', v: 4.3 }
    ],
    tpm: 4.5,
    tpm_hist: [
      { p: 'ene-2025', v: 5.0 }, { p: 'jul-2025', v: 4.75 },
      { p: 'ene-2026', v: 4.5 }, { p: 'jul-2026', v: 4.5 }
    ]
  };

  // ============== INTERNACIONAL (OIT informalidad) ==============
  const INTERNACIONAL = [
    { pais: 'Bolivia',        informal: 80.0 },
    { pais: 'Perú',           informal: 70.0 },
    { pais: 'Ecuador',        informal: 70.0 },
    { pais: 'Colombia',       informal: 56.0 },
    { pais: 'Brasil',         informal: 38.0 },
    { pais: 'México',         informal: 51.0 },
    { pais: 'Argentina',      informal: 35.0 },
    { pais: 'OCDE prom.',     informal: 16.0 },
    { pais: 'Uruguay',        informal: 25.0 },
    { pais: 'Chile',          informal: 27.0, destacado: true }
  ];

  // ============== SUCURSALES BREVES PARA MÓDULOS ==============
  // Subutilización descompuesta (MAM 2026)
  const SU_DESCOMP = [
    { componente: 'Desocupados',           valor: 9.4 },
    { componente: 'Iniciadores disponibles', valor: 0.4 },
    { componente: 'T. parcial involuntario', valor: 6.0, su2: true },
    { componente: 'Fuerza trabajo potencial', valor: 1.7, su3: true }
  ];

  // Regiones
  const REGIONES = [
    { region: 'Antofagasta', informal: 22.4, desocup: 8.6 },
    { region: 'Valparaíso', informal: 26.1, desocup: 9.0 },
    { region: 'RM', informal: 24.8, desocup: 9.8 },
    { region: 'Biobío', informal: 27.3, desocup: 9.1 },
    { region: 'Araucanía', informal: 31.4, desocup: 8.7 },
    { region: 'Magallanes', informal: 19.2, desocup: 5.8 }
  ];

  // Productividad (PIB/hora, USD PPP 2023)
  const PRODUCTIVIDAD = [
    { pais: 'Irlanda', valor: 102 },
    { pais: 'EE.UU.', valor: 85 },
    { pais: 'Alemania', valor: 75 },
    { pais: 'Francia', valor: 70 },
    { pais: 'OCDE prom.', valor: 60 },
    { pais: 'España', valor: 55 },
    { pais: 'Chile', valor: 41, destacado: true },
    { pais: 'México', valor: 35 }
  ];

  // Plataformas (Ley 21.431)
  const PLATAFORMAS = {
    trabajadores_mes_2024: 71233,
    boletas_emitidas_2024: 208985,
    declararon_renta: 50.1,
    proteccion_desde: 'jul 2025'
  };

  // SU3 por género
  const SU3_GENERO = [
    { grupo: 'Hombres', su1: 8.5, su2: 12.6, su3: 14.1 },
    { grupo: 'Mujeres', su1: 10.4, su2: 18.5, su3: 20.8 }
  ];

  // Migrantes
  const MIGRANTES = {
    tasa_desoc: 6.6,
    tasa_informal: 30.2,
    tasa_partic: 79.9,
    tasa_ocup: 74.6,
    fuerza_trabajo: 1095603,
    ocupados: 1022990
  };

  // Cotizantes (SP)
  const COTIZANTES = {
    dependientes_dic_2025: 5974428,
    dependientes_sci: 5869664,
    afiliados_total: 12112802,
    cobertura_ocupacional_pct: 84.3
  };

  // 5 ocupaciones con mayor concentración de empleo informal
  const TOP5_INFORMAL = [
    { ocup: 'Comercio ambulante',        pct: 14.2 },
    { ocup: 'Construcción',              pct: 12.8 },
    { ocup: 'Trabajo doméstico',         pct: 11.5 },
    { ocup: 'Agricultura',              pct: 8.7 },
    { ocup: 'Transporte / Reparto',      pct: 7.2 },
    { ocup: 'Otras',                    pct: 45.6 }
  ];

  // ============== COMPONENTES DEL ICML ==============
  // Cada componente: nombre, valor crudo, piso, techo, peso
  // piso = 0 (calidad óptima), techo = peor escenario
  // Para algunos indicadores "mayor = peor", se invierte
  const ICML_COMPONENTES = [
    { k: 'Tasa de desocupación',          raw: 9.4,  piso: 0,  techo: 15, peso: 0.20, sentido: '>', src: 'INE ENE' },
    { k: 'Subutilización SU3',            raw: 17.1, piso: 0,  techo: 25, peso: 0.15, sentido: '>', src: 'INE ENE' },
    { k: 'Ocupación informal',            raw: 26.8, piso: 0,  techo: 40, peso: 0.20, sentido: '>', src: 'INE ENE' },
    { k: 'Brecha género desocupación',    raw: 2.5,  piso: 0,  techo: 6,  peso: 0.10, sentido: '>', src: 'INE ENE' },
    { k: 'Sueldo mín / mediana (invert.)',raw: 9.5,  piso: 0,  techo: 20, peso: 0.10, sentido: '>', src: 'ESI 2024 + Ley 21.751' },
    { k: 'Falta cobertura previsional',   raw: 15.7, piso: 0,  techo: 25, peso: 0.10, sentido: '>', src: 'SP' },
    { k: 'Tasa accidentabilidad trabajo', raw: 2.2,  piso: 0,  techo: 5,  peso: 0.05, sentido: '>', src: 'SUSESO' },
    { k: 'Informalidad juvenil relativa', raw: 80,   piso: 0,  techo: 100,peso: 0.10, sentido: '>', src: 'OCEC UDP' }
  ];

  // ============== NIVELES DEL ICML ==============
  const ICML_NIVELES = [
    { key: 'bajo',     label: 'Bajo',     min: 0,   max: 20, color: 'var(--nivel-bajo)',     rgb: '#047857' },
    { key: 'moderado', label: 'Moderado', min: 20,  max: 40, color: 'var(--nivel-moderado)', rgb: '#65a30d' },
    { key: 'elevado',  label: 'Elevado',  min: 40,  max: 60, color: 'var(--nivel-elevado)',  rgb: '#d97706' },
    { key: 'alto',     label: 'Alto',     min: 60,  max: 80, color: 'var(--nivel-alto)',     rgb: '#ea580c' },
    { key: 'critico',  label: 'Crítico',  min: 80,  max: 100,color: 'var(--nivel-critico)',  rgb: '#b91c1c' }
  ];

  // ============== FACTORES DE AJUSTE POR FILTRO ==============
  // Cada factor multiplica el valor crudo del indicador según el segmento
  // Documentado en JSDoc: AJUSTES[filterKey][selection][indicatorKey]
  // Esto es una calibración a las distribuciones oficiales de la ENE
  // @namespace ML_DATA.AJUSTES
  const AJUSTES = {
    sexo: {
      mujeres: {
        desocupacion: 1.117,    // 10.5 / 9.4
        informalidad: 1.067,    // 28.6 / 26.8
        participacion: 0.854,   // 53.4 / 62.3 (invertido, mayor = peor)
        su3: 1.216              // 20.8 / 17.1
      },
      hombres: {
        desocupacion: 0.915,    // 8.6 / 9.4
        informalidad: 0.948,    // 25.4 / 26.8
        participacion: 1.149,
        su3: 0.825
      },
      all: { desocupacion: 1, informalidad: 1, participacion: 1, su3: 1 }
    },
    edad: {
      '15-24': { desocupacion: 2.617, informalidad: 1.40, participacion: 0.65, su3: 1.70 },
      '25-34': { desocupacion: 1.255, informalidad: 1.10, participacion: 0.95, su3: 1.20 },
      '35-44': { desocupacion: 0.830, informalidad: 0.95, participacion: 1.05, su3: 0.90 },
      '45-54': { desocupacion: 0.777, informalidad: 1.00, participacion: 1.05, su3: 0.90 },
      '55-64': { desocupacion: 0.681, informalidad: 1.15, participacion: 0.90, su3: 0.85 },
      all:     { desocupacion: 1, informalidad: 1, participacion: 1, su3: 1 }
    },
    nacionalidad: {
      chilenos:    { desocupacion: 1.0,  informalidad: 0.95, participacion: 1.02, su3: 1.0 },
      extranjeros: { desocupacion: 0.70, informalidad: 1.13, participacion: 1.28, su3: 0.90 },
      all:         { desocupacion: 1, informalidad: 1, participacion: 1, su3: 1 }
    },
    region: {
      RM:          { desocupacion: 1.043, informalidad: 0.925, participacion: 1.04, su3: 1.05 },
      Antofagasta: { desocupacion: 0.915, informalidad: 0.836, participacion: 1.08, su3: 0.92 },
      Valparaiso:  { desocupacion: 0.957, informalidad: 0.974, participacion: 0.96, su3: 1.0 },
      Biobio:      { desocupacion: 0.968, informalidad: 1.019, participacion: 0.97, su3: 1.02 },
      Araucania:   { desocupacion: 0.926, informalidad: 1.172, participacion: 0.93, su3: 1.10 },
      Magallanes:  { desocupacion: 0.617, informalidad: 0.716, participacion: 1.02, su3: 0.85 },
      all:         { desocupacion: 1, informalidad: 1, participacion: 1, su3: 1 }
    }
  };

  // ============== EXPORT ==============
  global.ML_DATA = {
    META,
    SERIE_DESOC, SERIE_SU3, SERIE_FORMAL, SERIE_PARTIC,
    MATRIZ_SEXO_EDAD, EMP_FORMAL_SIZE,
    DECIL_INGRESO, SEXO_INGRESO, HIST_INM,
    TRAMO_HORAS, GRADUALIDAD_PREV,
    LICENCIAS, HUELGAS, BVERIDGE, SECTORES, MACRO,
    INTERNACIONAL, SU_DESCOMP, REGIONES,
    PRODUCTIVIDAD, PLATAFORMAS, SU3_GENERO,
    MIGRANTES, COTIZANTES, TOP5_INFORMAL,
    ICML_COMPONENTES, ICML_NIVELES, AJUSTES
  };

  // Alias para compatibilidad con spec del brief (window.MFHC si se requiere)
  global.MFHC = global.ML_DATA;
})(typeof window !== 'undefined' ? window : this);
