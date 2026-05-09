const titulos = {
  Inicio:     'Dashboard general',
  Inventario: 'Inventario',
  Ventas:     'Ventas',
  Graficos:   'Gráficos',
  Exportar:   'Exportar a Power BI'
}

const marco        = document.getElementById('marco')
const topbarTitulo = document.getElementById('topbarTitulo')
const topbarFecha  = document.getElementById('topbarFecha')
const navItems     = document.querySelectorAll('.nav-item')

topbarFecha.textContent = new Date().toLocaleDateString('es-MX', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})

// ── Log visual en topbar para diagnóstico ──────────────────
function logTopbar(msg) {
  console.log(msg)
  topbarFecha.textContent = msg
}

// ── Cache de datos ────────────────────────────────────────
let cacheDatos = null

// ── Llamada a Python ───────────────────────────────────────
async function python(cmd) {
  try {
    const r = await window.electron.ejecutarPython('logistica.py', [cmd])
    return r
  } catch (err) {
    logTopbar('ERR ' + cmd + ': ' + err.message.slice(0, 60))
    return { __error: err.message }
  }
}

// ── Cargar datos y enviar al iframe ───────────────────────
async function cargarDashboard() {
  logTopbar('Cargando datos...')

  const [resumen, stock, productos] = await Promise.all([
    python('dashboard_resumen'),
    python('dashboard_stock'),
    python('dashboard_productos')
  ])

  logTopbar('Datos OK — enviando al iframe')
  cacheDatos = { tipo: 'dashboard_data', resumen, stock, productos }
  enviarAlIframe(cacheDatos)
}

function enviarAlIframe(datos) {
  try {
    marco.contentWindow.postMessage(datos, '*')
    logTopbar(new Date().toLocaleTimeString('es-MX') + ' · datos enviados')
  } catch(e) {
    logTopbar('postMessage ERROR: ' + e.message)
  }
}

// ── El iframe solicita datos ───────────────────────────────
window.addEventListener('message', (e) => {
  if (e.data === 'solicitar_datos') {
    logTopbar('Iframe pidió datos...')
    if (cacheDatos) {
      enviarAlIframe(cacheDatos)
    } else {
      cargarDashboard()
    }
  }
})

// ── Navegación ────────────────────────────────────────────
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const pagina = item.dataset.pagina
    navItems.forEach(n => n.classList.remove('activo'))
    item.classList.add('activo')
    topbarTitulo.textContent = titulos[pagina] || pagina
    marco.src = `../paginas/${pagina}/${pagina}.html`
    if (pagina === 'Inicio') cacheDatos = null
  })
})

// ── Arranque ──────────────────────────────────────────────
logTopbar('Iniciando...')
cargarDashboard()