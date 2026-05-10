// ── Acceso a electron ─────────────────────────────────────────────
const elec = window.electron ?? window.parent?.electron

const C = {
  ladrillo: '#8B2E0F', madera: '#6B3A1F',
  dorado:   '#D4A017', verde:  '#2E7D32', rojo: '#C0392B'
}
const PALETA = ['#8B2E0F','#D4A017','#6B3A1F','#2E7D32','#C0392B',
                '#E65100','#5D4037','#827717','#00695C','#4A148C']
const MESES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const AÑOS   = [2024, 2025, 2026]

let periodo = 'semanal'
let selAnio = new Date().getFullYear()
let selMes  = new Date().getMonth() + 1
let selSem  = 1
let inst    = {}

// ── Llamada a Python (BD real) ────────────────────────────────────
async function llamarPython(cmd) {
  try {
    return await elec.ejecutarPython('logistica.py', [cmd, periodo, selAnio, selMes, selSem])
  } catch (err) {
    console.error(`[Graficos] Error en ${cmd}:`, err)
    return null
  }
}

// ── Sub-filtros dinámicos ─────────────────────────────────────────
function actualizarSubFiltros() {
  const sub = document.getElementById('subFiltros')
  sub.innerHTML = ''

  const sel = (id, opciones, valorActual, onChange) => {
    const el = document.createElement('select')
    el.className = 'sel'; el.id = id
    opciones.forEach(([val, txt]) => {
      const o = document.createElement('option')
      o.value = val; o.textContent = txt
      if (val == valorActual) o.selected = true
      el.appendChild(o)
    })
    el.addEventListener('change', () => onChange(el.value))
    return el
  }

  const lbl = txt => {
    const s = document.createElement('span')
    s.className = 'sub-label'; s.textContent = txt
    return s
  }

  const opAnios = AÑOS.map(a => [a, a])
  const opMeses = MESES.map((m, i) => [i + 1, m])
  const diasMes = new Date(selAnio, selMes, 0).getDate()
  const numSems = Math.ceil(diasMes / 7)
  const opSems  = Array.from({length: numSems}, (_, i) => [i + 1, `Semana ${i + 1}`])

  if (periodo === 'semanal') {
    // Semanal: año + mes + semana
    sub.append(
      lbl('Año:'),
      sel('sAnio', opAnios, selAnio, v => { selAnio = parseInt(v); actualizarSubFiltros(); cargarTodo() }),
      lbl('Mes:'),
      sel('sMes', opMeses, selMes, v => { selMes = parseInt(v); actualizarSubFiltros(); cargarTodo() }),
      lbl('Semana:'),
      sel('sSem', opSems, selSem, v => { selSem = parseInt(v); cargarTodo() })
    )
  } else if (periodo === 'mensual') {
    sub.append(
      lbl('Año:'),
      sel('sAnio', opAnios, selAnio, v => { selAnio = parseInt(v); cargarTodo() }),
      lbl('Mes:'),
      sel('sMes', opMeses, selMes, v => { selMes = parseInt(v); cargarTodo() })
    )
  } else {
    sub.append(
      lbl('Año:'),
      sel('sAnio', opAnios, selAnio, v => { selAnio = parseInt(v); cargarTodo() })
    )
  }
}

// ── Popup de ayuda ────────────────────────────────────────────────
const popup = document.getElementById('infoPopup')

function cerrarPopup() { popup.style.display = 'none' }

document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-info')
  if (btn) {
    e.stopPropagation()
    const rect = btn.getBoundingClientRect()
    popup.textContent = btn.dataset.tip
    popup.style.display = 'block'

    // Posición en viewport (fixed no usa scrollY/scrollX)
    let top  = rect.bottom + 6
    let left = rect.left

    // Medir el popup ya visible para ajustar si se sale
    const pw = popup.offsetWidth  || 270
    const ph = popup.offsetHeight || 60
    if (left + pw > window.innerWidth  - 8) left = window.innerWidth  - pw - 8
    if (left < 8) left = 8
    if (top  + ph > window.innerHeight - 8) top  = rect.top - ph - 6  // mostrar arriba

    popup.style.top  = top  + 'px'
    popup.style.left = left + 'px'
  } else {
    cerrarPopup()
  }
})

// Cerrar al hacer scroll en cualquier contenedor
document.addEventListener('scroll', cerrarPopup, true)

// ── Opciones base Chart.js ────────────────────────────────────────
function opBase(pre = '$') {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { size: 11 }, color: '#1A0E05' } },
      tooltip: { callbacks: { label: ctx =>
        ` ${ctx.dataset.label}: ${pre}${(ctx.parsed.y ?? ctx.parsed).toLocaleString('es-MX')}`
      }}
    },
    scales: {
      x: { ticks: { color: '#7A6050', font: { size: 10 } }, grid: { color: '#E0D5C8' } },
      y: { ticks: { color: '#7A6050', font: { size: 10 },
             callback: v => pre + v.toLocaleString('es-MX') }, grid: { color: '#E0D5C8' } }
    }
  }
}

