const btnDescargar    = document.getElementById('btnDescargar')
const btnInstrucciones = document.getElementById('btnInstrucciones')
const modalOverlay    = document.getElementById('modalOverlay')
const modalCerrar     = document.getElementById('modalCerrar')

// ── Descargar base de datos ──────────────────────────────
btnDescargar.addEventListener('click', () => {
  // En Electron usa ipcRenderer para copiar el .db al destino elegido
  // Por ahora muestra confirmación en consola
  // TODO: conectar con conexiones/ipc.js → window.electron.descargarDB()
  console.log('Descargando logistica.db...')

  // Cuando esté conectado a Electron:
  // window.electron.descargarDB()
})

// ── Modal instrucciones ──────────────────────────────────
btnInstrucciones.addEventListener('click', () => {
  modalOverlay.classList.add('visible')
})

modalCerrar.addEventListener('click', cerrarModal)

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) cerrarModal()
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarModal()
})

function cerrarModal() {
  modalOverlay.classList.remove('visible')
}