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
let selMes  = new Date().getMonth() + 1   // 1-indexed
let selSem  = 1
let inst    = {}

// ── Llamada a Python ─────────────────────────────────────
async function llamarPython(cmd) {
  // En Electron: descomentar esta línea y borrar simularDatos()
  // return await window.electron.ejecutarPython('logistica.py', [cmd, periodo, selAnio, selMes, selSem])
  return simularDatos(cmd)
}

// ── Datos simulados (Live Server) ────────────────────────
function simularDatos(cmd) {
  const rand = (a, b) => Math.round(Math.random() * (b - a) + a)
  const dias = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
  const diasMes = new Date(selAnio, selMes, 0).getDate()
  const n = periodo === 'semanal' ? 7 : periodo === 'mensual' ? diasMes : 12
  const labels = periodo === 'semanal' ? dias
               : periodo === 'anual'   ? MESES.map(m => m.slice(0,3))
               : Array.from({length: n}, (_, i) => `${i+1}`)

  if (cmd === 'ganancias') {
    const ing = labels.map(() => rand(6000, 14000))
    const cos = ing.map(v => Math.round(v * 0.58))
    return { labels, ingresos: ing, costos: cos, ganancias: ing.map((v,i) => v - cos[i]) }
  }
  if (cmd === 'ventas')
    return { labels, totales: labels.map(() => rand(2000, 8000)) }
  if (cmd === 'ventas_productos') {
    const lb = ['Leche 1L','Arroz 1kg','Refresco','Aceite','Pan','Frijol','Azúcar','Jabón','Atún','Sal']
    return { labels: lb, unidades: lb.map(() => rand(50, 400)) }
  }
  if (cmd === 'ranking') return {
    labels:    ['Aceite Nutrioli','Arroz Valle','Frijol Verde','Azúcar Zulka','Leche Lala'],
    ganancias: [rand(3000,6000), rand(2500,5000), rand(2000,4000), rand(1800,3500), rand(1500,3000)],
    ingresos:  [rand(9000,14000), rand(7000,11000), rand(6000,9000), rand(5000,8000), rand(4000,7000)]
  }
  if (cmd === 'flujo_caja') {
    const lf = periodo === 'anual' ? MESES.map(m => m.slice(0,3)) : labels.slice(0, 6)
    const v  = lf.map(() => rand(15000, 50000))
    return { labels: lf, ventas: v, compras: v.map(x => Math.round(x * 0.55)) }
  }
  if (cmd === 'mermas') return {
    labels:   ['Aceite Nutrioli','Sal La Fina','Atún Dolores','Mermelada','Avena',
               'Mayonesa','Maruchan','Galletas','Café','Leche'],
    stock:    [80, 65, 55, 50, 45, 42, 38, 35, 30, 28],
    vendidos: [2, 4, 6, 8, 3, 10, 15, 5, 7, 12]
  }
}

// ── Sub-filtros dinámicos ─────────────────────────────────
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

  const opAnios  = AÑOS.map(a => [a, a])
  const opMeses  = MESES.map((m, i) => [i + 1, m])
  const diasMes  = new Date(selAnio, selMes, 0).getDate()
  const numSems  = Math.ceil(diasMes / 7)
  const opSems   = Array.from({length: numSems}, (_, i) => [i + 1, `Semana ${i + 1}`])

  if (periodo === 'semanal') {
    sub.append(
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

// ── Opciones base Chart.js ────────────────────────────────
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

// ── Render de cada gráfico ────────────────────────────────
async function renderGanancias() {
  const d = await llamarPython('ganancias')
  kill('g')
  inst.g = new Chart(document.getElementById('cGanancias'), { type: 'bar', data: { labels: d.labels,
    datasets: [
      { label: 'Ingresos', data: d.ingresos, backgroundColor: C.verde    + 'BB', borderColor: C.verde,    borderWidth: 1 },
      { label: 'Costos',   data: d.costos,   backgroundColor: C.rojo     + 'BB', borderColor: C.rojo,     borderWidth: 1 },
      { label: 'Ganancia', data: d.ganancias, backgroundColor: C.dorado  + 'BB', borderColor: C.dorado,   borderWidth: 1 }
    ]}, options: opBase() })
}

async function renderVentas() {
  const d = await llamarPython('ventas')
  kill('v')
  inst.v = new Chart(document.getElementById('cVentas'), { type: 'line', data: { labels: d.labels,
    datasets: [{ label: 'Ventas ($)', data: d.totales,
      borderColor: C.ladrillo, backgroundColor: C.ladrillo + '25',
      borderWidth: 2, pointBackgroundColor: C.ladrillo, pointRadius: 3, fill: true, tension: 0.4
    }]}, options: opBase() })
}

async function renderProductos() {
  const d = await llamarPython('ventas_productos')
  kill('p')
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
  })
}

async function renderRanking() {
  const d = await llamarPython('ranking')
  kill('r')
  inst.r = new Chart(document.getElementById('cRanking'), { type: 'bar', data: { labels: d.labels,
    datasets: [
      { label: 'Ganancia neta', data: d.ganancias, backgroundColor: C.dorado + 'BB', borderColor: C.dorado, borderWidth: 1 },
      { label: 'Ingresos',      data: d.ingresos,  backgroundColor: C.verde  + 'BB', borderColor: C.verde,  borderWidth: 1 }
    ]}, options: { ...opBase(), indexAxis: 'y' } })
}

async function renderFlujo() {
  const d = await llamarPython('flujo_caja')
  kill('f')
  inst.f = new Chart(document.getElementById('cFlujo'), { type: 'line', data: { labels: d.labels,
    datasets: [
      { label: 'Ventas',   data: d.ventas,   borderColor: C.verde,    backgroundColor: C.verde    + '20', borderWidth: 2, fill: true, tension: 0.4 },
      { label: 'Compras',  data: d.compras,  borderColor: C.ladrillo, backgroundColor: C.ladrillo + '20', borderWidth: 2, fill: true, tension: 0.4 }
    ]}, options: opBase() })
}

async function renderMermas() {
  const d = await llamarPython('mermas')
  kill('m')
  inst.m = new Chart(document.getElementById('cMermas'), { type: 'bar', data: { labels: d.labels,
    datasets: [
      { label: 'Stock disponible', data: d.stock,    backgroundColor: C.rojo   + 'BB', borderColor: C.rojo,   borderWidth: 1 },
      { label: 'Vendidos (30d)',   data: d.vendidos, backgroundColor: C.dorado + 'BB', borderColor: C.dorado, borderWidth: 1 }
    ]}, options: opBase('') })
}

// ── Cargar todo ───────────────────────────────────────────
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

// ── Botones de periodo ────────────────────────────────────
document.querySelectorAll('.btn-periodo').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-periodo').forEach(b => b.classList.remove('activo'))
    btn.classList.add('activo')
    periodo = btn.dataset.periodo
    actualizarSubFiltros()
    cargarTodo()
  })
})

// ── Init ──────────────────────────────────────────────────
actualizarSubFiltros()
cargarTodo()