function kill(id) { if (inst[id]) { inst[id].destroy(); delete inst[id] } }

// ── Render de cada gráfico ────────────────────────────────────────
async function renderGanancias() {
  const d = await llamarPython('ganancias')
  kill('g')
  if (!d || !d.labels) return
  inst.g = new Chart(document.getElementById('cGanancias'), { type: 'bar', data: { labels: d.labels,
    datasets: [
      { label: 'Ingresos', data: d.ingresos,  backgroundColor: C.verde   + 'BB', borderColor: C.verde,   borderWidth: 1 },
      { label: 'Costos',   data: d.costos,    backgroundColor: C.rojo    + 'BB', borderColor: C.rojo,    borderWidth: 1 },
      { label: 'Ganancia', data: d.ganancias, backgroundColor: C.dorado  + 'BB', borderColor: C.dorado,  borderWidth: 1 }
    ]}, options: opBase() })}

async function renderVentas() {
  const d = await llamarPython('ventas')
  kill('v')
  if (!d || !d.labels) return
  inst.v = new Chart(document.getElementById('cVentas'), { type: 'line', data: { labels: d.labels,
    datasets: [{ label: 'Ventas ($)', data: d.totales,
      borderColor: C.ladrillo, backgroundColor: C.ladrillo + '25',
      borderWidth: 2, pointBackgroundColor: C.ladrillo, pointRadius: 3, fill: true, tension: 0.4
    }]}, options: opBase() })}

async function renderProductos() {
  const d = await llamarPython('ventas_productos')
  kill('p')
  if (!d || !d.labels) return
  inst.p = new Chart(document.getElementById('cProductos'), { type: 'doughnut', data: { labels: d.labels,
    datasets: [{ data: d.unidades, backgroundColor: PALETA, borderColor: '#fff', borderWidth: 2 }]},
    options: { responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { font: { size: 10 }, color: '#1A0E05', boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => {
          const t = ctx.dataset.data.reduce((a, b) => a + b, 0)
          return ` ${ctx.label}: ${ctx.parsed} uds (${((ctx.parsed / t) * 100).toFixed(1)}%)`
        }}}
      }
    }
  })}

async function renderRanking() {
  const d = await llamarPython('ranking')
  kill('r')
  if (!d || !d.labels) return
  // Calcular margen % para mostrar en tooltip
  const margenes = d.labels.map((_, i) =>
    d.ingresos[i] > 0 ? +((d.ganancias[i] / d.ingresos[i]) * 100).toFixed(1) : 0
  )
  const opR = {
    ...opBase(),
    indexAxis: 'y',
    plugins: {
      legend: { labels: { font: { size: 11 }, color: '#1A0E05' } },
      tooltip: {
        callbacks: {
          label: ctx => {
            const i = ctx.dataIndex
            if (ctx.datasetIndex === 0)
              return ` Ganancia neta: $${ctx.parsed.x.toLocaleString('es-MX')}  (margen ${margenes[i]}%)`
            if (ctx.datasetIndex === 1)
              return ` Ingresos totales: $${ctx.parsed.x.toLocaleString('es-MX')}`
            return ` Costos: $${ctx.parsed.x.toLocaleString('es-MX')}`
          }
        }
      }
    }
  }
  inst.r = new Chart(document.getElementById('cRanking'), {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Ganancia neta', data: d.ganancias, backgroundColor: C.dorado + 'CC', borderColor: C.dorado, borderWidth: 1 },
        { label: 'Ingresos',      data: d.ingresos,  backgroundColor: C.verde  + '66', borderColor: C.verde,  borderWidth: 1 },
        { label: 'Costos',        data: d.costos,    backgroundColor: C.rojo   + '66', borderColor: C.rojo,   borderWidth: 1 }
      ]
    },
    options: opR
  })
}

