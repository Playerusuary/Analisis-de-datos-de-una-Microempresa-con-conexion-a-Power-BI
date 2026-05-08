import sqlite3
from datetime import datetime, timedelta

DB_PATH = '../base/simulacion.db'

def conectar():
    return sqlite3.connect(DB_PATH)

# ── Rangos de fecha según filtro ─────────────────────────

def rango_semanal(anio, mes, semana):
    """Devuelve (fecha_inicio, fecha_fin) de la semana N del mes dado."""
    primer_dia = datetime(anio, mes, 1)
    inicio = primer_dia + timedelta(weeks=semana - 1)
    fin    = inicio + timedelta(days=6)
    # No pasarse del mes
    ultimo = datetime(anio, mes, _dias_en_mes(anio, mes))
    fin    = min(fin, ultimo)
    return inicio.strftime('%Y-%m-%d'), fin.strftime('%Y-%m-%d')

def rango_mensual(anio, mes):
    """Devuelve (fecha_inicio, fecha_fin) del mes completo."""
    inicio = datetime(anio, mes, 1)
    fin    = datetime(anio, mes, _dias_en_mes(anio, mes))
    return inicio.strftime('%Y-%m-%d'), fin.strftime('%Y-%m-%d')

def rango_anual(anio):
    """Devuelve (fecha_inicio, fecha_fin) del año completo."""
    return f'{anio}-01-01', f'{anio}-12-31'

def _dias_en_mes(anio, mes):
    if mes == 12:
        return 31
    return (datetime(anio, mes + 1, 1) - timedelta(days=1)).day

# ── Queries base ─────────────────────────────────────────

def query_ganancias(inicio, fin, grupo_fmt, label_fmt):
    conn = conectar()
    cur  = conn.cursor()
    cur.execute(f"""
        SELECT
            strftime('{grupo_fmt}', v.fecha_venta) as periodo,
            SUM(dv.subtotal)                        as ingresos,
            SUM(dv.cantidad * p.precio_costo)       as costos
        FROM ventas v
        JOIN detalle_ventas dv ON v.id_venta    = dv.id_venta
        JOIN productos      p  ON dv.id_producto = p.id_producto
        WHERE v.fecha_venta BETWEEN '{inicio}' AND '{fin} 23:59:59'
        GROUP BY periodo
        ORDER BY periodo
    """)
    rows = cur.fetchall()
    conn.close()
    return rows

def query_ventas(inicio, fin, grupo_fmt):
    conn = conectar()
    cur  = conn.cursor()
    cur.execute(f"""
        SELECT strftime('{grupo_fmt}', fecha_venta) as p,
               SUM(total_venta)                     as total,
               COUNT(*)                             as num_ventas
        FROM ventas
        WHERE fecha_venta BETWEEN '{inicio}' AND '{fin} 23:59:59'
        GROUP BY p ORDER BY p
    """)
    rows = cur.fetchall()
    conn.close()
    return rows

def query_ventas_productos(inicio, fin):
    conn = conectar()
    cur  = conn.cursor()
    cur.execute(f"""
        SELECT p.nombre_producto,
               SUM(dv.cantidad)  as unidades,
               SUM(dv.subtotal)  as ingresos
        FROM detalle_ventas dv
        JOIN ventas   v ON dv.id_venta    = v.id_venta
        JOIN productos p ON dv.id_producto = p.id_producto
        WHERE v.fecha_venta BETWEEN '{inicio}' AND '{fin} 23:59:59'
        GROUP BY p.id_producto
        ORDER BY unidades DESC
        LIMIT 10
    """)
    rows = cur.fetchall()
    conn.close()
    return rows

def query_ranking(inicio, fin):
    conn = conectar()
    cur  = conn.cursor()
    cur.execute(f"""
        SELECT p.nombre_producto,
               SUM(dv.subtotal)                         as ingresos,
               SUM(dv.cantidad * p.precio_costo)        as costos,
               SUM(dv.subtotal) - SUM(dv.cantidad * p.precio_costo) as ganancia
        FROM detalle_ventas dv
        JOIN ventas    v ON dv.id_venta    = v.id_venta
        JOIN productos p ON dv.id_producto = p.id_producto
        WHERE v.fecha_venta BETWEEN '{inicio}' AND '{fin} 23:59:59'
        GROUP BY p.id_producto
        ORDER BY ganancia DESC
        LIMIT 5
    """)
    rows = cur.fetchall()
    conn.close()
    return rows

def query_flujo_caja(inicio, fin):
    conn = conectar()
    cur  = conn.cursor()
    cur.execute(f"""
        SELECT strftime('%Y-%m', fecha_venta) as mes,
               SUM(total_venta)               as ventas
        FROM ventas
        WHERE fecha_venta BETWEEN '{inicio}' AND '{fin} 23:59:59'
        GROUP BY mes ORDER BY mes
    """)
    ventas_rows = {r[0]: r[1] for r in cur.fetchall()}

    cur.execute(f"""
        SELECT strftime('%Y-%m', fecha_compra) as mes,
               SUM(costo_total_compra)          as compras
        FROM inventario_compras
        WHERE fecha_compra BETWEEN '{inicio}' AND '{fin} 23:59:59'
        GROUP BY mes ORDER BY mes
    """)
    compras_rows = {r[0]: r[1] for r in cur.fetchall()}
    conn.close()
    return ventas_rows, compras_rows

def query_mermas():
    conn = conectar()
    cur  = conn.cursor()
    cur.execute("""
        SELECT p.nombre_producto,
               a.cantidad_disponible,
               COALESCE(SUM(dv.cantidad), 0) as vendidos_30d
        FROM almacen_stock a
        JOIN productos p ON a.id_producto = p.id_producto
        LEFT JOIN detalle_ventas dv ON dv.id_producto = p.id_producto
        LEFT JOIN ventas v ON dv.id_venta = v.id_venta
            AND v.fecha_venta >= date('now', '-30 days')
        GROUP BY a.id_producto
        ORDER BY vendidos_30d ASC
        LIMIT 10
    """)
    rows = cur.fetchall()
    conn.close()
    return rows