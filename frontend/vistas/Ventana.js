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

// Fecha en español
topbarFecha.textContent = new Date().toLocaleDateString('es-MX', {
  weekday: 'long',
  day:     'numeric',
  month:   'long',
  year:    'numeric'
})

// Navegación entre páginas
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const pagina = item.dataset.pagina

    navItems.forEach(n => n.classList.remove('activo'))
    item.classList.add('activo')

    topbarTitulo.textContent = titulos[pagina] || pagina
    marco.src = `../paginas/${pagina}/${pagina}.html`
  })
})