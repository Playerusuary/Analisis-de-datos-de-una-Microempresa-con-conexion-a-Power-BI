// ── Fecha de ayer ─────────────────────────────────────────
const ayer = new Date()
ayer.setDate(ayer.getDate() - 1)
document.getElementById('fechaAyer').textContent =
  ayer.toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric',
    month: 'long',   year: 'numeric'
  })

// ── Llamada a Python ──────────────────────────────────────
async function python(cmd) {
  try {
    return await window.electron.ejecutarPython('logistica.py', [cmd])
  } catch (err) {
    console.error(`Error en ${cmd}:`, err)
    return null
  }
}

// ── Cargar KPIs ───────────────────────────────────────────
async function cargarResumen() {
  const d = await python('dashboard_resumen')
  if (!d) return

  document.getElementById('kpiVentas').textContent =
    '$' + d.total_ventas.toLocaleString('es-MX', { minimumFractionDigits: 2 })
  document.getElementById('kpiStockBajo').textContent  = d.stock_bajo
  document.getElementById('kpiCumplidas').textContent  = d.ventas_cumplidas
}

// ── Cargar stock bajo ─────────────────────────────────────
async function cargarStock() {
  const lista   = await python('dashboard_stock')
  const contenedor = document.getElementById('listaStock')
  contenedor.innerHTML = ''

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = '<div class="sin-datos">Sin productos en stock bajo</div>'
    return
  }

  lista.forEach(item => {
    const fila = document.createElement('div')
    fila.className = 'stock-row'
    fila.innerHTML = `
      <span>${item.nombre}</span>
      <span class="nivel-${item.nivel}">${item.cantidad} pzs</span>
    `
    contenedor.appendChild(fila)
  })
}

// ── Cargar productos vendidos ayer ────────────────────────
async function cargarProductos() {
  const lista = await python('dashboard_productos')
  const tbody = document.getElementById('tablaProductos')
  tbody.innerHTML = ''

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="sin-datos">Sin ventas registradas ayer</td>
      </tr>`
    return
  }

  lista.forEach(item => {
    const fila = document.createElement('tr')
    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.unidades}</td>
      <td>$${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
    `
    tbody.appendChild(fila)
  })
}

// ── Iniciar ───────────────────────────────────────────────
Promise.all([cargarResumen(), cargarStock(), cargarProductos()])