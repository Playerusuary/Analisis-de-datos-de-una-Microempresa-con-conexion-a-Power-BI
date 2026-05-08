-- 1. Categorías
CREATE TABLE categorias (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_categoria TEXT NOT NULL
);

-- 2. Proveedores
CREATE TABLE proveedores (
    id_proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_empresa TEXT NOT NULL
);

-- 3. Productos
CREATE TABLE productos (
    id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_producto TEXT NOT NULL,
    id_categoria INTEGER,
    id_proveedor INTEGER,
    precio_costo REAL NOT NULL,
    precio_venta REAL NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria),
    FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor)
);

-- 4. Ventas
CREATE TABLE ventas (
    id_venta INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_venta REAL DEFAULT 0,
    metodo_pago TEXT
);

-- 5. Detalle de Ventas
CREATE TABLE detalle_ventas (
    id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
    id_venta INTEGER,
    id_producto INTEGER,
    cantidad INTEGER NOT NULL,
    precio_unitario_venta REAL,
    subtotal REAL,
    FOREIGN KEY (id_venta) REFERENCES ventas (id_venta),
    FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
);

-- 6. Compras de Inventario (Restock)
CREATE TABLE inventario_compras (
    id_compra INTEGER PRIMARY KEY AUTOINCREMENT,
    id_producto INTEGER,
    cantidad_cajas INTEGER NOT NULL,
    unidades_totales INTEGER NOT NULL,
    fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    costo_total_compra REAL,
    FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
);

-- 7. Almacén
CREATE TABLE almacen_stock (
    id_producto INTEGER PRIMARY KEY,
    cantidad_disponible INTEGER DEFAULT 0,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
);

INSERT INTO almacen_stock (id_producto, cantidad_disponible)
SELECT id_producto, 100 FROM productos;