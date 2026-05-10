// ── Acceso a electron ─────────────────────────────────────────────
const elec = window.electron ?? window.parent?.electron

// ── Fecha de ayer ─────────────────────────────────────────────────
const ayer = new Date()
ayer.setDate(ayer.getDate() - 1)
const fechaAyerISO = ayer.toISOString().slice(0, 10)

document.getElementById('fechaAyer').textContent =
  ayer.toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric',
    month: 'long', year: 'numeric'
  })

// ── Llamada a Python ──────────────────────────────────────────────
async function python(cmd, args = []) {
  try {
    return await elec.ejecutarPython('logistica.py', [cmd, ...args])
  } catch (err) {
    console.error(`[Ventas] Error en ${cmd}:`, err)
    return null
  }
}

// ── Helpers ───────────────────────────────────────────────────────
function fmtPeso(n) {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2 })
}

function fmtHora(str) {
  try {
    const d = new Date(str)
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  } catch { return str }
}

// ── Estado ────────────────────────────────────────────────────────
const tbody        = document.getElementById('tablaVentas')
const inputBuscar  = document.getElementById('inputBuscar')
const filtroMetodo = document.getElementById('filtroMetodo')

let ventasDB = []

// ── Resumen ───────────────────────────────────────────────────────
function actualizarResumen(lista) {
  const total    = lista.reduce((s, v) => s + v.total, 0)
  const efectivo = lista.filter(v => v.metodo === 'Efectivo').reduce((s, v) => s + v.total, 0)
  const tarjeta  = lista.filter(v => v.metodo === 'Tarjeta').reduce((s, v) => s + v.total, 0)

  document.getElementById('resVentas').textContent   = fmtPeso(total)
  document.getElementById('resEfectivo').textContent = fmtPeso(efectivo)
  document.getElementById('resTarjeta').textContent  = fmtPeso(tarjeta)
}

// ── Renderizar ────────────────────────────────────────────────────
function renderizar(lista) {
  tbody.innerHTML = ''
  actualizarResumen(lista)

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;color:#C8A88A;padding:24px">
          Sin resultados
        </td>
      </tr>`
    return
  }

  lista.forEach(v => {
    const clase = v.metodo === 'Efectivo' ? 'efectivo' : 'tarjeta'
    const fila  = document.createElement('tr')
    fila.innerHTML = `
      <td>#${v.id}</td>
      <td>${v.producto}</td>
      <td>${v.cantidad}</td>
      <td>${fmtPeso(v.precio)}</td>
      <td>${fmtPeso(v.total)}</td>
      <td><span class="badge ${clase}">${v.metodo}</span></td>
      <td>${fmtHora(v.fecha)}</td>
    `
    tbody.appendChild(fila)
  })
}

// ── Filtro en memoria ─────────────────────────────────────────────
function filtrar() {
  const texto  = inputBuscar.value.toLowerCase()
  const metodo = filtroMetodo.value

  const lista = ventasDB.filter(v => {
    const coincideTexto  = v.producto.toLowerCase().includes(texto) ||
                           String(v.id).includes(texto)
    const coincideMetodo = metodo ? v.metodo === metodo : true
    return coincideTexto && coincideMetodo
  })

  renderizar(lista)
}

inputBuscar.addEventListener('input', filtrar)
filtroMetodo.addEventListener('change', filtrar)

// ── Carga desde BD (solo ayer) ────────────────────────────────────
async function cargarVentas() {
  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align:center;color:#C8A88A;padding:24px">
        Cargando...
      </td>
    </tr>`

  const data = await python('ventas_tabla', ['mensual',
    ayer.getFullYear(),
    ayer.getMonth() + 1,
    1,
    fechaAyerISO,
    fechaAyerISO
  ])

  if (!data || !Array.isArray(data)) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;color:#C0392B;padding:24px">
          Error al cargar ventas
        </td>
      </tr>`
    return
  }

  ventasDB = data
  filtrar()
}

// ── Carga inicial ─────────────────────────────────────────────────
cargarVentas()

// ── Recargar tras sincronización ──────────────────────────────────
if (elec?.onSyncFinished) {
  elec.onSyncFinished(() => cargarVentas())
}