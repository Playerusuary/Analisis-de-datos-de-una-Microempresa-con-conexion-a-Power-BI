// Datos de ejemplo — después vendrán de SQLite vía conexiones/ipc.js
const datos = {
  ventas:     '$4,820',
  stock:      138,
  stockBajo:  7,
  ordenes:    23,
  inventario: [
    { nombre: 'Leche entera 1L',   qty: 4,  estado: 'low'  },
    { nombre: 'Arroz 1kg',         qty: 52, estado: 'ok'   },
    { nombre: 'Frijol negro 500g', qty: 11, estado: 'warn' },
    { nombre: 'Aceite vegetal 1L', qty: 3,  estado: 'low'  },
    { nombre: 'Azúcar 1kg',        qty: 38, estado: 'ok'   }
  ],
  ordenes_lista: [
    { producto: 'Leche 1L',      qty: 6,  estado: 'e', etiqueta: 'Entregado' },
    { producto: 'Pan blanco',    qty: 12, estado: 'e', etiqueta: 'Entregado' },
    { producto: 'Jabón líquido', qty: 3,  estado: 'p', etiqueta: 'Pendiente' },
    { producto: 'Refresco 2L',   qty: 8,  estado: 'p', etiqueta: 'Pendiente' },
    { producto: 'Aceite 1L',     qty: 2,  estado: 'c', etiqueta: 'Cancelado' }
  ]
}

// KPIs
document.getElementById('kpiVentas').textContent    = datos.ventas
document.getElementById('kpiStock').textContent     = datos.stock
document.getElementById('kpiStockBajo').textContent = datos.stockBajo
document.getElementById('kpiOrdenes').textContent   = datos.ordenes

// Inventario
const listaInventario = document.getElementById('listaInventario')
datos.inventario.forEach(item => {
  const fila = document.createElement('div')
  fila.className = 'stock-row'
  fila.innerHTML = `
    <span>${item.nombre}</span>
    <span class="${item.estado}">${item.qty} pzs${item.estado === 'low' ? ' ▼' : ''}</span>
  `
  listaInventario.appendChild(fila)
})

// Órdenes
const tablaOrdenes = document.getElementById('tablaOrdenes')
datos.ordenes_lista.forEach(orden => {
  const fila = document.createElement('tr')
  fila.innerHTML = `
    <td>${orden.producto}</td>
    <td>${orden.qty}</td>
    <td><span class="badge ${orden.estado}">${orden.etiqueta}</span></td>
  `
  tablaOrdenes.appendChild(fila)
})