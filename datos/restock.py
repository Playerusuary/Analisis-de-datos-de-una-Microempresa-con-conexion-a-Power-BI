import sqlite3
import os
import math

base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, '..', 'base', 'simulacion.db')

def ejecutar_restock():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Obtener productos que necesitan stock (< 15 unidades)
    # Unimos con 'productos' para saber el precio de costo
    cursor.execute("""
        SELECT a.id_producto, a.cantidad_disponible, p.precio_costo 
        FROM almacen_stock a
        JOIN productos p ON a.id_producto = p.id_producto
        WHERE a.cantidad_disponible < 15
    """)
    necesitados = cursor.fetchall()

    print(f"Iniciando proceso de reabastecimiento para {len(necesitados)} productos...")

    for p_id, actual, costo_u in necesitados:
        # Lógica de cajas: Queremos subir el stock a un nivel saludable (ej. 50 unidades)
        unidades_a_recuperar = 60 - actual
        cajas_a_pedir = math.ceil(unidades_a_recuperar / 24)
        total_unidades = cajas_a_pedir * 24
        gasto = total_unidades * costo_u
        
        # 1. Registrar la compra
        cursor.execute("""
            INSERT INTO inventario_compras (id_producto, cantidad_cajas, unidades_totales, costo_total_compra)
            VALUES (?, ?, ?, ?)
        """, (p_id, cajas_a_pedir, total_unidades, gasto))
        
        # 2. Sumar al almacén
        cursor.execute("""
            UPDATE almacen_stock 
            SET cantidad_disponible = cantidad_disponible + ?, ultima_actualizacion = CURRENT_TIMESTAMP
            WHERE id_producto = ?
        """, (total_unidades, p_id))

    conn.commit()
    conn.close()
    print("¡Almacén reabastecido con éxito!")

if __name__ == "__main__":
    ejecutar_restock()