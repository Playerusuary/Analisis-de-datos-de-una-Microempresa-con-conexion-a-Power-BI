# 🛒 La Lonja del Vecino
### Sistema de Análisis de Datos para Microempresa · Trabajo Terminal

> Un gemelo digital de un negocio de abarrotes: simula ventas, gestiona inventario y genera inteligencia de negocio real.

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Base de Datos](#-base-de-datos)
- [Lógica de Negocio](#-lógica-de-negocio)
- [Módulos del Backend](#-módulos-del-backend)
- [Pantallas del Frontend](#-pantallas-del-frontend)
- [Requisitos de Instalación](#-requisitos-de-instalación)
- [Cómo Ejecutar el Proyecto](#-cómo-ejecutar-el-proyecto)
- [Conexión con Power BI](#-conexión-con-power-bi)

---

## 📌 Descripción del Proyecto

**La Lonja del Vecino** es una aplicación de escritorio que transforma datos estáticos en un ecosistema comercial vivo. Diseñada como herramienta de estudio y análisis, el sistema simula el comportamiento real de una tienda de abarrotes desde agosto de 2024 hasta junio de 2026, generando automáticamente ventas, reabastecimientos y pérdidas por merma.

El objetivo principal es proporcionar un entorno de datos rico y realista para practicar **análisis de datos de nivel profesional**, conectado a Power BI para visualizaciones avanzadas.

### ¿Qué hace diferente a este sistema?

A diferencia de un dataset estático, este sistema:

- **Se actualiza solo** cada vez que abres la aplicación — los datos siempre están al día.
- **Simula comportamiento humano** — horarios de operación, patrones de compra por día de la semana, métodos de pago variables.
- **Replica riesgos reales de negocio** — quiebre de stock, merma por transporte/caducidad, compras por volumen.

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                    Electron (contenedor)             │
│  ┌──────────────┐    IPC Bridge    ┌──────────────┐  │
│  │   Frontend   │ ◄──────────────► │   Backend    │  │
│  │  HTML/CSS/JS │    ipc.js +      │   Python     │  │
│  │  5 páginas   │    preload.js    │  4 módulos   │  │
│  └──────────────┘                  └──────┬───────┘  │
│                                           │          │
│                                    ┌──────▼───────┐  │
│                                    │   SQLite DB  │  │
│                                    │ simulacion.db│  │
│                                    └──────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          │ Exportación .db
                          ▼
                    ┌──────────┐
                    │ Power BI │
                    └──────────┘
```

El frontend se comunica con el backend a través del **IPC de Electron**: el renderer envía comandos al proceso principal, que ejecuta scripts de Python y devuelve JSON con los datos calculados.

---

## 📁 Estructura de Carpetas

```
Analisis-de-datos-de-una-Microempresa-con-conexion-a-Power-BI/
│
├── backend/                    # Lógica de negocio en Python
│   ├── calculos.py             # Queries SQL y funciones de cálculo
│   ├── logistica.py            # Entry point; recibe comandos y retorna JSON
│   ├── ventas.py               # Simulador de ventas diarias (catch-up)
│   └── restock.py              # Simulador de reabastecimiento semanal
│
├── base/                       # Base de datos SQLite
│   ├── simulacion.db           # Base de datos principal (generada)
│   ├── tablas.sql              # DDL: definición de tablas y relaciones
│   └── insercion.sql           # Datos semilla: categorías, proveedores, productos
│
├── conexiones/                 # Puente Electron ↔ Python
│   ├── ipc.js                  # Manejadores IPC (navegación, ejecución Python, descarga DB)
│   └── preload.js              # API segura expuesta al renderer
│
├── contenedor/                 # Configuración de Electron
│   ├── main.js                 # Proceso principal: crea ventana y dispara sincronización
│   └── package.json            # Dependencias y configuración de build
│
└── frontend/                   # Interfaz de usuario
    ├── assets/
    │   └── logo_negocio.png
    ├── Login/
    │   ├── Acceso.html / .css / .js
    ├── vistas/
    │   └── Ventana.html / .css / .js   # Shell principal con navegación
    └── paginas/
        ├── Inicio/             # Dashboard con KPIs del día anterior
        ├── Ventas/             # Tabla de ventas con filtros de fecha
        ├── Inventario/         # Stock actual con semáforo de alertas
        ├── Graficos/           # Gráficos de ganancias, flujo de caja, ranking y mermas
        └── Exportar/           # Descarga de la base de datos para Power BI
```

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología | Uso |
|------|-----------|-----|
| **Contenedor** | [Electron](https://www.electronjs.org/) v29 | Empaqueta la app como ejecutable de escritorio |
| **Frontend** | HTML5 / CSS3 / JavaScript (Vanilla) | Interfaz de usuario |
| **Backend** | Python 3 | Simulación de datos y queries a la base de datos |
| **Base de datos** | SQLite 3 | Almacenamiento local de toda la información |
| **Visualización externa** | Microsoft Power BI | Dashboards avanzados conectados al .db |
| **Build** | electron-builder | Genera instalador `.exe` para Windows |

---

## 🗄️ Base de Datos

El esquema está diseñado para reflejar las operaciones reales de un negocio minorista:

```
categorias ──────────────────┐
                              │
proveedores ─────────────┐   │
                          ▼   ▼
                       productos
                       /        \
                      ▼          ▼
               detalle_ventas  inventario_compras
                      │
                      ▼
                   ventas
                   
almacen_stock (FK → productos)
```

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `categorias` | Clasificación de productos (lácteos, botanas, bebidas, etc.) |
| `proveedores` | Empresas proveedoras del negocio |
| `productos` | Catálogo con precio de costo y precio de venta |
| `ventas` | Registro de cada transacción (fecha, total, método de pago) |
| `detalle_ventas` | Productos individuales por venta (cantidad, precio, subtotal) |
| `inventario_compras` | Historial de reabastecimientos con merma registrada |
| `almacen_stock` | Stock actual disponible por producto |

---

## 📊 Lógica de Negocio

El realismo de la simulación está construido sobre reglas de negocio concretas:

### Cronología
- **Inicio del historial:** 18 de agosto de 2024
- **Proyección futura:** hasta el 30 de junio de 2026
- **Actualización:** automática al abrir la app (catch-up desde la última fecha registrada)

### Ventas
| Concepto | Regla |
|----------|-------|
| **Horario** | 8:00 AM – 10:00 PM |
| **Volumen diario** | 20–45 ventas entre semana · 40–70 en fin de semana |
| **Artículos por ticket** | 1 a 6 productos diferentes |
| **Cantidad por producto** | 1 a 3 unidades |
| **Método de pago** | 75% Efectivo · 25% Tarjeta |

### Inventario y Reabastecimiento
| Concepto | Regla |
|----------|-------|
| **Punto de reorden** | Stock < 15 unidades dispara una compra |
| **Unidad de compra** | Cajas de 24 unidades (como compran los minoristas a mayoristas) |
| **Objetivo de stock** | 72 unidades tras reabastecimiento |
| **Frecuencia** | Revisión semanal automática |
| **Factor de merma** | 30% de probabilidad de recibir 0–3 unidades dañadas por pedido |

### Cálculo de Merma

```
Unidades pedidas = ceil((72 - stock_actual) / 24) × 24
Merma            = randint(0, 3)  [si random() < 0.30, si no = 0]
Unidades reales  = Unidades pedidas - Merma
Gasto registrado = Unidades pedidas × precio_costo  (se paga todo, incluyendo lo dañado)
```

---

## 🐍 Módulos del Backend

### `ventas.py`
Ejecuta el catch-up de ventas: detecta la última fecha registrada y genera transacciones aleatorias para cada día faltante hasta hoy, respetando el horario de la tienda y los patrones de comportamiento del cliente.

### `restock.py`
Ejecuta el catch-up de inventario: recorre semana por semana desde el último reabastecimiento, identifica productos con stock crítico y registra compras con su posible merma. Se proyecta hasta junio de 2026.

### `calculos.py`
Centraliza todas las consultas SQL. Expone funciones para:
- Resumen del dashboard (ventas de ayer, stock bajo, productos más vendidos)
- Datos para gráficos (ganancias, ventas por período, flujo de caja, ranking, mermas)
- Tabla de ventas con filtros de fecha
- Estado del inventario completo

### `logistica.py`
Actúa como router del backend. Recibe un comando y parámetros por `argv`, ejecuta la función correspondiente de `calculos.py` y retorna el resultado como JSON por `stdout`. Es el punto de contacto con el IPC de Electron.

```bash
# Ejemplo de llamada interna (desde ipc.js)
python logistica.py ganancias mensual 2025 5
python logistica.py dashboard_resumen
python logistica.py ventas_tabla mensual 2025 5
```

---

## 🖥️ Pantallas del Frontend

| Pantalla | Descripción |
|----------|-------------|
| **Acceso** | Login de entrada a la aplicación |
| **Inicio** | Dashboard con KPIs del día anterior: ingresos totales, ventas completadas, productos con stock bajo y más vendidos |
| **Ventas** | Tabla filtrable por rango de fechas con detalle de cada transacción (producto, cantidad, precio, método de pago) |
| **Inventario** | Vista completa del almacén con semáforo de alertas: 🔴 crítico (<5) · 🟡 bajo (<10) · 🟢 normal |
| **Gráficos** | Visualizaciones por período (semanal / mensual / anual): ganancias vs costos, flujo de caja, top productos, ranking de rentabilidad y reporte de mermas |
| **Exportar** | Descarga la base de datos `.db` para conectarla directamente a Power BI Desktop |

---

## ⚙️ Requisitos de Instalación

### Requisitos del sistema

- **Sistema operativo:** Windows 10 / 11
- **Node.js:** v18 o superior
- **Python:** 3.9 o superior (disponible en `PATH` como `python`)
- **Power BI Desktop** *(opcional, para visualizaciones avanzadas)*

### Dependencias de Node.js

```bash
cd contenedor
npm install
```

Las dependencias principales son:
- `electron` ^29.0.0
- `electron-builder` ^24.0.0

### Dependencias de Python

El backend utiliza únicamente la librería estándar de Python:
- `sqlite3` (incluida)
- `datetime`, `random`, `math`, `os`, `sys`, `json` (incluidas)

> No se requiere `pip install` de ningún paquete externo.

---

## 🚀 Cómo Ejecutar el Proyecto

### Modo desarrollo

```bash
cd contenedor
npm start
```

Al iniciar, la aplicación:
1. Crea la ventana principal y carga la pantalla de login.
2. Ejecuta `ventas.py` para sincronizar ventas hasta la fecha actual.
3. Ejecuta `restock.py` para sincronizar inventario y mermas.
4. Envía la señal `sync-finished` al frontend cuando ambos procesos terminan.

### Compilar instalador para Windows

```bash
cd contenedor
npm run build
```

Genera un instalador `.exe` en `contenedor/dist/`. El ejecutable incluye todos los archivos del proyecto exceptuando `node_modules`.

---

## 📈 Conexión con Power BI

1. Abre la aplicación y ve a la pantalla **Exportar**.
2. Haz clic en **Descargar base de datos** y guarda el archivo `.db` en tu equipo.
3. Abre **Power BI Desktop** → Obtener datos → **Base de datos SQLite**.
4. Selecciona el archivo descargado.
5. Importa las tablas que necesites y comienza a construir tus reportes.

### Tablas recomendadas para análisis en Power BI

| Objetivo de análisis | Tablas involucradas |
|----------------------|-------------------|
| Rentabilidad por producto | `productos`, `detalle_ventas`, `ventas` |
| Flujo de caja | `ventas`, `inventario_compras` |
| Análisis de mermas | `inventario_compras`, `productos` |
| Comportamiento de ventas | `ventas`, `detalle_ventas`, `productos`, `categorias` |
| Estado del inventario | `almacen_stock`, `productos`, `categorias` |

> **Tip:** Para calcular la ganancia neta por producto en Power BI, usa la fórmula:
> `Ganancia = SUM(detalle_ventas[subtotal]) - SUM(detalle_ventas[cantidad]) * RELATED(productos[precio_costo])`

---

## 👥 Créditos

Desarrollado como Trabajo Terminal — Instituto Politécnico Nacional

---

*"Pasamos de tener una lista de productos a tener un ecosistema comercial que respira, vende y se equivoca."*
