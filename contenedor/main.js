const { app, BrowserWindow } = require('electron')
const path = require('path')

// Cargar todos los manejadores IPC
require('../conexiones/ipc.js')

let ventana

function crearVentana() {
  ventana = new BrowserWindow({
    width:  1100,
    height: 680,
    minWidth:  900,
    minHeight: 600,
    resizable: true,
    webPreferences: {
      preload:          path.join(__dirname, '../conexiones/preload.js'),
      contextIsolation: true,
      nodeIntegration:  false
    },
    icon: path.join(__dirname, '../frontend/assets/logo_negocio.png'),
    title: 'La Lonja del Vecino'
  })

  ventana.loadFile(path.join(__dirname, '../frontend/Login/Acceso.html'))

  // Quitar menú nativo de Electron
  ventana.setMenuBarVisibility(false)
}

app.whenReady().then(crearVentana)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})