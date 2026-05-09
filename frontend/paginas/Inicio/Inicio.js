// ── Fecha de ayer ─────────────────────────────────────────
const ayer = new Date()
ayer.setDate(ayer.getDate() - 1)
document.getElementById('fechaAyer').textContent =
  ayer.toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

// ── Botón Actualizar ──────────────────────────────────────
document.getElementById('btnActualizar').addEventListener('click', () => {
  mostrarCargando()
  window.parent.postMessage('solicitar_datos', '*')
})

// ── Recibir datos desde Ventana.js ────────────────────────
window.addEventListener('message', (e) => {
  if (!e.data || e.data.tipo !== 'dashboard_data') return
  renderResumen(e.data.resumen)
  renderStock(e.data.stock)
  renderProductos(e.data.productos)
})

// ── Estado visual ─────────────────────────────────────────
function mostrarCargando() {
  document.getElementById('kpiVentas').textContent    = '...'
  document.getElementById('kpiStockBajo').textContent = '...'
  document.getElementById('kpiCumplidas').textContent = '...'
  document.getElementById('listaStock').innerHTML     = '<div class="cargando">Cargando...</div>'
  document.getElementById('tablaProductos').innerHTML = '<tr><td colspan="3" class="cargando">Cargando...</td></tr>'
  setBtnEstado('cargando')
}

function setBtnEstado(estado) {
  const btn = document.getElementById('btnActualizar')
  btn.textContent = estado === 'cargando' ? '↻ Cargando...' : '↻ Actualizar'
  btn.disabled    = estado === 'cargando'
}

// ── Renders ───────────────────────────────────────────────
function renderResumen(d) {
  setBtnEstado('listo')
  if (!d || d.__error) {
    ['kpiVentas','kpiStockBajo','kpiCumplidas'].forEach(id =>
      document.getElementById(id).textContent = '—')
    return
  }
  document.getElementById('kpiVentas').textContent =
    '$' + d.total_ventas.toLocaleString('es-MX', { minimumFractionDigits: 2 })
  document.getElementById('kpiStockBajo').textContent = d.stock_bajo
  document.getElementById('kpiCumplidas').textContent = d.ventas_cumplidas
}

function renderStock(lista) {
  const c = document.getElementById('listaStock')
  if (!lista || lista.__error || lista.length === 0) {
    c.innerHTML = '<div class="sin-datos">Sin productos en stock bajo</div>'
    return
  }
  c.innerHTML = ''
  lista.forEach(item => {
    const f = document.createElement('div')
    f.className = 'stock-row'
    f.innerHTML = `<span>${item.nombre}</span><span class="nivel-${item.nivel}">${item.cantidad} pzs</span>`
    c.appendChild(f)
  })
}

function renderProductos(lista) {
  const tbody = document.getElementById('tablaProductos')
  if (!lista || lista.__error || lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="sin-datos">Sin ventas registradas ayer</td></tr>'
    return
  }
  tbody.innerHTML = ''
  lista.forEach(item => {
    const f = document.createElement('tr')
    f.innerHTML = `<td>${item.nombre}</td><td>${item.unidades}</td><td>$${item.subtotal.toLocaleString('es-MX',{minimumFractionDigits:2})}</td>`
    tbody.appendChild(f)
  })
}

// ── Arranque: avisar al padre que el iframe ya está listo ──
mostrarCargando()
window.parent.postMessage('solicitar_datos', '*')