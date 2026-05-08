// Datos de ejemplo — después vendrán de SQLite vía conexiones/ipc.js
const productos = [
  { nombre: 'Leche entera 1L',   categoria: 'Abarrotes', cantidad: 4,  precio: 22.00, estado: 'low'  },
  { nombre: 'Arroz 1kg',         categoria: 'Abarrotes', cantidad: 52, precio: 18.50, estado: 'ok'   },
  { nombre: 'Frijol negro 500g', categoria: 'Abarrotes', cantidad: 11, precio: 15.00, estado: 'warn' },
  { nombre: 'Aceite vegetal 1L', categoria: 'Abarrotes', cantidad: 3,  precio: 35.00, estado: 'low'  },
  { nombre: 'Azúcar 1kg',        categoria: 'Abarrotes', cantidad: 38, precio: 24.00, estado: 'ok'   },
  { nombre: 'Plátano kg',        categoria: 'Frutas',    cantidad: 22, precio: 12.00, estado: 'ok'   },
  { nombre: 'Tomate kg',         categoria: 'Verduras',  cantidad: 9,  precio: 18.00, estado: 'warn' },
  { nombre: 'Cebolla kg',        categoria: 'Verduras',  cantidad: 15, precio: 14.00, estado: 'ok'   }
]

const etiquetas = {
  ok:   { texto: 'Normal',      clase: 'ok'   },
  warn: { texto: 'Stock medio', clase: 'warn' },
  low:  { texto: 'Stock bajo',  clase: 'low'  }
}

const tbody          = document.getElementById('tablaInventario')
const inputBuscar    = document.getElementById('inputBuscar')
const filtroCategoria = document.getElementById('filtroCategoria')
const filtroStock    = document.getElementById('filtroStock')

// ── Resumen ──────────────────────────────────────────────
function actualizarResumen(lista) {
  document.getElementById('resTotal').textContent = lista.reduce((s, p) => s + p.cantidad, 0)
  document.getElementById('resMedio').textContent = lista.filter(p => p.estado === 'warn').length
  document.getElementById('resBajo').textContent  = lista.filter(p => p.estado === 'low').length
}

// ── Renderizar tabla ─────────────────────────────────────
function renderizar(lista) {
  tbody.innerHTML = ''
  actualizarResumen(lista)

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:#C8A88A;padding:24px">
          Sin resultados
        </td>
      </tr>`
    return
  }

  lista.forEach((p, i) => {
    const { texto, clase } = etiquetas[p.estado]
    const fila = document.createElement('tr')
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${p.cantidad}</td>
      <td>$${p.precio.toFixed(2)}</td>
      <td><span class="badge ${clase}">${texto}</span></td>
      <td>
        <button class="btn-editar" data-index="${i}" title="Editar">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/>
          </svg>
        </button>
      </td>
    `
    tbody.appendChild(fila)
  })

  // Botón editar — funcionalidad pendiente
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index
      // TODO: implementar funcionalidad de edición
      console.log('Editar producto:', productos[idx])
    })
  })
}

// ── Filtros ──────────────────────────────────────────────
function filtrar() {
  const texto     = inputBuscar.value.toLowerCase()
  const categoria = filtroCategoria.value
  const stock     = filtroStock.value

  const lista = productos.filter(p => {
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

// ── Agregar producto — pendiente ─────────────────────────
document.getElementById('btnAgregar').addEventListener('click', () => {
  // TODO: abrir modal de agregar producto
  console.log('Agregar producto')
})

// ── Carga inicial ────────────────────────────────────────
renderizar(productos)