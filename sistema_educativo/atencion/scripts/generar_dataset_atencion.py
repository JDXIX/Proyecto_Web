import os
import csv
from datetime import datetime

DATASET_PATH = os.path.join("data", "dataset_atencion.csv")

# Asegurar que existe la carpeta data/
os.makedirs("data", exist_ok=True)

def guardar_registro(ear, mar, pitch, yaw, roll, label):
    """
    Guarda un registro real de datos en el CSV.
    label = 1 (atento), 0 (no atento)
    """
    
    archivo_nuevo = not os.path.exists(DATASET_PATH)

    with open(DATASET_PATH, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        # Si el archivo es nuevo, escribir encabezados
        if archivo_nuevo:
            writer.writerow(["timestamp", "ear", "mar", "pitch", "yaw", "roll", "label_atencion"])

        writer.writerow([
            datetime.now().timestamp(),
            ear,
            mar,
            pitch,
            yaw,
            roll,
            label
        ])

    return True
