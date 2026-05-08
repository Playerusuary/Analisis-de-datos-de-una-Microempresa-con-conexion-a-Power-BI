-- 1. Tabla de Categorías
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL
);

-- 2. Tabla de Proveedores
CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(100) NOT NULL,
    contacto_ejecutivo VARCHAR(100)
);

-- 3. Tabla de Productos (Corazón del negocio)
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    id_categoria INT REFERENCES categorias(id_categoria),
    id_proveedor INT REFERENCES proveedores(id_proveedor),
    precio_costo DECIMAL(10,2) NOT NULL, -- Lo que le cuesta al dueño
    precio_venta DECIMAL(10,2) NOT NULL, -- Lo que paga el cliente
    stock_actual INT DEFAULT 0,
    punto_reorden INT DEFAULT 5        -- Alerta cuando queda poco
);

-- 4. Tabla de Ventas (Encabezado)
CREATE TABLE ventas (
    id_venta SERIAL PRIMARY KEY,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10,2),
    metodo_pago VARCHAR(20) -- Efectivo, Tarjeta, Transferencia
);

-- 5. Detalle de Ventas (El ticket)
CREATE TABLE detalle_ventas (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INT REFERENCES ventas(id_venta),
    id_producto INT REFERENCES productos(id_producto),
    cantidad INT NOT NULL,
    precio_unitario_momento DECIMAL(10,2) -- Se guarda por si el precio sube después
);