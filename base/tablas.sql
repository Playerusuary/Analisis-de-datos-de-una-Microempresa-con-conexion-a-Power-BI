-- 0. Configuración
PRAGMA foreign_keys = OFF;

-- 1. Limpiar tablas
DROP TABLE IF EXISTS almacen_stock;
DROP TABLE IF EXISTS inventario_compras;
DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS categorias;

PRAGMA foreign_keys = ON;

-- 2. Categorías
CREATE TABLE categorias (
    id_categoria     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_categoria TEXT NOT NULL
);

-- 3. Proveedores
CREATE TABLE proveedores (
    id_proveedor   INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_empresa TEXT NOT NULL
);

-- 4. Productos
CREATE TABLE productos (
    id_producto     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_producto TEXT NOT NULL,
    id_categoria    INTEGER,
    id_proveedor    INTEGER,
    precio_costo    REAL NOT NULL,
    precio_venta    REAL NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
);

-- 5. Ventas
CREATE TABLE ventas (
    id_venta      INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_venta   DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_venta   REAL DEFAULT 0,
    metodo_pago   TEXT,
    estado_venta  TEXT DEFAULT 'completada'
);

-- 6. Detalle de ventas
CREATE TABLE detalle_ventas (
    id_detalle            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_venta              INTEGER,
    id_producto           INTEGER,
    cantidad              INTEGER NOT NULL,
    precio_unitario_venta REAL,
    subtotal              REAL,
    FOREIGN KEY (id_venta)     REFERENCES ventas(id_venta),
    FOREIGN KEY (id_producto)  REFERENCES productos(id_producto)
);

-- 7. Inventario compras
CREATE TABLE inventario_compras (
    id_compra          INTEGER PRIMARY KEY AUTOINCREMENT,
    id_producto        INTEGER,
    cantidad_cajas     INTEGER NOT NULL,
    unidades_totales   INTEGER NOT NULL,
    unidades_merma     INTEGER DEFAULT 0,
    fecha_compra       DATETIME DEFAULT CURRENT_TIMESTAMP,
    costo_total_compra REAL,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- 8. Almacén
CREATE TABLE almacen_stock (
    id_producto          INTEGER PRIMARY KEY,
    cantidad_disponible  INTEGER DEFAULT 0,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);