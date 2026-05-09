-- Insertar Categorías
INSERT INTO categorias (id_categoria, nombre_categoria) VALUES
(1, 'Abarrotes'), (2, 'Panadería'), (3, 'Lácteos'), (4, 'Huevos'),
(5, 'Carnes frías'), (6, 'Bebidas'), (7, 'Botanas'), (8, 'Higiene'), (9, 'Limpieza');

-- Insertar Proveedores
INSERT INTO proveedores (id_proveedor, nombre_empresa) VALUES
(1, 'Grupo Herdez'), (2, 'Verde Valle'), (3, 'Zucarmex'), (4, 'Sales del Istmo'),
(5, 'Grupo La Moderna'), (6, 'Munsa'), (7, 'Gruma'), (8, 'Nestlé'),
(9, 'PepsiCo'), (10, 'Grupo Pinsa'), (11, 'La Costeña'), (12, 'Grupo Bimbo'),
(13, 'Grupo Lala'), (14, 'Alpura'), (15, 'Sigma Alimentos'), (16, 'Unilever'),
(17, 'Proan'), (18, 'Bachoco'), (19, 'Coca-Cola Femsa'), (20, 'GEPP'),
(21, 'Grupo Jumex'), (22, 'Kimberly-Clark'), (23, 'Colgate-Palmolive'),
(24, 'Procter & Gamble'), (25, 'Essity'), (26, 'F. Jabón La Corona'),
(27, 'Grupo Alen'), (28, '3M');

-- Insertar los 50 Productos
INSERT INTO productos (id_producto, nombre_producto, id_categoria, id_proveedor, precio_costo, precio_venta) VALUES
(1,  'Aceite Nutrioli 946 ml',             1,  1,  42.00,  55.00),
(2,  'Arroz Extra Verde Valle 1 kg',        1,  2,  30.00,  39.00),
(3,  'Frijol Pinto Verde Valle 1 kg',       1,  2,  35.00,  46.00),
(4,  'Azúcar Estándar Zulka 1 kg',         1,  3,  28.00,  35.00),
(5,  'Sal Yodada La Fina 1 kg',            1,  4,  15.00,  20.00),
(6,  'Sopa de Fideo La Moderna 200 g',     1,  5,   7.50,  10.00),
(7,  'Harina de Trigo Selecta 1 kg',       1,  6,  18.00,  24.00),
(8,  'Harina de Maíz Maseca 1 kg',        1,  7,  19.00,  25.00),
(9,  'Café Nescafé Clásico 225 g',        1,  8,  95.00, 120.00),
(10, 'Galletas Marías Gamesa 170 g',       1,  9,  14.50,  19.00),
(11, 'Atún Dolores en Agua 140 g',         1, 10,  18.00,  23.50),
(12, 'Chiles Jalapeños La Costeña 340 g', 1, 11,  16.00,  22.00),
(13, 'Puré de Tomate Del Fuerte 210 g',   1,  1,   8.00,  11.50),
(14, 'Mayonesa McCormick Limón 390 g',    1,  1,  38.00,  48.00),
(15, 'Pan Blanco Bimbo Grande 680 g',      2, 12,  38.00,  47.00),
(16, 'Tortillas Harina Tía Rosa 10 pz',   2, 12,  22.00,  28.00),
(17, 'Mantecadas Tía Rosa 4 pz',           2, 12,  18.00,  24.00),
(18, 'Leche Entera Lala 1 L',             3, 13,  22.50,  28.00),
(19, 'Leche Clásica Alpura 1 L',          3, 14,  22.50,  28.00),
(20, 'Yoghurt Natural Yoplait 1 kg',       3, 15,  40.00,  52.00),
(21, 'Queso Panela Fud 400 g',             3, 15,  55.00,  72.00),
(22, 'Mantequilla Iberia 90 g',            3, 16,  18.00,  24.00),
(23, 'Huevo Blanco San Juan 18 pz',        4, 17,  45.00,  58.00),
(24, 'Huevo Blanco Bachoco 12 pz',         4, 18,  32.00,  42.00),
(25, 'Jamón Virginia Pavo Fud 250 g',      5, 15,  35.00,  46.00),
(26, 'Salchicha Pavo San Rafael 500 g',    5, 15,  50.00,  65.00),
(27, 'Refresco Coca-Cola 600 ml',          6, 19,  14.50,  19.00),
(28, 'Refresco Coca-Cola Retornable 2.5 L',6, 19,  28.00,  35.00),
(29, 'Refresco Pepsi 600 ml',              6, 20,  12.00,  17.00),
(30, 'Agua Purificada Ciel 1 L',           6, 19,   9.00,  13.00),
(31, 'Agua Purificada Epura 5 L',          6, 20,  25.00,  34.00),
(32, 'Jugo Jumex Durazno 1 L',             6, 21,  22.00,  29.00),
(33, 'Gatorade Naranja 500 ml',            6, 20,  18.00,  24.00),
(34, 'Sabritas Sal 42 g',                  7,  9,  14.00,  18.00),
(35, 'Doritos Nacho 58 g',                 7,  9,  15.00,  19.00),
(36, 'Cheetos Torciditos 52 g',            7,  9,  12.50,  16.00),
(37, 'Papel Pétalo Rendimax 4 R',          8, 22,  26.00,  35.00),
(38, 'Jabón Zest Aqua 150 g',              8, 16,  14.00,  19.00),
(39, 'Pasta Colgate Triple Acción 100 ml', 8, 23,  28.00,  38.00),
(40, 'Shampoo H&S Limpieza 375 ml',        8, 24,  55.00,  75.00),
(41, 'Desodorante Rexona Aerosol 150 ml',  8, 16,  45.00,  62.00),
(42, 'Toallas Saba Invisible 10 pz',       8, 25,  25.00,  34.00),
(43, 'Detergente Roma 1 kg',               9, 26,  32.00,  42.00),
(44, 'Detergente Foca 1 kg',               9, 26,  35.00,  46.00),
(45, 'Jabón Zote Rosa 400 g',              9, 26,  18.00,  24.00),
(46, 'Cloralex El Rendidor 1 L',           9, 27,  16.00,  22.00),
(47, 'Fabuloso Lavanda 1 L',               9, 23,  22.00,  30.00),
(48, 'Suavitel Primavera 850 ml',          9, 23,  24.00,  32.00),
(49, 'Pinol Original 1 L',                 9, 27,  26.00,  35.00),
(50, 'Fibra Scotch-Brite',                 9, 28,  14.00,  20.00);

-- Semilla inicial de stock BAJA para activar ciclo restock
INSERT INTO almacen_stock (id_producto, cantidad_disponible, ultima_actualizacion)
SELECT id_producto, 20, CURRENT_TIMESTAMP FROM productos;