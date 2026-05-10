const elec             = window.electron ?? window.parent?.electron
const btnDescargar     = document.getElementById('btnDescargar')
const btnInstrucciones = document.getElementById('btnInstrucciones')
const modalOverlay     = document.getElementById('modalOverlay')
const modalCerrar      = document.getElementById('modalCerrar')

// ── Descargar base de datos ──────────────────────────────
btnDescargar.addEventListener('click', async () => {
  if (!elec?.descargarDB) {
    alert('Función de descarga no disponible fuera de Electron.')
    return
  }

  // Estado visual: cargando
  btnDescargar.disabled = true
  btnDescargar.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         style="animation:girar 0.8s linear infinite">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    Preparando archivo...
  `

  try {
    const result = await elec.descargarDB()

    if (result?.ok) {
      btnDescargar.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        ¡Descargado correctamente!
      `
      btnDescargar.style.background = '#2E7D32'
    } else {
      restaurarBoton()
    }
  } catch (err) {
    console.error('[Exportar] Error al descargar:', err)
    btnDescargar.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Error al descargar — intenta de nuevo
    `
    btnDescargar.style.background = '#C0392B'
  }

  setTimeout(restaurarBoton, 3000)
})

function restaurarBoton() {
  btnDescargar.disabled = false
  btnDescargar.style.background = ''
  btnDescargar.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    Descargar base de datos
  `
}

// ── Modal instrucciones ──────────────────────────────────
btnInstrucciones.addEventListener('click', () => {
  modalOverlay.classList.add('visible')
})

modalCerrar.addEventListener('click', cerrarModal)

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) cerrarModal()
})

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal()
})

function cerrarModal() {
  modalOverlay.classList.remove('visible')
}