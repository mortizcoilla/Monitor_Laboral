/* ====================================================================
 * Monitor Laboral Chile — Módulos temáticos (D3.js v7)
 *
 * Cada función pinta un chart-card:
 *  - m1Series, m1Piramide, m1Decomp, m1Scatter
 *  - m2Cluster, m2Empresa, m2Decomp, m2Ocde
 *  - m3Decil, m3Bite, m3Genero, m3Inm
 *  - m4Tramo, m4Prod, m4Plat
 *  - m5Prev, m5Lm, m5Nc
 *  - m6Brechas, m6Su3, m6Mig
 *  - m7Ciclo, m7Sect, m7Beveridge
 *
 * Helpers comunes al final.
 *
 * @namespace window.ML_MODULES
 * ====================================================================
 */
(function (global) {
  'use strict';

  const D = global.ML_DATA;
  const A = global.ML_ANALYTICS;
  if (!D || !A) { console.error('[modules] data/analytics no cargaron'); return; }

  // ============== HELPERS ==============
  const PALETTE = {
    blue: '#1d4ed8', blueDk: '#0b3a6f', blueLt: '#93c5fd',
    red: '#b91c1c', amber: '#d97706', green: '#047857',
    female: '#be185d', male: '#1d4ed8',
    grid: '#e2e8f0', text: '#334155', textLt: '#64748b',
    ink: '#0f172a'
  };

  function svgInit(id, w = 480, h = 320) {
    const svg = d3.select(`#${id}`);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${w} ${h}`);
    svg.attr('preserveAspectRatio', 'xMidYMid meet');
    return svg;
  }

  function makeMargin(svg, w, h, m = { t: 16, r: 16, b: 36, l: 44 }) {
    return { w, h, m, iw: w - m.l - m.r, ih: h - m.t - m.b };
  }

  function axes(svg, dim, xScale, yScale, fmtX = d => d, fmtY = d => d, xLabel, yLabel) {
    const { m } = dim;
    // X axis
    svg.append('g')
      .attr('transform', `translate(0, ${dim.h - m.b})`)
      .call(d3.axisBottom(xScale).tickFormat(fmtX).ticks(6))
      .call(g => {
        g.selectAll('line').attr('stroke', PALETTE.grid);
        g.selectAll('path').attr('stroke', PALETTE.grid);
        g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 10);
      });
    // Y axis
    svg.append('g')
      .attr('transform', `translate(${m.l}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat(fmtY).ticks(5))
      .call(g => {
        g.selectAll('line').attr('stroke', PALETTE.grid);
        g.selectAll('path').attr('stroke', PALETTE.grid);
        g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 10);
      });
    // Grid horizontal
    svg.append('g')
      .attr('opacity', 0.5)
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter().append('line')
      .attr('x1', m.l).attr('x2', dim.w - m.r)
      .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', PALETTE.grid).attr('stroke-dasharray', '2 3');
    if (yLabel) {
      svg.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -dim.h / 2)
        .attr('y', 12)
        .attr('text-anchor', 'middle')
        .attr('fill', PALETTE.textLt)
        .attr('font-size', 10)
        .text(yLabel);
    }
    if (xLabel) {
      svg.append('text')
        .attr('x', dim.w / 2)
        .attr('y', dim.h - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', PALETTE.textLt)
        .attr('font-size', 10)
        .text(xLabel);
    }
  }

  // ====================================================================
  // MÓDULO 1: EMPLEO Y SUBUTILIZACIÓN
  // ====================================================================

  function m1Series(filtros) {
    const id = 'chart-m1-series', w = 720, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 36, l: 44 });
    const data = D.SERIE_DESOC.map(d => ({
      p: d.p, v: d.v,
      vAdj: A.aplicarFiltros('desocupacion', filtros, d.v)
    }));
    const su3 = D.SERIE_SU3;
    const x = d3.scaleBand().domain(data.map(d => d.p)).range([dim.m.l, dim.w - dim.m.r]).padding(0.2);
    const y = d3.scaleLinear().domain([0, 22]).range([dim.h - dim.m.b, dim.m.t]);

    // Bars SU3 (background)
    const su3Map = new Map(su3.map(d => [d.p, d.v]));
    const bars = svg.selectAll('rect.bar-su3')
      .data(data).enter().append('rect')
      .attr('class', 'bar-su3')
      .attr('x', d => x(d.p))
      .attr('y', d => y(su3Map.get(d.p) || 0))
      .attr('width', x.bandwidth())
      .attr('height', d => (dim.h - dim.m.b) - y(su3Map.get(d.p) || 0))
      .attr('fill', PALETTE.blueLt).attr('opacity', 0.55);

    // Line + dots desocupación
    const line = d3.line()
      .x(d => x(d.p) + x.bandwidth() / 2)
      .y(d => y(d.v))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('d', line)
      .attr('stroke', PALETTE.red)
      .attr('stroke-width', 2.5)
      .attr('fill', 'none');

    svg.selectAll('circle.dot')
      .data(data).enter().append('circle')
      .attr('cx', d => x(d.p) + x.bandwidth() / 2)
      .attr('cy', d => y(d.v))
      .attr('r', 3.5)
      .attr('fill', PALETTE.red);

    // Etiquetas
    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.p) + x.bandwidth() / 2)
      .attr('y', d => y(d.v) - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('fill', PALETTE.red)
      .text(d => d.v.toFixed(1));

    // Eje X
    const xa = d3.axisBottom(x);
    svg.append('g')
      .attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(xa)
      .call(g => {
        g.selectAll('line').attr('stroke', PALETTE.grid);
        g.selectAll('path').attr('stroke', PALETTE.grid);
        g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9).attr('transform', 'rotate(-35)').attr('text-anchor', 'end');
      });
    // Eje Y
    svg.append('g')
      .attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .call(g => {
        g.selectAll('line').attr('stroke', PALETTE.grid);
        g.selectAll('path').attr('stroke', PALETTE.grid);
        g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 10);
      });
    // Gridlines
    svg.append('g').attr('opacity', 0.4).selectAll('line')
      .data(y.ticks(5)).enter().append('line')
      .attr('x1', dim.m.l).attr('x2', dim.w - dim.m.r)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', PALETTE.grid).attr('stroke-dasharray', '2 3');

    // Leyenda
    svg.append('rect').attr('x', dim.m.l + 10).attr('y', 6).attr('width', 10).attr('height', 10).attr('fill', PALETTE.blueLt).attr('opacity', 0.6);
    svg.append('text').attr('x', dim.m.l + 24).attr('y', 15).attr('font-size', 10).attr('fill', PALETTE.text).text('SU3 (subutilización)');
    svg.append('line').attr('x1', dim.m.l + 130).attr('x2', dim.m.l + 150).attr('y1', 11).attr('y2', 11).attr('stroke', PALETTE.red).attr('stroke-width', 2.5);
    svg.append('circle').attr('cx', dim.m.l + 140).attr('cy', 11).attr('r', 3.5).attr('fill', PALETTE.red);
    svg.append('text').attr('x', dim.m.l + 154).attr('y', 15).attr('font-size', 10).attr('fill', PALETTE.text).text('Tasa de desocupación');
  }

  function m1Piramide(filtros) {
    const id = 'chart-m1-piramide', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 50, b: 16, l: 50 });
    const edades = ['15-24', '25-34', '35-44', '45-54', '55-64'];
    const sexoSel = filtros.sexo === 'all' ? 'total' : filtros.sexo === 'mujeres' ? 'mujeres' : 'hombres';
    const data = edades.map(e => ({ edad: e, v: D.MATRIZ_SEXO_EDAD[sexoSel][e] }));
    const y = d3.scaleBand().domain(edades).range([dim.m.t, dim.h - dim.m.b]).padding(0.18);
    const x = d3.scaleLinear().domain([0, 32]).range([dim.m.l, dim.w - dim.m.r]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l)
      .attr('y', d => y(d.edad))
      .attr('width', d => x(d.v) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', sexoSel === 'mujeres' ? PALETTE.female : sexoSel === 'hombres' ? PALETTE.male : PALETTE.blue);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.v) + 4)
      .attr('y', d => y(d.edad) + y.bandwidth() / 2 + 4)
      .attr('font-size', 11).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => d.v.toFixed(1) + '%');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%'))
      .call(g => {
        g.selectAll('line').attr('stroke', PALETTE.grid);
        g.selectAll('path').attr('stroke', PALETTE.grid);
        g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9);
      });

    // Subtitulo
    const su = sexoSel === 'mujeres' ? 'Mujeres' : sexoSel === 'hombres' ? 'Hombres' : 'Total';
    svg.append('text')
      .attr('x', dim.w / 2).attr('y', 12)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', PALETTE.textLt)
      .text(`Sub: ${su} · INE MAM 2026`);
  }

  function m1Decomp() {
    const id = 'chart-m1-decomp', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 30, l: 110 });
    const data = D.SU_DESCOMP;
    const y = d3.scaleBand().domain(data.map(d => d.componente)).range([dim.m.t, dim.h - dim.m.b]).padding(0.2);
    const x = d3.scaleLinear().domain([0, 10]).range([dim.m.l, dim.w - dim.m.r]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l).attr('y', d => y(d.componente))
      .attr('width', d => x(d.valor) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', d => d.su2 ? PALETTE.amber : d.su3 ? PALETTE.red : PALETTE.blue)
      .attr('opacity', 0.85);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.valor) + 4)
      .attr('y', d => y(d.componente) + y.bandwidth() / 2 + 4)
      .attr('font-size', 11).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => d.valor.toFixed(1) + ' pp.');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5))
      .call(g => { g.selectAll('line').attr('stroke', PALETTE.grid); g.selectAll('path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m1Scatter() {
    const id = 'chart-m1-scatter', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 32, l: 40 });
    const data = D.REGIONES;
    const x = d3.scaleLinear().domain([4, 12]).range([dim.m.l, dim.w - dim.m.r]);
    const y = d3.scaleLinear().domain([15, 35]).range([dim.h - dim.m.b, dim.m.t]);

    svg.selectAll('circle')
      .data(data).enter().append('circle')
      .attr('cx', d => x(d.desocup))
      .attr('cy', d => y(d.informal))
      .attr('r', d => 4 + d.region === 'RM' ? 8 : 5)
      .attr('fill', d => d.region === 'RM' ? PALETTE.red : PALETTE.blue)
      .attr('opacity', 0.8);

    svg.selectAll('text.lbl')
      .data(data).enter().append('text')
      .attr('x', d => x(d.desocup) + 8)
      .attr('y', d => y(d.informal) - 8)
      .attr('font-size', 10).attr('fill', PALETTE.text)
      .text(d => d.region);

    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); g.selectAll('line, path').attr('stroke', PALETTE.grid); });
    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); g.selectAll('line, path').attr('stroke', PALETTE.grid); });
    svg.append('text').attr('x', dim.w / 2).attr('y', dim.h - 4).attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', PALETTE.textLt).text('Tasa de desocupación');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -dim.h / 2).attr('y', 12).attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', PALETTE.textLt).text('Tasa informalidad');
  }

  // ====================================================================
  // MÓDULO 2: INFORMALIDAD
  // ====================================================================

  function m2Cluster() {
    const id = 'chart-m2-cluster', w = 720, h = 360;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 40, l: 180 });
    const data = A.clusteringInformal();
    const y = d3.scaleBand().domain(data.map(d => d.ocup)).range([dim.m.t, dim.h - dim.m.b]).padding(0.15);
    const x = d3.scaleLinear().domain([0, 16]).range([dim.m.l, dim.w - dim.m.r]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l).attr('y', d => y(d.ocup))
      .attr('width', d => x(d.pct) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', d => d.top5 ? PALETTE.red : PALETTE.blueLt)
      .attr('opacity', d => d.top5 ? 0.9 : 0.6);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.pct) + 4)
      .attr('y', d => y(d.ocup) + y.bandwidth() / 2 + 4)
      .attr('font-size', 11).attr('font-weight', d => d.top5 ? 700 : 400).attr('fill', PALETTE.ink)
      .text(d => d.pct.toFixed(1) + '%');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
    svg.append('text').attr('x', dim.w / 2).attr('y', dim.h - 4).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', PALETTE.textLt).text('% del empleo informal total');
  }

  function m2Empresa(filtros) {
    const id = 'chart-m2-empresa', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 40, l: 100 });
    const data = D.EMP_FORMAL_SIZE.map(d => ({ ...d, adj: d.informal * (filtros.region === 'all' ? 1 : (D.AJUSTES.region[filtros.region] || {}).informalidad || 1) }));
    const y = d3.scaleBand().domain(data.map(d => d.size)).range([dim.m.t, dim.h - dim.m.b]).padding(0.2);
    const x = d3.scaleLinear().domain([0, 50]).range([dim.m.l, dim.w - dim.m.r]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l).attr('y', d => y(d.size))
      .attr('width', d => x(d.adj) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', (d, i) => i === 0 ? PALETTE.red : i === 1 ? PALETTE.amber : i === 2 ? PALETTE.blue : PALETTE.green)
      .attr('opacity', 0.85);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.adj) + 4)
      .attr('y', d => y(d.size) + y.bandwidth() / 2 + 4)
      .attr('font-size', 11).attr('font-weight', 700).attr('fill', PALETTE.ink)
      .text(d => d.adj.toFixed(1) + '%');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m2Decomp() {
    const id = 'chart-m2-decomp', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 32, l: 100 });
    const data = [
      { k: 'Composición', composicion: -2.4, condiciones: 0.6, total: -1.8 },
      { k: 'Hombres', composicion: -1.0, condiciones: -0.1, total: -1.1 },
      { k: 'Mujeres', composicion: -1.4, condiciones: 1.5, total: 0.1 }
    ];
    const y = d3.scaleBand().domain(data.map(d => d.k)).range([dim.m.t, dim.h - dim.m.b]).padding(0.2);
    const x = d3.scaleLinear().domain([-3, 3]).range([dim.m.l, dim.w - dim.m.r]);
    const x0 = x(0);

    // Composición bars
    svg.selectAll('rect.c')
      .data(data).enter().append('rect')
      .attr('x', d => d.composicion < 0 ? x(d.composicion) : x0)
      .attr('y', d => y(d.k) + 6)
      .attr('width', d => Math.abs(x(d.composicion) - x0))
      .attr('height', y.bandwidth() / 2 - 3)
      .attr('fill', PALETTE.blue).attr('opacity', 0.8);

    // Condiciones bars
    svg.selectAll('rect.k')
      .data(data).enter().append('rect')
      .attr('x', d => d.condiciones < 0 ? x(d.condiciones) : x0)
      .attr('y', d => y(d.k) + y.bandwidth() / 2 + 1)
      .attr('width', d => Math.abs(x(d.condiciones) - x0))
      .attr('height', y.bandwidth() / 2 - 3)
      .attr('fill', PALETTE.amber).attr('opacity', 0.8);

    // Línea cero
    svg.append('line').attr('x1', x0).attr('x2', x0).attr('y1', dim.m.t).attr('y2', dim.h - dim.m.b)
      .attr('stroke', PALETTE.ink).attr('stroke-width', 1);

    // Labels
    svg.append('text').attr('x', dim.w - dim.m.r).attr('y', dim.m.t + 10).attr('text-anchor', 'end')
      .attr('font-size', 9).attr('fill', PALETTE.text).text('Composición (estructura)');
    svg.append('text').attr('x', dim.w - dim.m.r).attr('y', dim.m.t + 24).attr('text-anchor', 'end')
      .attr('font-size', 9).attr('fill', PALETTE.text).text('Condiciones (mercado)');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => (d > 0 ? '+' : '') + d + ' pp.'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m2Ocde() {
    const id = 'chart-m2-ocde', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 32, l: 80 });
    const data = [...D.INTERNACIONAL].sort((a, b) => a.informal - b.informal);
    const y = d3.scaleBand().domain(data.map(d => d.pais)).range([dim.m.t, dim.h - dim.m.b]).padding(0.15);
    const x = d3.scaleLinear().domain([0, 90]).range([dim.m.l, dim.w - dim.m.r]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l).attr('y', d => y(d.pais))
      .attr('width', d => x(d.informal) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', d => d.destacado ? PALETTE.red : d.pais === 'OCDE prom.' ? PALETTE.green : PALETTE.blueLt)
      .attr('opacity', d => d.destacado ? 0.9 : 0.7);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.informal) + 4)
      .attr('y', d => y(d.pais) + y.bandwidth() / 2 + 4)
      .attr('font-size', 10).attr('font-weight', d => d.destacado ? 700 : 400).attr('fill', PALETTE.ink)
      .text(d => d.informal.toFixed(0) + '%');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  // ====================================================================
  // MÓDULO 3: REMUNERACIONES
  // ====================================================================

  function m3Decil(filtros) {
    const id = 'chart-m3-decil', w = 720, h = 360;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 40, l: 70 });
    const data = D.DECIL_INGRESO.map(d => ({ ...d, adj: d.ingreso * (filtros.sexo === 'mujeres' ? 0.81 : filtros.sexo === 'hombres' ? 1.14 : 1) }));
    const x = d3.scaleBand().domain(data.map(d => d.d)).range([dim.m.l, dim.w - dim.m.r]).padding(0.2);
    const y = d3.scaleLinear().domain([0, 2600000]).range([dim.h - dim.m.b, dim.m.t]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', d => x(d.d)).attr('y', d => y(d.adj))
      .attr('width', x.bandwidth())
      .attr('height', d => (dim.h - dim.m.b) - y(d.adj))
      .attr('fill', d => d.d === 'D5' ? PALETTE.red : PALETTE.blue).attr('opacity', 0.85);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.d) + x.bandwidth() / 2)
      .attr('y', d => y(d.adj) - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => '$' + (d.adj / 1000).toFixed(0) + 'k');

    // === Línea sueldo mínimo (DESPUÉS de las barras para quedar encima) ===
    const minLine = y(553553);
    // 1) Halo blanco para que la línea se vea cruzando las barras
    svg.append('line')
      .attr('x1', dim.m.l).attr('x2', dim.w - dim.m.r)
      .attr('y1', minLine).attr('y2', minLine)
      .attr('stroke', '#ffffff').attr('stroke-width', 4).attr('opacity', 0.8);
    // 2) Línea amber punteada, encima del halo
    svg.append('line')
      .attr('x1', dim.m.l).attr('x2', dim.w - dim.m.r)
      .attr('y1', minLine).attr('y2', minLine)
      .attr('stroke', PALETTE.amber).attr('stroke-dasharray', '5 4').attr('stroke-width', 1.8);
    // 3) Píldora amber con texto blanco y borde blanco — etiqueta siempre legible
    const labelStr = 'Sueldo mínimo · $553.553';
    const labelG = svg.append('g');
    const labelText = labelG.append('text')
      .attr('x', dim.w - dim.m.r - 6).attr('y', minLine - 12)
      .attr('text-anchor', 'end')
      .attr('font-size', 10).attr('font-weight', 700)
      .attr('fill', '#ffffff').attr('font-family', 'Inter, system-ui, sans-serif')
      .text(labelStr);
    const bb = labelText.node().getBBox();
    labelG.insert('rect', 'text')
      .attr('x', bb.x - 9).attr('y', bb.y - 4)
      .attr('width', bb.width + 18).attr('height', bb.height + 8)
      .attr('rx', (bb.height + 8) / 2).attr('ry', (bb.height + 8) / 2)
      .attr('fill', PALETTE.amber)
      .attr('stroke', '#ffffff').attr('stroke-width', 1.5)
      .attr('filter', 'drop-shadow(0 1px 2px rgba(15,23,42,0.25))');

    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 10); });
    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => '$' + (d / 1000) + 'k'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m3Bite() {
    const id = 'chart-m3-bite', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 32, l: 80 });
    const data = [
      { k: 'Ingreso mínimo', v: 553553, color: PALETTE.amber },
      { k: 'Mediana ocupados', v: 611162, color: PALETTE.red },
      { k: 'Media ocupados', v: 897019, color: PALETTE.blue },
      { k: 'Línea pobreza (per cáp.)', v: 124000, color: PALETTE.green }
    ];
    const y = d3.scaleBand().domain(data.map(d => d.k)).range([dim.m.t, dim.h - dim.m.b]).padding(0.2);
    const x = d3.scaleLinear().domain([0, 1000000]).range([dim.m.l, dim.w - dim.m.r]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l).attr('y', d => y(d.k))
      .attr('width', d => x(d.v) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', d => d.color).attr('opacity', 0.85);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.v) + 4)
      .attr('y', d => y(d.k) + y.bandwidth() / 2 + 4)
      .attr('font-size', 11).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => '$' + A.fmt(d.v));

    // Bite indicator
    svg.append('text')
      .attr('x', dim.m.l + 8).attr('y', dim.m.t - 4)
      .attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('Bite del mínimo: 90,5% de la mediana (Ley 21.751)');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => '$' + (d / 1000) + 'k'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m3Genero(filtros) {
    const id = 'chart-m3-genero', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 30, r: 16, b: 32, l: 60 });
    const data = [
      { k: 'Media',     M: 756715,  H: 1001510 },
      { k: 'Mediana',   M: 555362,  H: 698255 }
    ];
    const y = d3.scaleLinear().domain([0, 1100000]).range([dim.h - dim.m.b, dim.m.t]);
    const groups = d3.scaleBand().domain(data.map(d => d.k)).range([dim.m.t, dim.h - dim.m.b]).padding(0.3);
    const sub = d3.scaleBand().domain(['M', 'H']).range([0, groups.bandwidth()]).padding(0.05);

    svg.selectAll('rect.M')
      .data(data).enter().append('rect')
      .attr('x', d => groups(d.k) + sub('M'))
      .attr('y', d => y(d.M))
      .attr('width', sub.bandwidth())
      .attr('height', d => (dim.h - dim.m.b) - y(d.M))
      .attr('fill', PALETTE.female).attr('opacity', 0.9);
    svg.selectAll('rect.H')
      .data(data).enter().append('rect')
      .attr('x', d => groups(d.k) + sub('H'))
      .attr('y', d => y(d.H))
      .attr('width', sub.bandwidth())
      .attr('height', d => (dim.h - dim.m.b) - y(d.H))
      .attr('fill', PALETTE.male).attr('opacity', 0.9);

    svg.selectAll('text.vM')
      .data(data).enter().append('text')
      .attr('x', d => groups(d.k) + sub('M') + sub.bandwidth() / 2)
      .attr('y', d => y(d.M) - 6)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => '$' + A.fmt(d.M / 1000) + 'k');
    svg.selectAll('text.vH')
      .data(data).enter().append('text')
      .attr('x', d => groups(d.k) + sub('H') + sub.bandwidth() / 2)
      .attr('y', d => y(d.H) - 6)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => '$' + A.fmt(d.H / 1000) + 'k');

    // Brecha label
    svg.append('text').attr('x', dim.m.l).attr('y', dim.m.t - 12).attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('Brecha media: −24,4% en desmedro de las mujeres (ESI 2024)');

    // Legend
    svg.append('rect').attr('x', dim.m.l).attr('y', dim.h - 20).attr('width', 10).attr('height', 10).attr('fill', PALETTE.female);
    svg.append('text').attr('x', dim.m.l + 14).attr('y', dim.h - 11).attr('font-size', 9).attr('fill', PALETTE.text).text('Mujeres');
    svg.append('rect').attr('x', dim.m.l + 80).attr('y', dim.h - 20).attr('width', 10).attr('height', 10).attr('fill', PALETTE.male);
    svg.append('text').attr('x', dim.m.l + 94).attr('y', dim.h - 11).attr('font-size', 9).attr('fill', PALETTE.text).text('Hombres');

    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(groups))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 10); });
    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => '$' + (d / 1000) + 'k'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m3Inm() {
    const id = 'chart-m3-inm', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 36, l: 50 });
    const data = D.HIST_INM;
    const x = d3.scaleBand().domain(data.map(d => d.fecha)).range([dim.m.l, dim.w - dim.m.r]).padding(0.25);
    const y = d3.scaleLinear().domain([0, 600000]).range([dim.h - dim.m.b, dim.m.t]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', d => x(d.fecha)).attr('y', d => y(d.monto))
      .attr('width', x.bandwidth())
      .attr('height', d => (dim.h - dim.m.b) - y(d.monto))
      .attr('fill', (d, i) => i === data.length - 1 ? PALETTE.red : PALETTE.blue)
      .attr('opacity', 0.85);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.fecha) + x.bandwidth() / 2)
      .attr('y', d => y(d.monto) - 6)
      .attr('text-anchor', 'middle').attr('font-size', 9).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => '$' + A.fmt(d.monto / 1000) + 'k');

    svg.append('text').attr('x', dim.w / 2).attr('y', dim.m.t + 4).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('Sueldo mínimo Chile: +58% desde mar-2022 ($350k → $553.553)');

    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 8).attr('transform', 'rotate(-30)').attr('text-anchor', 'end'); });
    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => '$' + (d / 1000) + 'k'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  // ====================================================================
  // MÓDULO 4: JORNADA Y 40 HORAS
  // ====================================================================

  function m4Tramo() {
    const id = 'chart-m4-tramo', w = 720, h = 360;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 40, l: 60 });
    const data = D.TRAMO_HORAS;
    const x = d3.scaleBand().domain(data.map(d => d.tramo)).range([dim.m.l, dim.w - dim.m.r]).padding(0.2);
    const y = d3.scaleLinear().domain([0, 40]).range([dim.h - dim.m.b, dim.m.t]);
    const sub = d3.scaleBand().domain(['antes', 'despues']).range([0, x.bandwidth()]).padding(0.06);

    svg.selectAll('rect.antes')
      .data(data).enter().append('rect')
      .attr('x', d => x(d.tramo) + sub('antes'))
      .attr('y', d => y(d.antes))
      .attr('width', sub.bandwidth())
      .attr('height', d => (dim.h - dim.m.b) - y(d.antes))
      .attr('fill', PALETTE.blueLt).attr('opacity', 0.85);
    svg.selectAll('rect.despues')
      .data(data).enter().append('rect')
      .attr('x', d => x(d.tramo) + sub('despues'))
      .attr('y', d => y(d.despues))
      .attr('width', sub.bandwidth())
      .attr('height', d => (dim.h - dim.m.b) - y(d.despues))
      .attr('fill', PALETTE.red).attr('opacity', 0.9);

    svg.selectAll('text.va')
      .data(data).enter().append('text')
      .attr('x', d => x(d.tramo) + sub('antes') + sub.bandwidth() / 2)
      .attr('y', d => y(d.antes) - 4)
      .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', PALETTE.ink)
      .text(d => d.antes.toFixed(1) + '%');
    svg.selectAll('text.vd')
      .data(data).enter().append('text')
      .attr('x', d => x(d.tramo) + sub('despues') + sub.bandwidth() / 2)
      .attr('y', d => y(d.despues) - 4)
      .attr('text-anchor', 'middle').attr('font-size', 9).attr('font-weight', 700).attr('fill', PALETTE.red)
      .text(d => d.despues.toFixed(1) + '%');

    // Leyenda
    svg.append('rect').attr('x', dim.m.l).attr('y', dim.m.t - 12).attr('width', 10).attr('height', 10).attr('fill', PALETTE.blueLt);
    svg.append('text').attr('x', dim.m.l + 14).attr('y', dim.m.t - 3).attr('font-size', 10).attr('fill', PALETTE.text).text('Antes Ley 21.561');
    svg.append('rect').attr('x', dim.m.l + 130).attr('y', dim.m.t - 12).attr('width', 10).attr('height', 10).attr('fill', PALETTE.red);
    svg.append('text').attr('x', dim.m.l + 144).attr('y', dim.m.t - 3).attr('font-size', 10).attr('fill', PALETTE.text).text('Post implementación');

    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 10); });
    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m4Prod() {
    const id = 'chart-m4-prod', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 32, l: 80 });
    const data = [...D.PRODUCTIVIDAD].sort((a, b) => a.valor - b.valor);
    const y = d3.scaleBand().domain(data.map(d => d.pais)).range([dim.m.t, dim.h - dim.m.b]).padding(0.15);
    const x = d3.scaleLinear().domain([0, 110]).range([dim.m.l, dim.w - dim.m.r]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l).attr('y', d => y(d.pais))
      .attr('width', d => x(d.valor) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', d => d.destacado ? PALETTE.red : d.pais === 'OCDE prom.' ? PALETTE.green : PALETTE.blueLt)
      .attr('opacity', d => d.destacado ? 0.9 : 0.7);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.valor) + 4)
      .attr('y', d => y(d.pais) + y.bandwidth() / 2 + 4)
      .attr('font-size', 10).attr('font-weight', d => d.destacado ? 700 : 400).attr('fill', PALETTE.ink)
      .text(d => '$' + d.valor);

    svg.append('text').attr('x', dim.w / 2).attr('y', dim.m.t - 4).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('PIB por hora trabajada (USD PPP, 2023)');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m4Plat() {
    const id = 'chart-m4-plat', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 30, r: 16, b: 32, l: 80 });
    const data = [
      { k: 'Trabajadores/mes prom. 2024', v: D.PLATAFORMAS.trabajadores_mes_2024, color: PALETTE.blue },
      { k: 'Boletas emitidas 2024', v: D.PLATAFORMAS.boletas_emitidas_2024, color: PALETTE.amber }
    ];
    const y = d3.scaleBand().domain(data.map(d => d.k)).range([dim.m.t, dim.h - dim.m.b]).padding(0.3);
    const x = d3.scaleLinear().domain([0, 250000]).range([dim.m.l, dim.w - dim.m.r]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l).attr('y', d => y(d.k))
      .attr('width', d => x(d.v) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', d => d.color).attr('opacity', 0.9);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.v) + 6)
      .attr('y', d => y(d.k) + y.bandwidth() / 2 + 4)
      .attr('font-size', 11).attr('font-weight', 700).attr('fill', PALETTE.ink)
      .text(d => A.fmt(d.v));

    svg.append('text').attr('x', dim.m.l).attr('y', dim.m.t - 14).attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('Ley 21.431: protección social obligatoria desde jul-2025');
    svg.append('text').attr('x', dim.m.l).attr('y', dim.m.t - 2).attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('50,1% de los que emiten boleta declaran renta');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => A.fmt(d)))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  // ====================================================================
  // MÓDULO 5: PROTECCIÓN SOCIAL
  // ====================================================================

  function m5Prev() {
    const id = 'chart-m5-prev', w = 720, h = 360;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 20, r: 16, b: 60, l: 50 });
    const data = D.GRADUALIDAD_PREV;
    const x = d3.scaleBand().domain(data.map(d => d.periodo)).range([dim.m.l, dim.w - dim.m.r]).padding(0.2);
    const stack = d3.stack().keys(['ci', 'crp', 'cev'])(data);
    const y = d3.scaleLinear().domain([0, 10]).range([dim.h - dim.m.b, dim.m.t]);
    const colors = { ci: PALETTE.blue, crp: PALETTE.green, cev: PALETTE.amber };

    svg.selectAll('g.layer')
      .data(stack).enter().append('g')
      .attr('class', 'layer')
      .attr('fill', d => colors[d.key])
      .selectAll('rect')
      .data(d => d).enter().append('rect')
      .attr('x', d => x(d.data.periodo))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .attr('opacity', 0.9);

    // Total label
    svg.selectAll('text.tot')
      .data(data).enter().append('text')
      .attr('x', d => x(d.periodo) + x.bandwidth() / 2)
      .attr('y', d => y(d.total) - 6)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('font-weight', 700).attr('fill', PALETTE.ink)
      .text(d => d.total.toFixed(1) + '%');

    // Legend
    svg.append('rect').attr('x', dim.m.l).attr('y', dim.m.t - 14).attr('width', 10).attr('height', 10).attr('fill', PALETTE.blue);
    svg.append('text').attr('x', dim.m.l + 14).attr('y', dim.m.t - 5).attr('font-size', 9).attr('fill', PALETTE.text).text('Cap. Individual (CI)');
    svg.append('rect').attr('x', dim.m.l + 130).attr('y', dim.m.t - 14).attr('width', 10).attr('height', 10).attr('fill', PALETTE.green);
    svg.append('text').attr('x', dim.m.l + 144).attr('y', dim.m.t - 5).attr('font-size', 9).attr('fill', PALETTE.text).text('Rentab. protegida (CRP)');
    svg.append('rect').attr('x', dim.m.l + 280).attr('y', dim.m.t - 14).attr('width', 10).attr('height', 10).attr('fill', PALETTE.amber);
    svg.append('text').attr('x', dim.m.l + 294).attr('y', dim.m.t - 5).attr('font-size', 9).attr('fill', PALETTE.text).text('Comp. esp. vida (CEV) + SIS');

    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 8).attr('transform', 'rotate(-25)').attr('text-anchor', 'end'); });
    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m5Lm() {
    const id = 'chart-m5-lm', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 32, l: 100 });
    const data = D.LICENCIAS.diagnosticos;
    const y = d3.scaleBand().domain(data.map(d => d.grupo)).range([dim.m.t, dim.h - dim.m.b]).padding(0.15);
    const x = d3.scaleLinear().domain([0, 35]).range([dim.m.l, dim.w - dim.m.r]);
    const colors = [PALETTE.red, PALETTE.amber, PALETTE.blue, PALETTE.green, '#8b5cf6', '#94a3b8'];

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l).attr('y', d => y(d.grupo))
      .attr('width', d => x(d.pct) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', (d, i) => colors[i]).attr('opacity', 0.85);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.pct) + 4)
      .attr('y', d => y(d.grupo) + y.bandwidth() / 2 + 4)
      .attr('font-size', 11).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => d.pct.toFixed(1) + '%');

    svg.append('text').attr('x', dim.m.l).attr('y', dim.m.t - 4).attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('SUSESO 2025: 7.016.470 licencias (−12,9% 12m)');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m5Nc() {
    const id = 'chart-m5-nc', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 32, l: 90 });
    const data = [
      { k: 'Huelgas aprobadas', v: D.HUELGAS.aprobadas, color: PALETTE.amber },
      { k: 'Huelgas efectivas', v: D.HUELGAS.efectivas, color: PALETTE.red },
      { k: 'Trabajadores', v: D.HUELGAS.trabajadores, color: PALETTE.blue },
      { k: 'Contratos registrados', v: D.HUELGAS.contratos, color: PALETTE.green }
    ];
    const y = d3.scaleBand().domain(data.map(d => d.k)).range([dim.m.t, dim.h - dim.m.b]).padding(0.2);
    const x = d3.scaleLinear().domain([0, 1800000]).range([dim.m.l, dim.w - dim.m.r]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l).attr('y', d => y(d.k))
      .attr('width', d => x(d.v) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', d => d.color).attr('opacity', 0.85);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.v) + 4)
      .attr('y', d => y(d.k) + y.bandwidth() / 2 + 4)
      .attr('font-size', 11).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => A.fmt(d.v));

    svg.append('text').attr('x', dim.m.l).attr('y', dim.m.t - 4).attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('DT · 2022 – 2025 · Solo 18,1% de las huelgas se concreta');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d >= 1e6 ? (d / 1e6) + 'M' : A.fmt(d)))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  // ====================================================================
  // MÓDULO 6: SEGMENTOS CRÍTICOS
  // ====================================================================

  function m6Brechas(filtros) {
    const id = 'chart-m6-brechas', w = 720, h = 360;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 20, r: 16, b: 32, l: 50 });
    const data = [
      { k: 'Nacional',       v: 9.4 },
      { k: 'Mujeres',        v: 10.5 },
      { k: 'Hombres',        v: 8.6 },
      { k: 'Jóvenes 15-24',  v: 24.6 },
      { k: 'Mujeres 15-24',  v: 28.3 },
      { k: 'Hombres 15-24',  v: 21.6 },
      { k: 'Extranjeros',    v: 6.6 },
      { k: 'Chilenos',       v: 9.7 }
    ];
    const adj = data.map(d => ({ ...d, vAdj: A.aplicarFiltros('desocupacion', filtros, d.v) }));
    const x = d3.scaleBand().domain(adj.map(d => d.k)).range([dim.m.l, dim.w - dim.m.r]).padding(0.25);
    const y = d3.scaleLinear().domain([0, 32]).range([dim.h - dim.m.b, dim.m.t]);

    svg.selectAll('rect')
      .data(adj).enter().append('rect')
      .attr('x', d => x(d.k))
      .attr('y', d => y(d.vAdj))
      .attr('width', x.bandwidth())
      .attr('height', d => (dim.h - dim.m.b) - y(d.vAdj))
      .attr('fill', d => d.k.includes('Jóvenes') || d.k.includes('15-24') ? PALETTE.red : d.k === 'Nacional' ? PALETTE.ink : PALETTE.blue)
      .attr('opacity', 0.9);

    svg.selectAll('text.v')
      .data(adj).enter().append('text')
      .attr('x', d => x(d.k) + x.bandwidth() / 2)
      .attr('y', d => y(d.vAdj) - 6)
      .attr('text-anchor', 'middle').attr('font-size', 9).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => d.vAdj.toFixed(1) + '%');

    svg.append('text').attr('x', dim.m.l).attr('y', dim.m.t - 4).attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('Tasa de desocupación por segmento · ajuste por filtros activos');

    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 8).attr('transform', 'rotate(-25)').attr('text-anchor', 'end'); });
    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m6Su3(filtros) {
    const id = 'chart-m6-su3', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 20, r: 16, b: 32, l: 70 });
    const sel = filtros.sexo === 'mujeres' ? 1 : filtros.sexo === 'hombres' ? 0 : null;
    const data = sel === null ? D.SU3_GENERO : [D.SU3_GENERO[sel]];
    const groups = d3.scaleBand().domain(data.map(d => d.grupo)).range([dim.m.t, dim.h - dim.m.b]).padding(0.3);
    const sub = d3.scaleBand().domain(['su1', 'su2', 'su3']).range([0, groups.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear().domain([0, 25]).range([dim.h - dim.m.b, dim.m.t]);
    const colors = { su1: PALETTE.amber, su2: PALETTE.blue, su3: PALETTE.red };

    ['su1', 'su2', 'su3'].forEach(k => {
      svg.selectAll('rect.' + k)
        .data(data).enter().append('rect')
        .attr('x', d => groups(d.grupo) + sub(k))
        .attr('y', d => y(d[k]))
        .attr('width', sub.bandwidth())
        .attr('height', d => (dim.h - dim.m.b) - y(d[k]))
        .attr('fill', colors[k]).attr('opacity', 0.85);
    });

    ['su1', 'su2', 'su3'].forEach(k => {
      svg.selectAll('text.' + k)
        .data(data).enter().append('text')
        .attr('x', d => groups(d.grupo) + sub(k) + sub.bandwidth() / 2)
        .attr('y', d => y(d[k]) - 4)
        .attr('text-anchor', 'middle').attr('font-size', 8).attr('font-weight', 600).attr('fill', PALETTE.ink)
        .text(d => d[k].toFixed(1));
    });

    // Legend
    svg.append('rect').attr('x', dim.m.l).attr('y', dim.m.t - 14).attr('width', 10).attr('height', 10).attr('fill', colors.su1);
    svg.append('text').attr('x', dim.m.l + 14).attr('y', dim.m.t - 5).attr('font-size', 9).attr('fill', PALETTE.text).text('SU1');
    svg.append('rect').attr('x', dim.m.l + 60).attr('y', dim.m.t - 14).attr('width', 10).attr('height', 10).attr('fill', colors.su2);
    svg.append('text').attr('x', dim.m.l + 74).attr('y', dim.m.t - 5).attr('font-size', 9).attr('fill', PALETTE.text).text('SU2');
    svg.append('rect').attr('x', dim.m.l + 120).attr('y', dim.m.t - 14).attr('width', 10).attr('height', 10).attr('fill', colors.su3);
    svg.append('text').attr('x', dim.m.l + 134).attr('y', dim.m.t - 5).attr('font-size', 9).attr('fill', PALETTE.text).text('SU3');

    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(groups))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 10); });
    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  function m6Mig(filtros) {
    const id = 'chart-m6-mig', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 20, r: 16, b: 32, l: 80 });
    const data = [
      { k: 'Tasa participación', v: 79.9 },
      { k: 'Tasa ocupación',     v: 74.6 },
      { k: 'Tasa informalidad',  v: 30.2 },
      { k: 'Tasa desocupación',  v: 6.6 }
    ];
    const y = d3.scaleBand().domain(data.map(d => d.k)).range([dim.m.t, dim.h - dim.m.b]).padding(0.2);
    const x = d3.scaleLinear().domain([0, 100]).range([dim.m.l, dim.w - dim.m.r]);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', dim.m.l).attr('y', d => y(d.k))
      .attr('width', d => x(d.v) - dim.m.l)
      .attr('height', y.bandwidth())
      .attr('fill', (d, i) => i === 2 ? PALETTE.red : PALETTE.blue)
      .attr('opacity', 0.85);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => x(d.v) + 4)
      .attr('y', d => y(d.k) + y.bandwidth() / 2 + 4)
      .attr('font-size', 11).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => d.v.toFixed(1) + '%');

    svg.append('text').attr('x', dim.m.l).attr('y', dim.m.t - 4).attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('Migrantes: 11% de ocupados · 1,022.990 personas');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
  }

  // ====================================================================
  // MÓDULO 7: CONTEXTO MACRO
  // ====================================================================

  function m7Ciclo() {
    const id = 'chart-m7-ciclo', w = 720, h = 360;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 20, r: 50, b: 32, l: 50 });
    const desoc = D.SERIE_DESOC.filter(d => d.v >= 0);
    const imacec = D.MACRO.imacec_12m;
    const x = d3.scaleBand().domain(imacec.map(d => d.p)).range([dim.m.l, dim.w - dim.m.r]).padding(0.2);
    const y1 = d3.scaleLinear().domain([-3, 3]).range([dim.h / 2, dim.m.t]);
    const y2 = d3.scaleLinear().domain([0, 12]).range([dim.h - dim.m.b, dim.h / 2]);

    // Línea IMACEC (arriba)
    const l1 = d3.line().x(d => x(d.p) + x.bandwidth() / 2).y(d => y1(d.v)).curve(d3.curveMonotoneX);
    svg.append('path').datum(imacec).attr('d', l1).attr('stroke', PALETTE.blue).attr('stroke-width', 2.5).attr('fill', 'none');
    svg.selectAll('c.im').data(imacec).enter().append('circle')
      .attr('cx', d => x(d.p) + x.bandwidth() / 2).attr('cy', d => y1(d.v)).attr('r', 3.5).attr('fill', PALETTE.blue);

    // Línea 0 IMACEC
    svg.append('line').attr('x1', dim.m.l).attr('x2', dim.w - dim.m.r).attr('y1', y1(0)).attr('y2', y1(0))
      .attr('stroke', PALETTE.ink).attr('stroke-dasharray', '3 3').attr('opacity', 0.4);

    // Bars desocupación (abajo)
    const desocMap = new Map(desoc.map(d => [d.p, d.v]));
    const lastPeriods = imacec.map(d => d.p);
    const lastDesoc = lastPeriods.map(p => desocMap.get(p) || 0);
    svg.selectAll('rect').data(lastDesoc).enter().append('rect')
      .attr('x', (d, i) => x(lastPeriods[i]))
      .attr('y', d => y2(d))
      .attr('width', x.bandwidth())
      .attr('height', d => (dim.h - dim.m.b) - y2(d))
      .attr('fill', PALETTE.red).attr('opacity', 0.8);

    // Labels
    svg.selectAll('t.im').data(imacec).enter().append('text')
      .attr('x', d => x(d.p) + x.bandwidth() / 2)
      .attr('y', d => y1(d.v) - 8)
      .attr('text-anchor', 'middle').attr('font-size', 9).attr('font-weight', 600).attr('fill', PALETTE.blue)
      .text(d => (d.v > 0 ? '+' : '') + d.v.toFixed(1) + '%');

    // Eje X
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9).attr('transform', 'rotate(-25)').attr('text-anchor', 'end'); });
    // Eje Y superior (IMACEC)
    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y1).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.blue).attr('font-size', 9); });
    // Eje Y derecho (desoc)
    svg.append('g').attr('transform', `translate(${dim.w - dim.r}, 0)`)
      .call(d3.axisRight(y2).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.red).attr('font-size', 9); });

    // Labels
    svg.append('text').attr('x', dim.m.l).attr('y', dim.m.t - 4).attr('font-size', 10).attr('fill', PALETTE.blue).text('IMACEC (% 12m)');
    svg.append('text').attr('x', dim.w - dim.m.r).attr('y', dim.m.t - 4).attr('text-anchor', 'end').attr('font-size', 10).attr('fill', PALETTE.red).text('Desocupación (%)');
  }

  function m7Sect() {
    const id = 'chart-m7-sect', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 32, l: 110 });
    const data = [...D.SECTORES].sort((a, b) => a.var - b.var);
    const y = d3.scaleBand().domain(data.map(d => d.sector)).range([dim.m.t, dim.h - dim.m.b]).padding(0.15);
    const x = d3.scaleLinear().domain([-8, 8]).range([dim.m.l, dim.w - dim.m.r]);
    const x0 = x(0);

    svg.selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', d => d.var < 0 ? x(d.var) : x0)
      .attr('y', d => y(d.sector))
      .attr('width', d => Math.abs(x(d.var) - x0))
      .attr('height', y.bandwidth())
      .attr('fill', d => d.var >= 0 ? PALETTE.blue : PALETTE.red)
      .attr('opacity', 0.85);

    svg.selectAll('text.v')
      .data(data).enter().append('text')
      .attr('x', d => d.var < 0 ? x(d.var) - 4 : x(d.var) + 4)
      .attr('y', d => y(d.sector) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', d => d.var < 0 ? 'end' : 'start')
      .attr('font-size', 10).attr('font-weight', 600).attr('fill', PALETTE.ink)
      .text(d => (d.var > 0 ? '+' : '') + d.var.toFixed(1) + '%');

    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => { g.selectAll('path, line').remove(); g.selectAll('text').attr('font-size', 10).attr('fill', PALETTE.text); });
    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => (d > 0 ? '+' : '') + d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
    svg.append('line').attr('x1', x0).attr('x2', x0).attr('y1', dim.m.t).attr('y2', dim.h - dim.m.b)
      .attr('stroke', PALETTE.ink).attr('stroke-width', 1);
  }

  function m7Beveridge() {
    const id = 'chart-m7-beveridge', w = 480, h = 320;
    const svg = svgInit(id, w, h);
    const dim = makeMargin(svg, w, h, { t: 16, r: 16, b: 32, l: 50 });
    const data = A.construirBeveridge();
    const x = d3.scaleLinear().domain([5, 12]).range([dim.m.l, dim.w - dim.m.r]);
    const y = d3.scaleLinear().domain([0, 3]).range([dim.h - dim.m.b, dim.m.t]);

    // Trajectory line
    const l = d3.line().x(d => x(d.x)).y(d => y(d.y)).curve(d3.curveMonotoneX);
    svg.append('path').datum(data).attr('d', l).attr('stroke', PALETTE.blue).attr('stroke-width', 2).attr('fill', 'none');

    svg.selectAll('circle')
      .data(data).enter().append('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', d => d.p === 'MAM 2026' ? 8 : 5)
      .attr('fill', d => d.p === 'MAM 2026' ? PALETTE.red : PALETTE.blue)
      .attr('opacity', 0.85);

    svg.selectAll('text.lbl')
      .data(data).enter().append('text')
      .attr('x', d => x(d.x) + 8)
      .attr('y', d => y(d.y) - 8)
      .attr('font-size', 9).attr('fill', PALETTE.text)
      .text(d => d.p);

    svg.append('text').attr('x', dim.m.l).attr('y', dim.m.t - 4).attr('font-size', 10).attr('fill', PALETTE.textLt)
      .text('Hacia abajo-derecha: caída de vacantes + alza de desempleo');

    svg.append('g').attr('transform', `translate(0, ${dim.h - dim.m.b})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
    svg.append('g').attr('transform', `translate(${dim.m.l}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d.toFixed(1)))
      .call(g => { g.selectAll('line, path').attr('stroke', PALETTE.grid); g.selectAll('text').attr('fill', PALETTE.textLt).attr('font-size', 9); });
    svg.append('text').attr('x', dim.w / 2).attr('y', dim.h - 4).attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', PALETTE.textLt).text('Tasa de desocupación');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -dim.h / 2).attr('y', 12).attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', PALETTE.textLt).text('Vacantes (índice BNE/SENCE)');
  }

  // ============== EXPORT ==============
  global.ML_MODULES = {
    m1Series: m1Series, m1Piramide: m1Piramide, m1Decomp: m1Decomp, m1Scatter: m1Scatter,
    m2Cluster: m2Cluster, m2Empresa: m2Empresa, m2Decomp: m2Decomp, m2Ocde: m2Ocde,
    m3Decil: m3Decil, m3Bite: m3Bite, m3Genero: m3Genero, m3Inm: m3Inm,
    m4Tramo: m4Tramo, m4Prod: m4Prod, m4Plat: m4Plat,
    m5Prev: m5Prev, m5Lm: m5Lm, m5Nc: m5Nc,
    m6Brechas: m6Brechas, m6Su3: m6Su3, m6Mig: m6Mig,
    m7Ciclo: m7Ciclo, m7Sect: m7Sect, m7Beveridge: m7Beveridge
  };
})(typeof window !== 'undefined' ? window : this);
