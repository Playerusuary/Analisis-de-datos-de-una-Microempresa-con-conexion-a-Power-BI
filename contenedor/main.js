const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

const { resolverSync } = require('../conexiones/ipc.js')

let ventana

function ejecutarSincronizacion() {
  const { cmd: vCmd, args: vArgs } = resolverSync('ventas')
  const ventas = spawn(vCmd, vArgs)

  ventas.on('close', () => {
    const { cmd: rCmd, args: rArgs } = resolverSync('restock')
    const restock = spawn(rCmd, rArgs)

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