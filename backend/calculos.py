import sqlite3
import os
from datetime import datetime, timedelta

# Ruta absoluta — funciona desde cualquier lugar que lo llame Electron
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def _resolver_db():
    """
    Busca simulacion.db subiendo desde la carpeta del script.
    Jerarquía esperada: <raiz>/backend/calculos.py  →  <raiz>/base/simulacion.db
    También tolera que la DB esté en el mismo directorio (tests / desarrollo).
    """
    candidatos = [
        os.path.join(BASE_DIR, '..', 'base', 'simulacion.db'),   # producción
        os.path.join(BASE_DIR, 'simulacion.db'),                  # fallback mismo dir
        os.path.join(BASE_DIR, '..', 'simulacion.db'),            # fallback raíz
    ]
    for ruta in candidatos:
        ruta = os.path.normpath(ruta)
        if os.path.exists(ruta):
            return ruta
    # Si no se encontró, retornar la ruta esperada en producción (genera error claro)
    return os.path.normpath(candidatos[0])

DB_PATH = _resolver_db()

def conectar():
    return sqlite3.connect(DB_PATH)

def ayer():
    return (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')

def hoy():
    return datetime.now().strftime('%Y-%m-%d')

# ── Dashboard ─────────────────────────────────────────────

def query_resumen_ayer():
    fecha = ayer()
    conn  = conectar()
    cur   = conn.cursor()

    cur.execute("""
        SELECT COALESCE(SUM(total_venta), 0)
        FROM ventas
        WHERE DATE(fecha_venta) = ?
    """, (fecha,))
    total_ventas = round(cur.fetchone()[0], 2)

    cur.execute("""
        SELECT COUNT(*)
        FROM ventas
        WHERE DATE(fecha_venta) = ?
        AND estado_venta = 'completada'
    """, (fecha,))
    ventas_cumplidas = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*)
        FROM almacen_stock
        WHERE cantidad_disponible < 10
    """)
    stock_bajo = cur.fetchone()[0]

    conn.close()
    return {
        'fecha':            fecha,
        'total_ventas':     total_ventas,
        'ventas_cumplidas': ventas_cumplidas,
        'stock_bajo':       stock_bajo
    }

def query_stock_bajo():
    conn = conectar()
    cur  = conn.cursor()
    cur.execute("""
        SELECT
            p.nombre_producto,
            a.cantidad_disponible,
            CASE
                WHEN a.cantidad_disponible < 5  THEN 'critico'
                WHEN a.cantidad_disponible < 10 THEN 'bajo'
                ELSE 'medio'
            END as nivel
        FROM almacen_stock a
        JOIN productos p ON a.id_producto = p.id_producto
        WHERE a.cantidad_disponible < 15
        ORDER BY a.cantidad_disponible ASC
        LIMIT 8
    """)
    rows = cur.fetchall()
    conn.close()
    return [{'nombre': r[0], 'cantidad': r[1], 'nivel': r[2]} for r in rows]

def query_productos_vendidos_ayer():
    fecha = ayer()
    conn  = conectar()
    cur   = conn.cursor()
    cur.execute("""
        SELECT
            p.nombre_producto,
            SUM(dv.cantidad)  as unidades,
            SUM(dv.subtotal)  as subtotal
        FROM detalle_ventas dv
        JOIN ventas    v ON dv.id_venta    = v.id_venta
        JOIN productos p ON dv.id_producto = p.id_producto
        WHERE DATE(v.fecha_venta) = ?
        GROUP BY p.id_producto
        ORDER BY unidades DESC
        LIMIT 10
    """, (fecha,))
    rows = cur.fetchall()
    conn.close()
    return [{'nombre': r[0], 'unidades': r[1],
             'subtotal': round(r[2], 2)} for r in rows]

# ── Rangos de fecha ───────────────────────────────────────

def _dias_en_mes(anio, mes):
    if mes == 12:
        return 31
    return (datetime(anio, mes + 1, 1) - timedelta(days=1)).day

def rango_semanal(anio, mes, semana):
    primer_dia = datetime(anio, mes, 1)
    inicio     = primer_dia + timedelta(weeks=semana - 1)
    fin        = inicio + timedelta(days=6)
    ultimo     = datetime(anio, mes, _dias_en_mes(anio, mes))
    fin        = min(fin, ultimo)
    return inicio.strftime('%Y-%m-%d'), fin.strftime('%Y-%m-%d')

def rango_mensual(anio, mes):
    inicio = datetime(anio, mes, 1)
    fin    = datetime(anio, mes, _dias_en_mes(anio, mes))
    return inicio.strftime('%Y-%m-%d'), fin.strftime('%Y-%m-%d')

def rango_anual(anio):
    return f'{anio}-01-01', f'{anio}-12-31'

# ── Queries gráficos ──────────────────────────────────────

def query_ganancias(inicio, fin, grupo_fmt):
    conn = conectar()
    cur  = conn.cursor()
    cur.execute(f"""
        SELECT
            strftime('{grupo_fmt}', v.fecha_venta) as periodo,
            SUM(dv.subtotal)                        as ingresos,
            SUM(dv.cantidad * p.precio_costo)       as costos
        FROM ventas v
        JOIN detalle_ventas dv ON v.id_venta     = dv.id_venta
        JOIN productos      p  ON dv.id_producto  = p.id_producto
        WHERE v.fecha_venta BETWEEN '{inicio}' AND '{fin} 23:59:59'
        GROUP BY periodo ORDER BY periodo
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
        JOIN ventas    v ON dv.id_venta     = v.id_venta
        JOIN productos p ON dv.id_producto  = p.id_producto
        WHERE v.fecha_venta BETWEEN '{inicio}' AND '{fin} 23:59:59'
        GROUP BY p.id_producto
        ORDER BY unidades DESC LIMIT 10
    """)
    rows = cur.fetchall()
    conn.close()
    return rows

def query_ranking(inicio, fin):
    conn = conectar()
    cur  = conn.cursor()
    cur.execute(f"""
        SELECT p.nombre_producto,
               SUM(dv.subtotal)                                    as ingresos,
               SUM(dv.cantidad * p.precio_costo)                   as costos,
               SUM(dv.subtotal) - SUM(dv.cantidad * p.precio_costo) as ganancia
        FROM detalle_ventas dv
        JOIN ventas    v ON dv.id_venta     = v.id_venta
        JOIN productos p ON dv.id_producto  = p.id_producto
        WHERE v.fecha_venta BETWEEN '{inicio}' AND '{fin} 23:59:59'
        GROUP BY p.id_producto
        ORDER BY ganancia DESC LIMIT 5
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
        ORDER BY vendidos_30d ASC LIMIT 10
    """)
    rows = cur.fetchall()
    conn.close()
    return rows