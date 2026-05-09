const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {

  navegar: (ruta) => ipcRenderer.send('navegar', ruta),

  ejecutarPython: (script, args) =>
    ipcRenderer.invoke('ejecutar-python', script, args),

  descargarDB: () => ipcRenderer.invoke('descargar-db'),

  cerrarApp: () => ipcRenderer.send('cerrar-app'),
  minimizar: () => ipcRenderer.send('minimizar'),

  // ── Escuchar cuando sync-finished llega desde main.js ──
  onSyncFinished: (callback) =>
    ipcRenderer.on('sync-finished', () => callback())
})