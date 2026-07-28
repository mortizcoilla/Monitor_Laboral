# Monitor Socioeconómico del Mercado Laboral en Chile

[![Status](https://img.shields.io/badge/status-stable-green)]()
[![Stack](https://img.shields.io/badge/stack-D3.js%20v7%20%2B%20vanilla%20JS-blue)]()
[![License](https://img.shields.io/badge/license-MIT-yellow)]()
[![Author](https://img.shields.io/badge/author-Miguel%20Ortiz%20C.-lightgrey)]()

Dashboard analítico interactivo del mercado laboral chileno, construido con JavaScript vanilla y D3.js v7. Cero build step, cero dependencias npm. Datos verificados y trazables a sus fuentes primarias (INE, BCCh, SUSESO, Superintendencia de Pensiones, OIT, OCDE, OCEC UDP, BCN).

## Tabla de contenidos

- [Demo local](#demo-local)
- [Stack técnico](#stack-técnico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Datos y trazabilidad](#datos-y-trazabilidad)
- [Metodología del ICML](#metodología-del-icml)
- [Módulos temáticos](#módulos-temáticos)
- [Sistema de filtros](#sistema-de-filtros)
- [Accesibilidad y responsive](#accesibilidad-y-responsive)
- [Limitaciones declaradas](#limitaciones-declaradas)
- [Licencia](#licencia)
- [Autor](#autor)

## Demo local

Tres formas de servirlo en local (no requiere internet más allá del CDN de D3 y Google Fonts):

```bash
# Opción 1: Doble clic en index.html
start index.html       # Windows
open index.html        # macOS
xdg-open index.html    # Linux

# Opción 2: Servidor estático con Python
python -m http.server 8080
# Abrir http://localhost:8080

# Opción 3: Servidor estático con Node (si tenés npx)
npx http-server -p 8080

# Opción 4: PowerShell en Windows
python -m http.server 8080
```

## Stack técnico

| Capa | Especificación |
|------|----------------|
| JavaScript | ES6+ en módulos IIFE, sin TypeScript, sin frameworks |
| Gráficos | D3.js v7 vía CDN (`d3.v7.min.js`) |
| CSS | Vanilla con variables CSS, grid y flexbox |
| HTML | Estático, un solo `index.html` |
| Tipografía | Inter desde Google Fonts |
| Datos | Embebidos en `js/data.js` (sin fetch) |
| Build | Cero: doble clic o servidor estático |
| Dependencias | Cero npm install |

## Estructura del proyecto

```
Monitor_Laboral/
├── index.html              ← estructura completa
├── assets/
│   ├── favicon.svg         ← gauge del ICML (vector)
│   ├── favicon-32x32.png   ← favicon 32×32
│   ├── favicon-16x16.png   ← favicon 16×16
│   ├── favicon.ico         ← multi-resolución (legacy)
│   ├── apple-touch-icon.png← 180×180 (iOS home screen)
│   └── generate_favicons.py← script que regenera los PNG
├── css/
│   └── styles.css          ← variables CSS, grid, mobile-first
├── js/
│   ├── data.js             ← dataset embebido + AJUSTES
│   ├── analytics.js        ← ICML, normalización, factores
│   ├── core.js             ← portada y scorecard
│   ├── filters.js          ← filtros + deep linking
│   ├── modules.js          ← 23 charts D3 en 7 módulos
│   └── main.js             ← orquestador con try/catch
├── README.md
├── LICENSE
└── .gitignore
```

## Datos y trazabilidad

Cada cifra tiene cita inmediata a su fuente primaria, con fecha de corte y publicación:

1. **INE — Boletín Empleo Trimestral** feb–abr 2026 (publicado 29-may-2026) y mar–may 2026 (publicado 30-jun-2026).  
   <https://www.ine.gob.cl/estadisticas-por-tema/mercado-laboral/ocupacion-y-desocupacion>
2. **INE — Boletín Informalidad Laboral** ene–mar 2026 (publicado 05-may-2026).  
   <https://www.ine.gob.cl/estadisticas-por-tema/mercado-laboral/informalidad-laboral>
3. **INE — Encuesta Suplementaria de Ingresos (ESI) 2024**, publicada 2025.  
   <https://www.ine.gob.cl/estadisticas-por-tema/ingresos-y-gastos/esi>
4. **INE — IPC** base 2023=100, junio 2026 (publicado 08-jul-2026).
5. **Banco Central de Chile — IMACEC** mayo 2026 (publicado 02-jul-2026); **TPM** 4,5% (RPM jun-2026).  
   <https://www.bcentral.cl>
6. **Superintendencia de Pensiones — Informe Anual 2025**, cotizantes a dic-2025 (publicado mar-2026).  
   <https://www.spensiones.cl>
7. **SUSESO — Informe Anual 2025** (publicado abr-2026).  
   <https://www.suseso.gob.cl>
8. **Dirección del Trabajo — Anuario Estadísticas Laborales 2024**; **Dictamen 142/09** (24-feb-2026).
9. **Leyes**: 21.561 (publicada 26-abr-2023), 21.751 (publicada 28-jun-2025), 21.735 (publicada dic-2024), 21.431 (vigencia 01-sep-2022).  
   <https://www.bcn.cl/leychile>
10. **OCEC UDP & Cajas de Chile** — *Estudio integral sobre informalidad laboral en Chile*, Acuña & Bravo (2025).  
    <https://ocec.udp.cl>
11. **OIT — Panorama Laboral América Latina y el Caribe 2025**.  
    <https://www.ilo.org>
12. **CIES UDD — Informe informalidad** (sep-2025).  
    <https://negocios.udd.cl/cies>

## Metodología del ICML

El **Índice de Calidad del Mercado Laboral (ICML)** es un índice compuesto entre 0 y 100 (mayor = peor calidad) que sintetiza 8 dimensiones. Cada componente se normaliza linealmente entre un piso (calidad óptima) y un techo (peor escenario histórico), y se pondera:

| Componente | Valor actual | Normalizado | Peso |
|---|---|---|---|
| Tasa de desocupación | 9.4% | 62.7 | 20% |
| Subutilización SU3 | 17.1% | 68.4 | 15% |
| Ocupación informal | 26.8% | 67.0 | 20% |
| Brecha género desocupación | 2.5 pp | 41.7 | 10% |
| Sueldo mín / mediana (invertido) | 9.5% | 47.5 | 10% |
| Falta cobertura previsional | 15.7% | 62.8 | 10% |
| Tasa accidentabilidad trabajo | 2.2% | 44.0 | 5% |
| Informalidad juvenil relativa | 80% | 80.0 | 10% |

**Cálculo**: `ICML = Σ (normalizado × peso)`. Resultado actual: **54.3 / 100 (Elevado)**.

### Umbrales del índice

- **0 – 20** · Bajo · el mercado opera con holgura
- **20 – 40** · Moderado · tensiones sectoriales acotadas
- **40 – 60** · Elevado · deterioro extendido, requiere política
- **60 – 80** · Alto · falla estructural, reforma en marcha
- **80 – 100** · Crítico · colapso del mercado formal

El código está en `js/analytics.js` (`calcularICML`) y los factores de ajuste por filtro en `js/data.js` (`AJUSTES`).

## Módulos temáticos

| Módulo | Charts | Filtros aplicables |
|---|---|---|
| 1. Empleo y subutilización | 4 | sexo, edad, región, nacionalidad |
| 2. Informalidad | 4 | región |
| 3. Remuneraciones | 4 | sexo |
| 4. Jornada y 40 h | 3 | – |
| 5. Protección social | 3 | – |
| 6. Segmentos críticos | 3 | sexo, edad, nacionalidad |
| 7. Contexto macro | 3 | – |

Total: **24 visualizaciones D3** (1 portada + 23 módulos), todas con leyendas que indican si el chart se ajusta con filtros o es dato macro fijo.

## Sistema de filtros

4 filtros globales con valores oficiales del dominio: `sexo`, `edad`, `nacionalidad`, `region`. Factores multiplicativos calibrados a las distribuciones oficiales de la ENE (ver `ML_DATA.AJUSTES` en `js/data.js`).

**Deep linking**: la URL codifica el estado. Ejemplos:

```
?sexo=mujeres&edad=15-24
?region=RM&sexo=hombres
?nacionalidad=extranjeros
```

**API JSDoc** en `js/filters.js`:

- `ML_FILTERS.getState()` — devuelve el estado actual
- `ML_FILTERS.setState(key, value)` — cambia un filtro
- `ML_FILTERS.reset()` — limpia todo
- `ML_FILTERS.onChange(fn)` — suscribe un listener
- `ML_FILTERS.readURL()` — hidrata desde query string
- `ML_FILTERS.writeURL()` — serializa a query string

Indicadores disponibles: `desocupacion`, `informalidad`, `participacion`, `su3`. Las claves válidas de filtro son: `sexo`, `edad`, `nacionalidad`, `region`.

## Accesibilidad y responsive

- `lang="es-CL"` en `<html>`
- `meta viewport` correcto
- Botones con `min-width: 44px; min-height: 44px` (Apple HIG)
- Contraste AA en paleta de 5 niveles
- ARIA labels en drawer, hamburger, scorecard
- `prefers-reduced-motion` desactiva animaciones
- Impresión optimizada (sin sidebar ni footer de autor)
- Mobile-first: hamburger → drawer; portada como primer contenido

## Limitaciones declaradas

- Las cifras de informalidad por sexo en el módulo 1 usan el último dato FMA 2026 (26,8% nacional, 28,6% mujeres, 25,4% hombres) por ser la serie comparable; la cifra MAM 2026 (27,0% nacional) está en la portada como KPI.
- La **Curva de Beveridge** usa una proxy de vacantes de la BNE/SENCE por no existir serie pública mensual completa. Marcar como "experimental".
- El desglose por región se limita a 6 regiones con publicación estable; el resto del país se agrega en "Nacional".
- El **ICML** es una construcción propia — no oficial — para síntesis comunicacional. Los detalles del cálculo y los pesos están abiertos en `js/core.js`.
- Los factores de ajuste por filtro son calibraciones propias a las distribuciones oficiales de la ENE; no son outputs directos del INE para cada cruce.

## Licencia

MIT. Ver archivo [LICENSE](LICENSE).

## Autor

**Miguel Ortiz C.**

- LinkedIn: [linkedin.com/in/mortizcoilla](https://linkedin.com/in/mortizcoilla)
- Email: [mortizcoilla@gmail.com](mailto:mortizcoilla@gmail.com)
- WhatsApp: [+56 9 3329 3943](https://wa.me/56933293943)
