import pandas as pd
import sqlite3
import random
import os
from datetime import datetime, timedelta

base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, '..', 'base', 'simulacion.db')

def generar_ventas():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Obtener catálogo de productos con precios
    productos = pd.read_sql_query("SELECT id_producto, precio_venta FROM productos", conn)
    productos_dict = dict(zip(productos.id_producto, productos.precio_venta))

    fecha_inicio = datetime(2024, 8, 18)
    fecha_fin = datetime(2026, 4, 30)
    
    print("Simulando ventas y descontando stock...")

    actual = fecha_inicio
    while actual <= fecha_fin:
        # Entre 15 y 40 ventas diarias
        num_ventas_dia = random.randint(15, 40) if actual.weekday() < 5 else random.randint(30, 60)
        
        for _ in range(num_ventas_dia):
            metodo = random.choice(["Efectivo", "Tarjeta"])
            fecha_v = actual.replace(hour=random.randint(8, 20), minute=random.randint(0, 59))
            
            # Crear la venta (header)
            cursor.execute("INSERT INTO ventas (fecha_venta, metodo_pago, total_venta) VALUES (?, ?, 0)", (fecha_v, metodo))
            id_v = cursor.lastrowid
            
            num_articulos = random.randint(1, 5)
            total_acumulado = 0
            
            # Elegir productos aleatorios
            items = random.sample(list(productos_dict.keys()), num_articulos)
            for p_id in items:
                cant = random.randint(1, 3)
                precio = productos_dict[p_id]
                subtotal = cant * precio
                
                # Insertar detalle
                cursor.execute("""
                    INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario_venta, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                """, (id_v, p_id, cant, precio, subtotal))
                
                # RESTAR DEL ALMACÉN
                cursor.execute("""
                    UPDATE almacen_stock 
                    SET cantidad_disponible = cantidad_disponible - ?, ultima_actualizacion = ?
                    WHERE id_producto = ?
                """, (cant, fecha_v, p_id))
                
                total_acumulado += subtotal
            
            # Actualizar el total de la venta
            cursor.execute("UPDATE ventas SET total_venta = ? WHERE id_venta = ?", (total_acumulado, id_v))
            
        actual += timedelta(days=1)
        if actual.day == 1: print(f"Procesando: {actual.strftime('%B %Y')}...")

    conn.commit()
    conn.close()
    print("¡Ventas completadas!")

if __name__ == "__main__":
    generar_ventas()