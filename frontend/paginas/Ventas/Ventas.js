// Datos de ejemplo — después vendrán de SQLite vía conexiones/ipc.js
const ventas = [
  { id: '001', producto: 'Leche entera 1L',   cantidad: 6,  precio: 22.00, estado: 'e', etiqueta: 'Entregado', fecha: '07/05/2026' },
  { id: '002', producto: 'Pan blanco',         cantidad: 12, precio: 14.00, estado: 'e', etiqueta: 'Entregado', fecha: '07/05/2026' },
  { id: '003', producto: 'Jabón líquido',      cantidad: 3,  precio: 28.00, estado: 'p', etiqueta: 'Pendiente', fecha: '07/05/2026' },
  { id: '004', producto: 'Refresco 2L',        cantidad: 8,  precio: 32.00, estado: 'p', etiqueta: 'Pendiente', fecha: '07/05/2026' },
  { id: '005', producto: 'Aceite vegetal 1L',  cantidad: 2,  precio: 35.00, estado: 'c', etiqueta: 'Cancelado', fecha: '07/05/2026' }
]

const tbody       = document.getElementById('tablaVentas')
const inputBuscar = document.getElementById('inputBuscar')

// ── Total ventas hoy (solo entregadas) ───────────────────
function calcularTotal(lista) {
  const total = lista
    .filter(v => v.estado === 'e')
    .reduce((sum, v) => sum + v.cantidad * v.precio, 0)
  document.getElementById('resVentas').textContent =
    '$' + total.toLocaleString('es-MX', { minimumFractionDigits: 2 })
}

// ── Renderizar tabla ─────────────────────────────────────
function renderizar(lista) {
  tbody.innerHTML = ''
  calcularTotal(lista)

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
    const total = (v.cantidad * v.precio).toFixed(2)
    const fila  = document.createElement('tr')
    fila.innerHTML = `
      <td>#${v.id}</td>
      <td>${v.producto}</td>
      <td>${v.cantidad}</td>
      <td>$${v.precio.toFixed(2)}</td>
      <td>$${total}</td>
      <td><span class="badge ${v.estado}">${v.etiqueta}</span></td>
      <td>${v.fecha}</td>
    `
    tbody.appendChild(fila)
  })
}

// ── Búsqueda ─────────────────────────────────────────────
inputBuscar.addEventListener('input', () => {
  const texto = inputBuscar.value.toLowerCase()
  const lista = ventas.filter(v =>
    v.producto.toLowerCase().includes(texto) ||
    v.id.includes(texto)
  )
  renderizar(lista)
})

// ── Registrar venta — pendiente ──────────────────────────
document.getElementById('btnRegistrar').addEventListener('click', () => {
  // TODO: abrir modal de registro de venta
  console.log('Registrar venta')
})

// ── Carga inicial ─────────────────────────────────────────
renderizar(ventas)