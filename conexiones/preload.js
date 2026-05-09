const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {

  // ── Navegación entre páginas ──────────────────────────
  navegar: (ruta) => ipcRenderer.send('navegar', ruta),

  // ── Llamada a Python ──────────────────────────────────
  ejecutarPython: (script, args) =>
    ipcRenderer.invoke('ejecutar-python', script, args),

  // ── Descargar base de datos ───────────────────────────
  descargarDB: () => ipcRenderer.invoke('descargar-db'),

  // ── Controles de ventana ──────────────────────────────
  cerrarApp:  () => ipcRenderer.send('cerrar-app'),
  minimizar:  () => ipcRenderer.send('minimizar')
})