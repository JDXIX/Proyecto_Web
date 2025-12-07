import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import pickle

# RUTA AL CSV EXACTO
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATASET_PATH = os.path.join(BASE_DIR, "data", "datos_entrenamiento_ddd.csv")

# RUTA DONDE SE GUARDARÁ EL MODELO
MODEL_PATH = os.path.join("atencion", "scripts", "modelo_atencion_rf.pkl")

def entrenar_random_forest():
    print("\n==============================")
    print(" ENTRENANDO MODELO RANDOM FOREST (DDD CSV)")
    print("==============================\n")

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"No se encontró el dataset: {DATASET_PATH}")

    # ===============================
    # 1. CARGAR CSV
    # ===============================
    df = pd.read_csv(DATASET_PATH)

    print("Columnas detectadas en dataset:")
    print(df.columns.tolist())
    print("Total de filas:", len(df))

    # ===============================
    # 2. SELECCIONAR FEATURES EXACTAS
    # ===============================
    FEATURES = ["EAR", "MAR", "Yaw", "Pitch", "Roll"]
    LABEL = "Label"

    X = df[FEATURES]
    y = df[LABEL]

    # ===============================
    # 3. DIVIDIR TRAIN/TEST
    # ===============================
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    # ===============================
    # 4. ESCALAR FEATURES
    # ===============================
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # ===============================
    # 5. Random Forest CONFIG PROFESIONAL
    # ===============================
    model = RandomForestClassifier(
        n_estimators=350,   # más árboles = más estable
        max_depth=14,       # evita overfitting
        random_state=42,
        n_jobs=-1           # usar todos los núcleos
    )

    print("\nEntrenando modelo...")
    model.fit(X_train_scaled, y_train)

    # ===============================
    # 6. EVALUAR MODELO
    # ===============================
    y_pred = model.predict(X_test_scaled)

    accuracy = accuracy_score(y_test, y_pred)
    print("\nAccuracy del modelo:", accuracy)
    print("\nReporte de clasificación:")
    print(classification_report(y_test, y_pred))

    # ===============================
    # 7. GUARDAR MODELO + SCALER
    # ===============================
    paquete_modelo = {
        "modelo": model,
        "scaler": scaler,
        "features": FEATURES
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(paquete_modelo, f)

    print(f"\nModelo entrenado y guardado en: {MODEL_PATH}")
    print("Listo para usarse en producción.\n")


if __name__ == "__main__":
    entrenar_random_forest()
