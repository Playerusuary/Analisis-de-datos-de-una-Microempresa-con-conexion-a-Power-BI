import sqlite3
import os
import math
import random
from datetime import datetime, timedelta

base_dir = os.path.dirname(os.path.abspath(__file__))

def _resolver_db_r():
    candidatos = [
        os.path.join(base_dir, '..', 'base', 'simulacion.db'),
        os.path.join(base_dir, 'simulacion.db'),
        os.path.join(base_dir, '..', 'simulacion.db'),
    ]
    for ruta in candidatos:
        ruta = os.path.normpath(ruta)
        if os.path.exists(ruta):
            return ruta
    return os.path.normpath(candidatos[0])

db_path = _resolver_db_r()

def catch_up_restock():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT MAX(fecha_compra) FROM inventario_compras")
    ultimo_restock = cursor.fetchone()[0]

    if ultimo_restock:
        try:
            fecha_inicio = datetime.strptime(ultimo_restock, '%Y-%m-%d %H:%M:%S') + timedelta(days=7)
        except:
            fecha_inicio = datetime.strptime(ultimo_restock, '%Y-%m-%d') + timedelta(days=7)
    else:
        cursor.execute("SELECT MIN(fecha_venta) FROM ventas")
        res = cursor.fetchone()[0]
        fecha_inicio = datetime.strptime(res, '%Y-%m-%d %H:%M:%S') if res else datetime.now()

    # Sincronizar con el límite de ventas
    fecha_limite_simulacion = datetime(2026, 6, 30, 23, 59, 59)
    fecha_objetivo = max(datetime.now(), fecha_limite_simulacion)

    print(f"Sincronizando almacén y mermas hasta {fecha_objetivo.date()}...")

    actual = fecha_inicio
    while actual <= fecha_objetivo:
        cursor.execute("""
            SELECT a.id_producto, a.cantidad_disponible, p.precio_costo 
            FROM almacen_stock a
            JOIN productos p ON a.id_producto = p.id_producto
            WHERE a.cantidad_disponible < 15
        """)
        criticos = cursor.fetchall()

        for p_id, stock, costo_u in criticos:
            objetivo = 72 
            cajas_pedir = math.ceil((objetivo - stock) / 24)
            unidades_pedidas = cajas_pedir * 24
            
            # Merma: 30% de probabilidad, de 0 a 3 unidades
            merma = random.randint(0, 3) if random.random() < 0.30 else 0
            unidades_reales = unidades_pedidas - merma
            gasto = unidades_pedidas * costo_u 
            
            fecha_c = actual.strftime('%Y-%m-%d %H:%M:%S')
            
            cursor.execute("""
                INSERT INTO inventario_compras 
                (id_producto, cantidad_cajas, unidades_totales, unidades_merma, fecha_compra, costo_total_compra)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (p_id, cajas_pedir, unidades_pedidas, merma, fecha_c, gasto))
            
            cursor.execute("UPDATE almacen_stock SET cantidad_disponible = cantidad_disponible + ? WHERE id_producto = ?", (unidades_reales, p_id))

        actual += timedelta(days=7)

    conn.commit()
    conn.close()
    print("¡Sincronización de logística terminada!")

if __name__ == "__main__":
    catch_up_restock()