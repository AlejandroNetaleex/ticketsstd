from flask import Flask, render_template, request, redirect, jsonify, send_file
from datetime import datetime
import pandas as pd
import os

app = Flask(__name__)

# Configuración del archivo Excel
EXCEL_PATH = "data/tickets.xlsx"

# Inicializar el archivo Excel
def init_excel():
    if not os.path.exists(EXCEL_PATH):
        df = pd.DataFrame(columns=[
            "folio", "timestamp", "nombre", "telefono", "tipo_reparacion",
            "descripcion", "modelo", "correo", "fecha_entrega", "costo", "estatus"
        ])
        df.to_excel(EXCEL_PATH, index=False)

# Generar un folio único
def generate_folio():
    df = pd.read_excel(EXCEL_PATH)
    folio = f"STD-A-{len(df) + 1:03}"  # Incremental según el número de registros
    return folio

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/validate', methods=['POST'])
def validate_login():
    username = request.form.get('username')
    password = request.form.get('password')
    if username == "stdtec-admin" and password == "StD2025!":
        return redirect('/tickets')
    return render_template('login.html', error="Credenciales inválidas")

@app.route('/tickets')
def tickets():
    df = pd.read_excel(EXCEL_PATH)
    records = df.to_dict(orient="records")
    return render_template('tickets.html', records=records)

@app.route('/add', methods=['POST'])
def add_ticket():
    data = request.form
    df = pd.read_excel(EXCEL_PATH)
    folio = generate_folio()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_ticket = {
        "folio": folio,
        "timestamp": timestamp,
        "nombre": data['nombre'],
        "telefono": data['telefono'],
        "tipo_reparacion": data['tipo_reparacion'],
        "descripcion": data['descripcion'],
        "modelo": data['modelo'],
        "correo": data['correo'],
        "fecha_entrega": None,
        "costo": None,
        "estatus": data['estatus']
    }
    df = df.append(new_ticket, ignore_index=True)
    df.to_excel(EXCEL_PATH, index=False)
    return redirect('/tickets')

@app.route('/delete/<folio>', methods=['DELETE'])
def delete_ticket(folio):
    df = pd.read_excel(EXCEL_PATH)
    df = df[df['folio'] != folio]  # Filtrar registros para eliminar el seleccionado
    df.to_excel(EXCEL_PATH, index=False)
    return jsonify({"message": "Registro eliminado correctamente"}), 200

@app.route('/update_status/<folio>', methods=['PATCH'])
def update_status(folio):
    new_status = request.json.get('new_status')
    df = pd.read_excel(EXCEL_PATH)
    if new_status.upper() == "ENTREGADO":
        fecha_entrega = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        df.loc[df['folio'] == folio, ['estatus', 'fecha_entrega']] = [new_status.upper(), fecha_entrega]
    else:
        df.loc[df['folio'] == folio, 'estatus'] = new_status.upper()
    df.to_excel(EXCEL_PATH, index=False)
    return jsonify({"message": "Estatus actualizado correctamente."}), 200

@app.route('/add_cost/<folio>', methods=['PATCH'])
def add_cost(folio):
    cost = request.json.get('cost')
    if not cost or not cost.isdigit():
        return jsonify({"message": "Costo inválido"}), 400
    df = pd.read_excel(EXCEL_PATH)
    if not df[df['folio'] == folio]['costo'].isnull().all():
        return jsonify({"message": "El costo ya fue asignado"}), 400
    df.loc[df['folio'] == folio, 'costo'] = float(cost)
    df.to_excel(EXCEL_PATH, index=False)
    return jsonify({"message": "Costo agregado correctamente."}), 200

@app.route('/export')
def export_to_excel():
    return send_file(EXCEL_PATH, as_attachment=True)

if __name__ == '__main__':
    init_excel()
    app.run(debug=True)



"""

@app.route('/contabilidad')
def contabilidad():
    return render_template('contabilidad.html')

@app.route('/contabilidad/ingresos_automaticos', methods=['GET'])
def ingresos_automaticos():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT strftime('%Y-%m', fecha_entrega) AS mes, SUM(costo) AS ingresos
        FROM tickets
        WHERE estatus = 'ENTREGADO'
        GROUP BY mes
    ''')
    ingresos = cursor.fetchall()
    conn.close()
    return jsonify(ingresos)

@app.route('/contabilidad/registrar', methods=['POST'])
def registrar_ingresos_gastos():
    data = request.json
    fecha = data.get('fecha')
    ingresos = data.get('ingresos', 0)
    gastos = data.get('gastos', 0)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO contabilidad (fecha, ingresos, gastos)
        VALUES (?, ?, ?)
    ''', (fecha, ingresos, gastos))
    conn.commit()
    conn.close()
    return jsonify({"message": "Registro agregado correctamente."})

@app.route('/contabilidad/datos_graficas', methods=['GET'])
def datos_graficas():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT strftime('%Y-%m', fecha_entrega) AS mes, SUM(costo) AS ingresos
        FROM tickets
        WHERE estatus = 'ENTREGADO'
        GROUP BY mes
    ''')
    ingresos_automaticos = cursor.fetchall()
    cursor.execute('''
        SELECT fecha, SUM(ingresos), SUM(gastos)
        FROM contabilidad
        GROUP BY fecha
    ''')
    ingresos_gastos = cursor.fetchall()
    conn.close()
    return jsonify({
        "ingresos_automaticos": ingresos_automaticos,
        "ingresos_gastos": ingresos_gastos
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
    """
