from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
import os

app = Flask(__name__)

DATA_FILE = "data.csv"

# Crear el archivo inicial si no existe
if not os.path.exists(DATA_FILE):
    pd.DataFrame(columns=["Código de Barra", "Ubicación"]).to_csv(DATA_FILE, index=False)

# Pantalla principal para registrar códigos
@app.route("/")
def index():
    return render_template("index.html")

# Pantalla de consulta para buscar, editar y eliminar registros
@app.route("/consulta")
def consulta():
    return render_template("consulta.html")

# Registrar un nuevo código
@app.route("/add", methods=["POST"])
def add_entry():
    data = request.json
    code = data.get("code")
    location = data.get("location")
    
    if code and location:
        df = pd.read_csv(DATA_FILE)  # Cargar el archivo CSV existente
        # Verificar si el código ya existe
        if code in df["Código de Barra"].values:
            return jsonify({"success": False, "message": "El código ya existe"}), 400
        
        # Crear un nuevo DataFrame con la nueva fila
        new_row = pd.DataFrame({"Código de Barra": [code], "Ubicación": [location]})
        # Concatenar el nuevo DataFrame con el existente
        df = pd.concat([df, new_row], ignore_index=True)
        # Guardar el DataFrame actualizado
        df.to_csv(DATA_FILE, index=False)
        return jsonify({"success": True})
    
    return jsonify({"success": False, "message": "Datos inválidos"}), 400

# Obtener todos los datos para mostrar en la tabla
@app.route("/data")
def get_data():
    df = pd.read_csv(DATA_FILE)
    return df.to_json(orient="records")

# Editar la ubicación de un código
@app.route("/edit", methods=["POST"])
def edit_entry():
    data = request.json
    code = str(data.get("code"))  # Asegurarse de que sea cadena
    location = data.get("location")
    
    if code and location:
        df = pd.read_csv(DATA_FILE)
        # Verificar si el código existe
        if code in df["Código de Barra"].astype(str).values:  # Convertir a cadena para evitar errores
            df.loc[df["Código de Barra"].astype(str) == code, "Ubicación"] = location
            df.to_csv(DATA_FILE, index=False)
            return jsonify({"success": True})
        return jsonify({"success": False, "message": "Código no encontrado"}), 404
    return jsonify({"success": False, "message": "Datos inválidos"}), 400


@app.route("/delete", methods=["POST"])
def delete_entry():
    data = request.json
    code = str(data.get("code"))  # Asegurarse de que sea cadena
    if code:
        df = pd.read_csv(DATA_FILE)
        # Verificar si el código existe
        if code in df["Código de Barra"].astype(str).values:  # Convertir a cadena para evitar errores
            df = df[df["Código de Barra"].astype(str) != code]
            df.to_csv(DATA_FILE, index=False)
            return jsonify({"success": True})
        return jsonify({"success": False, "message": "Código no encontrado"}), 404
    return jsonify({"success": False, "message": "Datos inválidos"}), 400

# Eliminar un código por su valor


# Exportar los datos a Excel o PDF
@app.route("/export/<file_type>")
def export_data(file_type):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Ruta base del proyecto
    if file_type == "excel":
        output_file = os.path.join(BASE_DIR, "data.xlsx")
        df = pd.read_csv(DATA_FILE)  # Cargar los datos del archivo CSV
        df.to_excel(output_file, index=False)  # Generar el archivo Excel
        if os.path.exists(output_file):  # Verificar que el archivo existe
            return send_file(output_file, as_attachment=True)
        else:
            return "El archivo Excel no se pudo generar", 500
    elif file_type == "pdf":
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas

        output_file = os.path.join(BASE_DIR, "data.pdf")
        c = canvas.Canvas(output_file, pagesize=letter)
        df = pd.read_csv(DATA_FILE)
        c.drawString(100, 750, "Códigos Registrados")
        y = 730
        for _, row in df.iterrows():
            c.drawString(100, y, f"{row['Código de Barra']} - {row['Ubicación']}")
            y -= 20
        c.save()
        if os.path.exists(output_file):  # Verificar que el archivo existe
            return send_file(output_file, as_attachment=True)
        else:
            return "El archivo PDF no se pudo generar", 500
    return "Tipo de archivo no válido", 400

if __name__ == "__main__":
    app.run(debug=True)