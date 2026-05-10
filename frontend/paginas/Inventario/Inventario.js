// ── Acceso a electron (funciona en iframe y en ventana directa) ───
const elec = window.electron ?? window.parent?.electron

// ── Llamada a Python ──────────────────────────────────────────────
async function python(cmd) {
  try {
    return await elec.ejecutarPython('logistica.py', [cmd])
  } catch (err) {
    console.error(`[Inventario] Error en ${cmd}:`, err)
    return null
  }
}

const etiquetas = {
  ok:   { texto: 'Normal',      clase: 'ok'   },
  warn: { texto: 'Stock medio', clase: 'warn' },
  low:  { texto: 'Stock bajo',  clase: 'low'  }
}

const tbody           = document.getElementById('tablaInventario')
const inputBuscar     = document.getElementById('inputBuscar')
const filtroCategoria = document.getElementById('filtroCategoria')
const filtroStock     = document.getElementById('filtroStock')

let productosDB = []

// ── Resumen ───────────────────────────────────────────────────────
function actualizarResumen(lista) {
  document.getElementById('resTotal').textContent = lista.reduce((s, p) => s + p.cantidad, 0)
  document.getElementById('resMedio').textContent = lista.filter(p => p.estado === 'warn').length
  document.getElementById('resBajo').textContent  = lista.filter(p => p.estado === 'low').length
}

// ── Renderizar tabla ──────────────────────────────────────────────
function renderizar(lista) {
  tbody.innerHTML = ''
  actualizarResumen(lista)

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#C8A88A;padding:24px">
          Sin resultados
        </td>
      </tr>`
    return
  }

  lista.forEach(p => {
    const { texto, clase } = etiquetas[p.estado] || etiquetas['ok']
    const fila = document.createElement('tr')
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${p.cantidad}</td>
      <td>$${p.precio.toFixed(2)}</td>
      <td><span class="badge ${clase}">${texto}</span></td>
    `
    tbody.appendChild(fila)
  })
}

// ── Filtros ───────────────────────────────────────────────────────
function filtrar() {
  const texto     = inputBuscar.value.toLowerCase()
  const categoria = filtroCategoria.value
  const stock     = filtroStock.value

  const lista = productosDB.filter(p => {
    const coincideTexto     = p.nombre.toLowerCase().includes(texto)
    const coincideCategoria = categoria ? p.categoria === categoria : true
    const coincideStock     = stock     ? p.estado    === stock     : true
    return coincideTexto && coincideCategoria && coincideStock
  })

  renderizar(lista)
}

inputBuscar.addEventListener('input', filtrar)
filtroCategoria.addEventListener('change', filtrar)
filtroStock.addEventListener('change', filtrar)

// ── Poblar selector de categorías dinámicamente ───────────────────
function poblarCategorias(productos) {
  const cats = [...new Set(productos.map(p => p.categoria))].sort()
  filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>'
  cats.forEach(cat => {
    const opt = document.createElement('option')
    opt.value       = cat
    opt.textContent = cat
    filtroCategoria.appendChild(opt)
  })
}

// ── Carga desde BD ────────────────────────────────────────────────
async function cargarInventario() {
  tbody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center;color:#C8A88A;padding:24px">
        Cargando...
      </td>
    </tr>`

  const data = await python('inventario')

  if (!data || !Array.isArray(data)) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#C0392B;padding:24px">
          Error al cargar inventario
        </td>
      </tr>`
    return
  }

  productosDB = data
  poblarCategorias(productosDB)
  renderizar(productosDB)
}

// ── Carga inicial ─────────────────────────────────────────────────
cargarInventario()

// ── Recargar cuando Python termina la sincronización ─────────────
const syncSrc = elec ?? window.parent?.electron
if (syncSrc?.onSyncFinished) {
  syncSrc.onSyncFinished(() => {
    console.log('[Inventario] Sync terminado — recargando...')
    cargarInventario()
  })
}