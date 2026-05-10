const { ipcMain, BrowserWindow, dialog } = require('electron')
const path  = require('path')
const fs    = require('fs')
const { spawn } = require('child_process')

ipcMain.on('navegar', (event, ruta) => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) win.loadFile(path.join(__dirname, '..', ruta))
})

ipcMain.on('cerrar-app', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) win.close()
})

ipcMain.on('minimizar', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) win.minimize()
})

ipcMain.handle('ejecutar-python', async (event, script, args = []) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../backend/', script)
    const proceso    = spawn('python', [scriptPath, ...args.map(String)])

    let salida = ''
    let error  = ''

    proceso.stdout.on('data', d => salida += d.toString())
    proceso.stderr.on('data', d => error  += d.toString())

    proceso.on('close', codigo => {
      if (codigo === 0) {
        try   { resolve(JSON.parse(salida)) }
        catch { reject(new Error(`JSON inválido: ${salida}`)) }
      } else {
        reject(new Error(error || `Python salió con código ${codigo}`))
      }
    })

    proceso.on('error', err =>
      reject(new Error(`No se pudo iniciar Python: ${err.message}`))
    )
  })
})

ipcMain.handle('descargar-db', async () => {
  const win = BrowserWindow.getFocusedWindow()
  const { filePath } = await dialog.showSaveDialog(win, {
    title:       'Guardar base de datos',
    defaultPath: 'logistica.db',
    filters:     [{ name: 'SQLite Database', extensions: ['db'] }]
  })

  if (!filePath) return { ok: false, msg: 'Cancelado' }

  try {
    fs.copyFileSync(path.join(__dirname, '../base/simulacion.db'), filePath)
    return { ok: true, msg: `Guardado en: ${filePath}` }
  } catch (err) {
    return { ok: false, msg: err.message }
  }
})

module.exports = {}