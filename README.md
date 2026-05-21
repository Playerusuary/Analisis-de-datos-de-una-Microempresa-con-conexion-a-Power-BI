# 📊 Análisis de Datos de una Microempresa con conexión a Power BI

Aplicación de escritorio para la **gestión y análisis de datos operativos** de una microempresa (tienda de abarrotes). Permite visualizar ventas, inventario, ganancias y flujo de caja en tiempo real, con exportación directa de la base de datos para análisis en Power BI.

---

## 🖥️ Vista General

```
┌─────────────────────────────────────────────────┐
│               Electron (Desktop)                │
│  ┌──────────────────────┐  ┌──────────────────┐ │
│  │  Frontend HTML/CSS/JS│  │  Backend Python  │ │
│  │  (Dashboard + Vistas)│◄─►  (SQLite + lógica│ │
│  └──────────────────────┘  └──────────────────┘ │
│                      │                          │
│              ┌───────▼──────┐                   │
│              │  simulacion  │                   │
│              │    .db       │                   │
│              └──────────────┘                   │
└─────────────────────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   Power BI      │
              │  (análisis .db) │
              └─────────────────┘
```

---

## 🚀 Tecnologías

| Capa | Tecnología |
|---|---|
| Escritorio | Electron |
| Frontend | HTML, CSS, JavaScript vanilla |
| Backend / Datos | Python, SQLite3 |
| Comunicación | Electron IPC (ipcMain / ipcRenderer) |
| Simulación | Python (ventas y restock automático) |
| Análisis externo | Power BI Desktop |

---

## 📁 Estructura del Proyecto

```
Analisis-de-datos-de-una-Microempresa-con-conexion-a-Power-BI/
│
├── backend/
│   ├── calculos.py       # Todas las queries SQL (dashboard, gráficos, inventario)
│   ├── logistica.py      # Entry point: router de comandos CLI → JSON
│   ├── ventas.py         # Simulador de ventas (catch-up automático)
│   └── restock.py        # Simulador de reabastecimiento y mermas
│
├── base/
│   └── simulacion.db     # Base de datos SQLite (ventas, inventario, productos)
│
├── conexiones/
│   ├── ipc.js            # Bridge IPC: llama a Python y maneja navegación/descarga
│   └── preload.js        # Expone API segura al renderer (contextBridge)
│
├── frontend/
│   ├── assets/
│   │   └── logo_negocio.png
│   ├── Login/
│   │   ├── Acceso.html   # Pantalla de inicio de sesión
│   │   ├── Acceso.js
│   │   └── Acceso.css
│   ├── vistas/
│   │   ├── Ventana.html  # Contenedor principal (navbar + iframe de páginas)
│   │   ├── Ventana.js    # Orquestador: carga datos Python y los distribuye
│   │   └── Ventana.css
│   └── paginas/
│       ├── Inicio/       # Dashboard con KPIs del día anterior
│       ├── Ventas/       # Tabla de ventas con filtros por período
│       ├── Graficos/     # Gráficas de ganancias, flujo, ranking y mermas
│       ├── Inventario/   # Tabla de stock con alertas visuales
│       └── Exportar/     # Descarga de la BD para Power BI
│
└── package.json
```

---

## ⚙️ Instalación y Ejecución

### Prerrequisitos

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **npm**

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd Analisis-de-datos-de-una-Microempresa-con-conexion-a-Power-BI

# 2. Instalar dependencias de Node
npm install

# 3. Iniciar en modo desarrollo
npm start
```

> Python debe estar disponible en el PATH del sistema, ya que Electron lo invoca directamente como subproceso.

---

## 🔄 Simulación de Datos

El proyecto incluye dos simuladores que **auto-generan datos históricos** al abrirse la app, llenando los días que hayan pasado sin datos desde la última ejecución.

### `ventas.py` — Simulador de ventas

- Detecta el último día con ventas en la BD.
- Genera entre **20–45 ventas** por día hábil y **40–70** en fines de semana.
- Cada venta incluye: productos aleatorios, cantidades, método de pago (75% efectivo / 25% tarjeta).
- Descuenta automáticamente el stock del almacén.

### `restock.py` — Simulador de reabastecimiento

- Se ejecuta cada 7 días simulados.
- Detecta productos con stock < 15 unidades y genera órdenes de compra por cajas.
- Simula **mermas aleatorias** (30% de probabilidad, 0–3 unidades).
- Registra el costo de cada compra en `inventario_compras`.

---

## 📡 Comunicación Electron ↔ Python

La app usa **IPC de Electron** para invocar scripts Python desde el frontend sin necesidad de un servidor HTTP:

```
Frontend (renderer)
    └─ window.electron.ejecutarPython('logistica.py', ['ventas', 'mensual', 2025, 6])
           │
           ▼
       ipc.js (main process)
           └─ spawn('python', ['backend/logistica.py', 'ventas', 'mensual', '2025', '6'])
                   │
                   ▼
               logistica.py imprime JSON → stdout
                   │
                   ▼
           ipcMain parsea JSON y lo resuelve al renderer
```

---

## 📈 Módulos de la Aplicación

### 🏠 Dashboard (Inicio)
KPIs del día anterior: total de ventas, ventas completadas y productos con stock bajo. Se actualiza con un botón manual.

### 💰 Ventas
Tabla filtrable por período (semanal / mensual / anual) y rango de fechas personalizado. Muestra producto, cantidad, precio, total y método de pago.

### 📊 Gráficos
Visualizaciones interactivas por período:
- **Ganancias:** ingresos, costos y ganancia neta.
- **Ventas:** monto total y número de transacciones.
- **Productos más vendidos:** unidades e ingresos por producto.
- **Ranking de rentabilidad:** top 5 productos por ganancia.
- **Flujo de caja:** ventas vs. compras de inventario.
- **Mermas:** unidades perdidas y pérdida económica por producto.

### 📦 Inventario
Tabla completa de stock con alertas de color:
- 🔴 **Crítico** — menos de 5 unidades.
- 🟡 **Bajo** — menos de 10 unidades.
- 🟢 **OK** — stock suficiente.

### 📤 Exportar
Descarga la base de datos `simulacion.db` mediante el diálogo nativo del sistema operativo, lista para conectarse a **Power BI Desktop**.

---

## 🗄️ Esquema de la Base de Datos

| Tabla | Descripción |
|---|---|
| `productos` | Catálogo con nombre, precio de venta y costo |
| `categorias` | Categorías de productos |
| `almacen_stock` | Stock actual por producto |
| `ventas` | Cabecera de cada venta (fecha, método, total) |
| `detalle_ventas` | Líneas de cada venta (producto, cantidad, subtotal) |
| `inventario_compras` | Historial de reabastecimientos y mermas |

---

## 🔌 Conexión con Power BI

1. Abrir la app e ir a **Exportar**.
2. Hacer clic en **Descargar base de datos** y guardar el archivo `.db`.
3. En Power BI Desktop: `Obtener datos → Base de datos SQLite`.
4. Seleccionar el archivo descargado y cargar las tablas deseadas.

---

## 📄 Licencia

Proyecto desarrollado con fines académicos.
