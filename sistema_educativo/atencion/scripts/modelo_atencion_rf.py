import os
import pickle
import numpy as np

# Ruta al archivo .pkl generado por entrenar_modelo.py
MODEL_PATH = os.path.join("atencion", "scripts", "modelo_atencion_rf.pkl")

# Cargar modelo y scaler al iniciar el módulo (optimiza rendimiento)
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"No se encontró el modelo entrenado en: {MODEL_PATH}")

with open(MODEL_PATH, "rb") as f:
    paquete = pickle.load(f)

modelo = paquete["modelo"]
scaler = paquete["scaler"]
features_order = paquete["features"]  # ["EAR", "MAR", "Yaw", "Pitch", "Roll"]

print("\nModelo Random Forest cargado correctamente.")
print("Características esperadas:", features_order)


def predecir_atencion(ear, mar, pitch, yaw, roll):
    """
    Recibe las métricas procesadas por MediaPipe y devuelve:
    - nivel_atencion (0 o 1)
    - probabilidades de cada clase
    """

    # Convertir a vector en el orden EXACTO usado durante entrenamiento
    vector = np.array([[ear, mar, yaw, pitch, roll]], dtype=float)

    # Escalar valores
    vector_scaled = scaler.transform(vector)

    # Predicción
    pred = modelo.predict(vector_scaled)[0]
    prob = modelo.predict_proba(vector_scaled)[0]

    return {
        "nivel_atencion": int(pred),
        "probabilidades": {
            "distraccion": float(prob[0]),
            "atencion": float(prob[1])
        }
    }
