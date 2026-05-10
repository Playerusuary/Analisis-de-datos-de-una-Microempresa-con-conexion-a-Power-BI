import sys
import json
from datetime import datetime
from calculos import (
    rango_semanal, rango_mensual, rango_anual,
    query_resumen_ayer, query_stock_bajo, query_productos_vendidos_ayer,
    query_ganancias, query_ventas, query_ventas_productos,
    query_ranking, query_flujo_caja, query_mermas,
    query_inventario,
    query_ventas_tabla, query_ventas_hoy_total
)

MESES = ['Ene','Feb','Mar','Abr','May','Jun',
         'Jul','Ago','Sep','Oct','Nov','Dic']
DIAS  = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

def r2(v): return round(v or 0, 2)

def fmt_label(valor, periodo):
    try:
        if periodo == 'semanal':
            d = datetime.strptime(valor, '%Y-%m-%d')
            return DIAS[d.weekday()]
        elif periodo == 'mensual':
            d = datetime.strptime(valor, '%Y-%m-%d')
            return d.strftime('%d/%m')
        elif periodo == 'anual':
            d = datetime.strptime(valor, '%Y-%m')
            return MESES[d.month - 1]
    except:
        return valor

def _rango(periodo, anio, mes, semana):
    if periodo == 'semanal':
        return rango_semanal(anio, mes, semana)
    elif periodo == 'mensual':
        return rango_mensual(anio, mes)
    else:
        return rango_anual(anio)

# ── Dashboard ─────────────────────────────────────────────

def dashboard_resumen():
    return query_resumen_ayer()

def dashboard_stock_bajo():
    return query_stock_bajo()

def dashboard_productos_ayer():
    return query_productos_vendidos_ayer()

# ── Gráficos ──────────────────────────────────────────────

def ganancias(periodo, anio, mes, semana):
    inicio, fin = _rango(periodo, anio, mes, semana)
    fmt  = '%Y-%m-%d' if periodo in ('semanal','mensual') else '%Y-%m'
    rows = query_ganancias(inicio, fin, fmt)
    labels, ingresos, costos, ganancias_netas = [], [], [], []
    for row in rows:
        labels.append(fmt_label(row[0], periodo))
        ing = r2(row[1]); cos = r2(row[2])
        ingresos.append(ing); costos.append(cos)
        ganancias_netas.append(r2(ing - cos))
    return {'labels': labels, 'ingresos': ingresos,
            'costos': costos, 'ganancias': ganancias_netas}

def ventas(periodo, anio, mes, semana):
    inicio, fin = _rango(periodo, anio, mes, semana)
    fmt  = '%Y-%m-%d' if periodo in ('semanal','mensual') else '%Y-%m'
    rows = query_ventas(inicio, fin, fmt)
    labels, totales, num_ventas = [], [], []
    for row in rows:
        labels.append(fmt_label(row[0], periodo))
        totales.append(r2(row[1])); num_ventas.append(row[2])
    return {'labels': labels, 'totales': totales, 'num_ventas': num_ventas}

def ventas_productos(periodo, anio, mes, semana):
    inicio, fin = _rango(periodo, anio, mes, semana)
    rows = query_ventas_productos(inicio, fin)
    return {'labels':   [r[0] for r in rows],
            'unidades': [r[1] for r in rows],
            'ingresos': [r2(r[2]) for r in rows]}

def ranking(periodo, anio, mes, semana):
    inicio, fin = _rango(periodo, anio, mes, semana)
    rows = query_ranking(inicio, fin)
    return {'labels':    [r[0] for r in rows],
            'ingresos':  [r2(r[1]) for r in rows],
            'costos':    [r2(r[2]) for r in rows],
            'ganancias': [r2(r[3]) for r in rows]}

def flujo_caja(periodo, anio, mes, semana):
    inicio, fin   = _rango(periodo, anio, mes, semana)
    ventas_d, compras_d = query_flujo_caja(inicio, fin)
    meses = sorted(set(list(ventas_d.keys()) + list(compras_d.keys())))
    labels, ventas_l, compras_l = [], [], []
    for m in meses:
        try:
            d = datetime.strptime(m, '%Y-%m')
            labels.append(MESES[d.month - 1])
        except:
            labels.append(m)
        ventas_l.append(r2(ventas_d.get(m, 0)))
        compras_l.append(r2(compras_d.get(m, 0)))
    return {'labels': labels, 'ventas': ventas_l, 'compras': compras_l}

def mermas():
    rows = query_mermas()
    return {'labels':   [r[0] for r in rows],
            'stock':    [r[1] for r in rows],
            'vendidos': [r[2] for r in rows]}

def inventario():
    return query_inventario()

def ventas_tabla(periodo, anio, mes, semana, fecha_inicio=None, fecha_fin=None):
    if fecha_inicio and fecha_fin:
        inicio, fin = fecha_inicio, fecha_fin
    else:
        inicio, fin = _rango(periodo, anio, mes, semana)
    return query_ventas_tabla(inicio, fin)

def ventas_hoy():
    return {'total': query_ventas_hoy_total()}

# ── Entry point ───────────────────────────────────────────

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Sin argumentos'}))
        sys.exit(1)

    cmd     = sys.argv[1]
    periodo = sys.argv[2] if len(sys.argv) > 2 else 'mensual'
    anio    = int(sys.argv[3]) if len(sys.argv) > 3 else datetime.now().year
    mes     = int(sys.argv[4]) if len(sys.argv) > 4 else datetime.now().month
    semana  = int(sys.argv[5]) if len(sys.argv) > 5 else 1

    funciones = {
        # Dashboard
        'dashboard_resumen':   lambda: dashboard_resumen(),
        'dashboard_stock':     lambda: dashboard_stock_bajo(),
        'dashboard_productos': lambda: dashboard_productos_ayer(),
        # Gráficos
        'ganancias':           lambda: ganancias(periodo, anio, mes, semana),
        'ventas':              lambda: ventas(periodo, anio, mes, semana),
        'ventas_productos':    lambda: ventas_productos(periodo, anio, mes, semana),
        'ranking':             lambda: ranking(periodo, anio, mes, semana),
        'flujo_caja':          lambda: flujo_caja(periodo, anio, mes, semana),
        'mermas':              lambda: mermas(),
        'inventario':          lambda: inventario(),
        'ventas_tabla':        lambda: ventas_tabla(
                                   periodo, anio, mes, semana,
                                   sys.argv[6] if len(sys.argv) > 6 else None,
                                   sys.argv[7] if len(sys.argv) > 7 else None
                               ),
        'ventas_hoy':          lambda: ventas_hoy()
    }

    if cmd in funciones:
        print(json.dumps(funciones[cmd]()))
    else:
        print(json.dumps({'error': f'Comando desconocido: {cmd}'}))