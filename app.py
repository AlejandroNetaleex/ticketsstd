from flask import Flask, render_template, request, redirect, jsonify, send_file
from datetime import datetime
import sqlite3
import pandas as pd

app = Flask(__name__)

# Configuración de la base de datos
DB_PATH = "data/tickets.db"

# Inicializar la base de datos
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS tickets (
        folio TEXT PRIMARY KEY,
        timestamp TEXT,
        nombre TEXT NOT NULL,
        telefono TEXT NOT NULL,
        tipo_reparacion TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        modelo TEXT NOT NULL,
        correo TEXT NOT NULL,
        fecha_entrega TEXT,
        costo REAL,
        estatus TEXT NOT NULL
    )''')
    conn.commit()
    conn.close()

# Generar un folio único
def generate_folio():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM tickets")
    count = cursor.fetchone()[0] + 1
    folio = f"STD-A-{count:03}"
    conn.close()
    return folio

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/validate', methods=['POST'])
def validate_login():
    username = request.form.get('username')
    password = request.form.get('password')
    if username == "ale" and password == "12345":
        return redirect('/tickets')  # Cambiado de '/tickets.hmtl' a '/tickets'
    return render_template('login.html', error="Credenciales inválidas")


@app.route('/tickets')
def tickets():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tickets")
    records = cursor.fetchall()
    conn.close()
    return render_template('tickets.html', records=records)

@app.route('/add', methods=['POST'])
def add_ticket():
    data = request.form
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    folio = generate_folio()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''INSERT INTO tickets (folio, timestamp, nombre, telefono, tipo_reparacion, descripcion, modelo, correo, estatus)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', (
        folio, timestamp, data['nombre'], data['telefono'], data['tipo_reparacion'], 
        data['descripcion'], data['modelo'], data['correo'], data['estatus']
    ))
    conn.commit()
    conn.close()
    return redirect('/tickets')

@app.route('/delete/<folio>', methods=['DELETE'])
def delete_ticket(folio):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tickets WHERE folio = ?", (folio,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Registro eliminado correctamente"}), 200

@app.route('/update_status/<folio>', methods=['PATCH'])
def update_status(folio):
    new_status = request.json.get('new_status')
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if new_status.upper() == "ENTREGADO":
        fecha_entrega = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("UPDATE tickets SET estatus = ?, fecha_entrega = ? WHERE folio = ?", 
                       (new_status.upper(), fecha_entrega, folio))
    else:
        cursor.execute("UPDATE tickets SET estatus = ? WHERE folio = ?", (new_status.upper(), folio))
    conn.commit()
    conn.close()
    return jsonify({"message": "Estatus actualizado correctamente."}), 200

@app.route('/add_cost/<folio>', methods=['PATCH'])
def add_cost(folio):
    cost = request.json.get('cost')
    if not cost or not cost.isdigit():
        return jsonify({"message": "Costo inválido"}), 400
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT costo FROM tickets WHERE folio = ?", (folio,))
    current_cost = cursor.fetchone()
    if current_cost and current_cost[0] is not None:
        return jsonify({"message": "El costo ya fue asignado"}), 400
    cursor.execute("UPDATE tickets SET costo = ? WHERE folio = ?", (cost, folio))
    conn.commit()
    conn.close()
    return jsonify({"message": "Costo agregado correctamente."}), 200

@app.route('/export')
def export_to_excel():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM tickets", conn)
    file_path = "data/tickets.xlsx"
    df.to_excel(file_path, index=False)
    conn.close()
    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    init_db()
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