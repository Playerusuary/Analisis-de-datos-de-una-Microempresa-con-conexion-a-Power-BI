-- 1. Eliminar tablas de transacciones y detalles (las que tienen más dependencias)
DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS inventario_compras;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS almacen_stock;

-- 2. Eliminar tabla de productos (depende de categorías y proveedores)
DROP TABLE IF EXISTS productos;

-- 3. Eliminar tablas maestras (las que no dependen de nadie)
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS proveedores;

