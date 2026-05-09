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

// ── Detectar comando Python correcto (python vs py) ────────
function getPythonCmd() {
  return new Promise((resolve) => {
    const test = spawn('python', ['--version'])
    test.on('error', () => resolve('py'))
    test.on('close', (code) => resolve(code === 0 ? 'python' : 'py'))
  })
}

let pythonCmd = null

ipcMain.handle('ejecutar-python', async (event, script, args = []) => {
  if (!pythonCmd) pythonCmd = await getPythonCmd()

  const scriptPath = path.join(__dirname, '../backend/', script)
  console.log(`[IPC] ${pythonCmd} "${scriptPath}"`, args)

  return new Promise((resolve, reject) => {
    const proceso = spawn(pythonCmd, [scriptPath, ...args.map(String)])

    let salida = ''
    let error  = ''

    const timer = setTimeout(() => {
      proceso.kill()
      reject(new Error(`Timeout 30s: ${script}`))
    }, 30000)

    proceso.stdout.on('data', d => salida += d.toString())
    proceso.stderr.on('data', d => {
      error += d.toString()
      console.error('[Python stderr]', d.toString().trim())
    })

    proceso.on('close', codigo => {
      clearTimeout(timer)
      console.log(`[IPC] ${script} código=${codigo} stdout="${salida.slice(0,150)}"`)
      if (codigo === 0) {
        try   { resolve(JSON.parse(salida)) }
        catch { reject(new Error('JSON inválido: ' + salida.slice(0, 200))) }
      } else {
        reject(new Error(error || `Python código ${codigo}`))
      }
    })

    proceso.on('error', err => {
      clearTimeout(timer)
      console.error('[IPC spawn error]', err.message)
      reject(new Error('No se pudo iniciar Python: ' + err.message))
    })
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