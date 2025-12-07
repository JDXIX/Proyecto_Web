import os
import cv2
import csv
from tqdm import tqdm
from sistema_educativo.atencion.scripts.procesamiento_mediapipe import procesar_frame

# Ruta base del proyecto (carpeta Proyecto_Web/data)
BASE_DATA = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "data"
)

# Ruta del dataset DDD (DEBE existir: data/DDD/)
DDD_PATH = os.path.join(BASE_DATA, "DDD")

# Etiquetas del modelo binario
LABELS = {
    "Drowsy": 0,
    "Non_Drowsy": 1
}

# Límite opcional (None = todas)
MAX_IMAGES_PER_CLASS = 3000  # Puedes bajar a 500 si quieres pruebas rápidas

# Archivo CSV final
OUTPUT_CSV = os.path.join(BASE_DATA, "datos_entrenamiento_ddd.csv")


def procesar_imagen(imagen_path, label):
    """
    Procesa una imagen con MediaPipe y extrae EAR, MAR y Head Pose.
    Devuelve [ear, mar, yaw, pitch, roll, label] o None si falla.
    """
    try:
        img = cv2.imread(imagen_path)

        if img is None:
            print("⚠ Imagen inválida:", imagen_path)
            return None

        # Tamaño mínimo para evitar fallos en MediaPipe
        h, w = img.shape[:2]
        if h < 80 or w < 80:
            img = cv2.resize(img, (150, 150))

        # Procesar con MediaPipe (EAR, MAR, yaw, pitch, roll)
        ear, mar, yaw, pitch, roll = procesar_frame(img)

        # Si no hay rostro, descartamos la imagen
        if ear is None:
            return None

        return [ear, mar, yaw, pitch, roll, label]

    except Exception as e:
        print(f"❌ Error procesando {imagen_path}: {e}")
        return None


def generar_dataset():
    print("\n=== GENERANDO DATASET DDD ===\n")
    datos = []

    for folder, label in LABELS.items():
        ruta_carpeta = os.path.join(DDD_PATH, folder)

        if not os.path.isdir(ruta_carpeta):
            print(f"⚠ Carpeta no encontrada: {ruta_carpeta}")
            continue

        print(f"\n➡ Procesando carpeta: {ruta_carpeta}  (label={label})")

        archivos = [
            f for f in os.listdir(ruta_carpeta)
            if f.lower().endswith((".png", ".jpg", ".jpeg"))
        ]

        # limitamos por seguridad
        if MAX_IMAGES_PER_CLASS is not None:
            archivos = archivos[:MAX_IMAGES_PER_CLASS]

        for archivo in tqdm(archivos, desc=f"Procesando {folder}"):
            img_path = os.path.join(ruta_carpeta, archivo)
            fila = procesar_imagen(img_path, label)

            if fila:
                datos.append(fila)

    # Guardar CSV
    print("\n📁 Guardando CSV final...")

    with open(OUTPUT_CSV, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["EAR", "MAR", "Yaw", "Pitch", "Roll", "Label"])
        writer.writerows(datos)

    print("\n🎉 Dataset generado correctamente:")
    print("📂 Archivo CSV:", OUTPUT_CSV)
    print("📊 Total de muestras:", len(datos))


if __name__ == "__main__":
    generar_dataset()
