const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

require('../conexiones/ipc.js')

let ventana

function ejecutarSincronizacion() {
  const vScript = path.join(__dirname, '../datos/ventas.py')
  const rScript = path.join(__dirname, '../datos/restock.py')

  const ventas = spawn('python', [vScript])

  ventas.on('close', () => {
    const restock = spawn('python', [rScript])

    restock.on('close', () => {
      if (ventana) ventana.webContents.send('sync-finished')
    })
  })
}

function crearVentana() {
  ventana = new BrowserWindow({
    width:     1100,
    height:    680,
    minWidth:   900,
    minHeight:  600,
    resizable:  true,
    webPreferences: {
      preload:          path.join(__dirname, '../conexiones/preload.js'),
      contextIsolation: true,
      nodeIntegration:  false
    },
    icon:  path.join(__dirname, '../frontend/assets/logo_negocio.png'),
    title: 'La Lonja del Vecino'
  })

  ventana.loadFile(path.join(__dirname, '../frontend/Login/Acceso.html'))
  ventana.setMenuBarVisibility(false)
}

app.whenReady().then(() => {
  crearVentana()
  ejecutarSincronizacion()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})