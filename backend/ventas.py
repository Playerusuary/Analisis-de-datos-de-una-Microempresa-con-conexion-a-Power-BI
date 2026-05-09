import sqlite3
import random
import os
from datetime import datetime, timedelta

base_dir = os.path.dirname(os.path.abspath(__file__))

def _resolver_db_v():
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

db_path = _resolver_db_v()

def catch_up_ventas():
    conn   = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Catálogo de productos
    cursor.execute("SELECT id_producto, precio_venta FROM productos")
    productos_dict = {r[0]: r[1] for r in cursor.fetchall()}

    if not productos_dict:
        print("No hay productos en la base de datos.")
        conn.close()
        return

    ids_productos = list(productos_dict.keys())

    # Fecha de inicio
    cursor.execute("SELECT MAX(fecha_venta) FROM ventas WHERE total_venta > 0")
    ultimo = cursor.fetchone()[0]

    if ultimo:
        try:
            fecha_inicio = datetime.strptime(ultimo, '%Y-%m-%d %H:%M:%S') + timedelta(days=1)
        except:
            fecha_inicio = datetime.strptime(ultimo, '%Y-%m-%d') + timedelta(days=1)
        fecha_inicio = fecha_inicio.replace(hour=8, minute=0, second=0)
    else:
        fecha_inicio = datetime(2024, 8, 18, 8, 0, 0)

    fecha_hoy = datetime.now()

    if fecha_inicio.date() > fecha_hoy.date():
        print("La base de datos ya está al día.")
        conn.close()
        return

    print(f"Generando ventas desde {fecha_inicio.date()} hasta {fecha_hoy.date()}...")

    # Limpiar ventas sin detalle que quedaron de ejecuciones anteriores
    cursor.execute("""
        DELETE FROM ventas WHERE id_venta NOT IN (
            SELECT DISTINCT id_venta FROM detalle_ventas
        ) AND total_venta = 0
    """)
    eliminadas = cursor.rowcount
    if eliminadas > 0:
        print(f"Ventas vacías eliminadas: {eliminadas}")

    actual = fecha_inicio

    while actual.date() <= fecha_hoy.date():
        es_finde   = actual.weekday() >= 5
        num_ventas = random.randint(40, 70) if es_finde else random.randint(20, 45)

        for _ in range(num_ventas):
            hora = actual.replace(
                hour=random.randint(8, 21),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            if hora > fecha_hoy:
                break

            metodo = random.choices(
                ['Efectivo', 'Tarjeta'],
                weights=[75, 25]
            )[0]

            cursor.execute(
                "INSERT INTO ventas (fecha_venta, metodo_pago, estado_venta) VALUES (?, ?, 'completada')",
                (hora.strftime('%Y-%m-%d %H:%M:%S'), metodo)
            )
            id_venta = cursor.lastrowid

            num_articulos = random.randint(1, 6)
            total_ticket  = 0
            items = random.sample(ids_productos, min(num_articulos, len(ids_productos)))

            for p_id in items:
                cant     = random.randint(1, 3)
                precio   = productos_dict[p_id]
                subtotal = round(cant * precio, 2)

                cursor.execute("""
                    INSERT INTO detalle_ventas
                        (id_venta, id_producto, cantidad, precio_unitario_venta, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                """, (id_venta, p_id, cant, precio, subtotal))

                # Descontar stock — puede quedar bajo para activar restock
                cursor.execute("""
                    UPDATE almacen_stock
                    SET cantidad_disponible  = MAX(0, cantidad_disponible - ?),
                        ultima_actualizacion = ?
                    WHERE id_producto = ?
                """, (cant, hora.strftime('%Y-%m-%d %H:%M:%S'), p_id))

                total_ticket += subtotal

            cursor.execute(
                "UPDATE ventas SET total_venta = ? WHERE id_venta = ?",
                (round(total_ticket, 2), id_venta)
            )

        actual += timedelta(days=1)

    conn.commit()
    conn.close()
    print("¡Sincronización de ventas terminada!")

if __name__ == '__main__':
    catch_up_ventas()