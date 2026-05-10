const { ipcMain, BrowserWindow, dialog, app } = require('electron')
const path  = require('path')
const fs    = require('fs')
const { spawn } = require('child_process')

// ── Helpers ───────────────────────────────────────────────

function resolverBackend() {
  if (app.isPackaged) {
    const exePath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'logistica.exe')
    return { cmd: exePath, args: [] }
  } else {
    return {
      cmd:  'python',
      args: [path.join(__dirname, '../backend/logistica.py')]
    }
  }
}

function resolverSync(script) {
  if (app.isPackaged) {
    const exePath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', `${script}.exe`)
    return { cmd: exePath, args: [] }
  } else {
    return {
      cmd:  'python',
      args: [path.join(__dirname, `../backend/${script}.py`)]
    }
  }
}

// ── Navegación y ventana ──────────────────────────────────

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

// ── Ejecutar Python / logistica ───────────────────────────

ipcMain.handle('ejecutar-python', async (event, script, args = []) => {
  return new Promise((resolve, reject) => {
    const { cmd, args: baseArgs } = resolverBackend()
    const proceso = spawn(cmd, [...baseArgs, script, ...args.map(String)])

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
      reject(new Error(`No se pudo iniciar el backend: ${err.message}`))
    )
  })
})

// ── Sincronización (ventas + restock) ─────────────────────

ipcMain.handle('ejecutar-sync', async (event, script) => {
  return new Promise((resolve, reject) => {
    const { cmd, args } = resolverSync(script)
    const proceso = spawn(cmd, args)

    let salida = ''
    let error  = ''

    proceso.stdout.on('data', d => salida += d.toString())
    proceso.stderr.on('data', d => error  += d.toString())

    proceso.on('close', codigo => {
      if (codigo === 0) resolve({ ok: true, msg: salida.trim() })
      else reject(new Error(error || `Sync salió con código ${codigo}`))
    })

    proceso.on('error', err =>
      reject(new Error(`No se pudo iniciar sync: ${err.message}`))
    )
  })
})

// ── Descargar base de datos ───────────────────────────────

ipcMain.handle('descargar-db', async () => {
  const win = BrowserWindow.getFocusedWindow()
  const { filePath } = await dialog.showSaveDialog(win, {
    title:       'Guardar base de datos',
    defaultPath: 'la-lonja-del-vecino.db',
    filters:     [{ name: 'SQLite Database', extensions: ['db'] }]
  })

  if (!filePath) return { ok: false, msg: 'Cancelado' }

  const dbOrigen = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'base', 'simulacion.db')
    : path.join(__dirname, '../base/simulacion.db')

  try {
    fs.copyFileSync(dbOrigen, filePath)
    return { ok: true, msg: `Guardado en: ${filePath}` }
  } catch (err) {
    return { ok: false, msg: err.message }
  }
})

module.exports = { resolverSync }