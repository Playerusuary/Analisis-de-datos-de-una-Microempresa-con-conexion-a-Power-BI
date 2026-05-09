const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

require('../conexiones/ipc.js')

let ventana

function ejecutarSincronizacion() {
  console.log('Iniciando sincronización automática...')

  const vScript = path.join(__dirname, '../backend/ventas.py')
  const rScript = path.join(__dirname, '../backend/restock.py')

  const ventas = spawn('python', [vScript])

  ventas.stdout.on('data', d => console.log('[ventas.py]', d.toString()))
  ventas.stderr.on('data', d => console.error('[ventas.py ERROR]', d.toString()))

  ventas.on('close', (code) => {
    console.log(`ventas.py terminó (código ${code})`)

    const restock = spawn('python', [rScript])

    restock.stdout.on('data', d => console.log('[restock.py]', d.toString()))
    restock.stderr.on('data', d => console.error('[restock.py ERROR]', d.toString()))

    restock.on('close', (rCode) => {
      console.log(`restock.py terminó (código ${rCode})`)
      // Avisar al frontend que puede refrescar datos
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
      nodeIntegration:  false,
      webSecurity:      false
    },
    icon:  path.join(__dirname, '../frontend/assets/logo_negocio.png'),
    title: 'La Lonja del Vecino'
  })

  ventana.loadFile(path.join(__dirname, '../frontend/Login/Acceso.html'))
  ventana.setMenuBarVisibility(false)
  ventana.webContents.openDevTools({ mode: 'detach' }) // ← diagnóstico temporal
}

app.whenReady().then(() => {
  crearVentana()
  ejecutarSincronizacion()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})