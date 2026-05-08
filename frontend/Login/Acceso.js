const CLAVE_CORRECTA = 'admin123'
const MAX_INTENTOS   = 5
let intentos = 0

const inputClave  = document.getElementById('inputClave')
const campoClave  = document.getElementById('campoClave')
const msgError    = document.getElementById('msgError')
const btnIngresar = document.getElementById('btnIngresar')

inputClave.addEventListener('focus', () => campoClave.classList.add('activo'))
inputClave.addEventListener('blur',  () => campoClave.classList.remove('activo'))
inputClave.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') validarAcceso()
})
btnIngresar.addEventListener('click', validarAcceso)

function validarAcceso() {
  const clave = inputClave.value.trim()

  if (!clave) {
    mostrarError('Ingresa tu contraseña.')
    return
  }

  if (clave === CLAVE_CORRECTA) {
    window.location.href = '../../vistas/Ventana.html'
  } else {
    intentos++
    const restantes = MAX_INTENTOS - intentos

    if (intentos >= MAX_INTENTOS) {
      mostrarError('Demasiados intentos. Cerrando sistema...')
      setTimeout(() => window.electron.cerrarApp(), 2000)
      return
    }

    mostrarError(`Contraseña incorrecta · ${restantes} intento(s) restante(s)`)
    inputClave.value = ''
    inputClave.focus()
  }
}

function mostrarError(msg) {
  msgError.textContent = msg
}