async function renderFlujo() {
  const d = await llamarPython('flujo_caja')
  kill('f')

  const canvas = document.getElementById('cFlujo')
  const ctx2d  = canvas.getContext('2d')
  ctx2d.clearRect(0, 0, canvas.width, canvas.height)

  if (!d || !d.labels || d.labels.length === 0) {
    ctx2d.fillStyle = '#7A6050'
    ctx2d.font = '13px Segoe UI'
    ctx2d.textAlign = 'center'
    ctx2d.fillText('Sin datos de ventas en el período seleccionado.',
                   canvas.width / 2, canvas.height / 2)
    return
  }

  // Flujo neto = ventas - compras
  const flujoNeto = d.ventas.map((v, i) => +(v - d.compras[i]).toFixed(2))

  // Subtítulo dinámico según periodo
  const subTitulos = { semanal: 'por día', mensual: 'por día del mes', anual: 'por mes' }
  const subEl = document.querySelector('#cFlujo')
    ?.closest('.grafico-card')
    ?.querySelector('.grafico-sub')
  if (subEl) subEl.textContent = `Ventas vs Compras a proveedores — ${subTitulos[periodo] ?? ''}`

  const hayCompras = d.compras.some(v => v > 0)

  const datasets = [
    {
      label: 'Ventas',
      data: d.ventas,
      backgroundColor: C.verde + 'AA',
      borderColor: C.verde,
      borderWidth: 1,
      type: 'bar',
      order: 2
    },
    {
      label: 'Flujo neto',
      data: flujoNeto,
      borderColor: C.dorado,
      backgroundColor: C.dorado + '30',
      borderWidth: 2,
      pointBackgroundColor: flujoNeto.map(v => v >= 0 ? C.verde : C.rojo),
      pointRadius: 4,
      fill: false,
      tension: 0.3,
      type: 'line',
      order: 1
    }
  ]

  // Solo añadir dataset de Compras si hay al menos un valor > 0
  if (hayCompras) {
    datasets.splice(1, 0, {
      label: 'Compras a proveedores',
      data: d.compras,
      backgroundColor: C.ladrillo + 'AA',
      borderColor: C.ladrillo,
      borderWidth: 1,
      type: 'bar',
      order: 2
    })
  }

  inst.f = new Chart(canvas, {
    type: 'bar',
    data: { labels: d.labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { font: { size: 11 }, color: '#1A0E05' } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.y ?? ctx.parsed.x
              if (ctx.dataset.label === 'Flujo neto')
                return ` Flujo neto: $${v.toLocaleString('es-MX')} ${v >= 0 ? '▲ positivo' : '▼ negativo'}`
              return ` ${ctx.dataset.label}: $${v.toLocaleString('es-MX')}`
            },
            afterBody: items => {
              const i = items[0]?.dataIndex
              if (i === undefined) return []
              const v = d.ventas[i], c = d.compras[i]
              if (c === 0) return [`Compras ese período: $0`]
              const pct = ((v / c) * 100).toFixed(1)
              return [`Ventas representan el ${pct}% de las compras`]
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#7A6050', font: { size: 10 } }, grid: { color: '#E0D5C8' } },
        y: {
          ticks: { color: '#7A6050', font: { size: 10 },
                   callback: v => '$' + v.toLocaleString('es-MX') },
          grid: { color: '#E0D5C8' }
        }
      }
    }
  })
}

async function renderMermas() {
  const d = await llamarPython('mermas')
  kill('m')
  if (!d || !d.labels) return
  const opM = {
    ...opBase(''),
    plugins: {
      legend: { labels: { font: { size: 11 }, color: '#1A0E05' } },
      tooltip: {
        callbacks: {
          label: ctx => {
            if (ctx.datasetIndex === 0)
              return ` Unidades con merma: ${ctx.parsed.y} uds`
            return ` Pérdida económica: $${ctx.parsed.y.toLocaleString('es-MX')}`
          }
        }
      }
    },
    scales: {
      x: { ticks: { color: '#7A6050', font: { size: 10 } }, grid: { color: '#E0D5C8' } },
      y:  { position: 'left',  ticks: { color: C.rojo,    font: { size: 10 }, callback: v => v + ' uds' }, grid: { color: '#E0D5C8' } },
      y2: { position: 'right', ticks: { color: C.ladrillo, font: { size: 10 }, callback: v => '$' + v.toLocaleString('es-MX') },
            grid: { drawOnChartArea: false } }
    }
  }
  inst.m = new Chart(document.getElementById('cMermas'), {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        { label: 'Unidades con merma', data: d.merma,   backgroundColor: C.rojo    + 'BB', borderColor: C.rojo,    borderWidth: 1, yAxisID: 'y'  },
        { label: 'Pérdida ($)',         data: d.perdida, backgroundColor: C.ladrillo + 'BB', borderColor: C.ladrillo, borderWidth: 1, yAxisID: 'y2' }
      ]
    },
    options: opM
  })
}

// ── Cargar todo ───────────────────────────────────────────────────
async function cargarTodo() {
  document.getElementById('loading').style.display      = 'flex'
  document.getElementById('graficosGrid').style.display = 'none'

  await Promise.all([
    renderGanancias(), renderVentas(), renderProductos(),
    renderRanking(),   renderFlujo(), renderMermas()
  ])

  document.getElementById('loading').style.display      = 'none'
  document.getElementById('graficosGrid').style.display = 'grid'
}

// ── Botones de periodo ────────────────────────────────────────────
document.querySelectorAll('.btn-periodo').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-periodo').forEach(b => b.classList.remove('activo'))
    btn.classList.add('activo')
    periodo = btn.dataset.periodo
    actualizarSubFiltros()
    cargarTodo()
  })
})

// ── Recargar tras sincronización ──────────────────────────────────
if (elec?.onSyncFinished) {
  elec.onSyncFinished(() => cargarTodo())
}

// ── Init ──────────────────────────────────────────────────────────
actualizarSubFiltros()
cargarTodo()