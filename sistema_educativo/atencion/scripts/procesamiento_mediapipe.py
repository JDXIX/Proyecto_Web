import cv2
import numpy as np
import mediapipe as mp
import base64

mp_face_mesh = mp.solutions.face_mesh

# Índices de puntos para EAR (ojos)
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [263, 387, 385, 362, 380, 373]

# Índices para MAR (boca)
MOUTH = [13, 14, 78, 308]


# ============================================================
#  UTILIDADES
# ============================================================

def distancia(a, b):
    return np.linalg.norm(a - b)


# ============================================================
#  EAR
# ============================================================

def calcular_EAR(landmarks):
    ojo_izq = np.array([landmarks[i] for i in LEFT_EYE])
    ojo_der = np.array([landmarks[i] for i in RIGHT_EYE])

    ear_izq = (distancia(ojo_izq[1], ojo_izq[5]) + distancia(ojo_izq[2], ojo_izq[4])) / \
              (2 * distancia(ojo_izq[0], ojo_izq[3]))

    ear_der = (distancia(ojo_der[1], ojo_der[5]) + distancia(ojo_der[2], ojo_der[4])) / \
              (2 * distancia(ojo_der[0], ojo_der[3]))

    return (ear_izq + ear_der) / 2


# ============================================================
#  MAR
# ============================================================

def calcular_MAR(landmarks):
    arriba = landmarks[13]
    abajo = landmarks[14]
    izquierda = landmarks[78]
    derecha = landmarks[308]

    mar = distancia(arriba, abajo) / distancia(izquierda, derecha)
    return mar


# ============================================================
#  HEAD POSE — versión robusta, NO CRASHEA
# ============================================================

def calcular_head_pose(landmarks, img_shape):
    try:
        h, w = img_shape[:2]

        puntos_2d = np.array([
            landmarks[1],
            landmarks[33],
            landmarks[263],
            landmarks[61],
            landmarks[291],
            landmarks[199]
        ], dtype=np.float64)

        puntos_3d = np.array([
            [0.0, 0.0, 0.0],
            [-30.0, -125.0, -30.0],
            [30.0, -125.0, -30.0],
            [-70.0, -70.0, -50.0],
            [70.0, -70.0, -50.0],
            [0.0, -150.0, -10.0]
        ], dtype=np.float64)

        focal_length = w
        cam_matrix = np.array([
            [focal_length, 0, w / 2],
            [0, focal_length, h / 2],
            [0, 0, 1]
        ])

        dist = np.zeros((4, 1))

        ok, rot_vec, trans_vec = cv2.solvePnP(
            puntos_3d,
            puntos_2d,
            cam_matrix,
            dist,
            flags=cv2.SOLVEPNP_ITERATIVE
        )

        if not ok:
            return None, None, None

        rot_mat, _ = cv2.Rodrigues(rot_vec)
        angles = cv2.RQDecomp3x3(rot_mat)[0]

        pitch, yaw, roll = angles
        return float(pitch), float(yaw), float(roll)

    except Exception:
        # Si falta algún punto o solvePnP falla, devolvemos None
        return None, None, None


# ============================================================
#  CORE: PROCESAR FRAME NUMPY (uso interno)
# ============================================================

def _procesar_frame_numpy(frame):
    """
    Procesa un frame (numpy.ndarray).
    Retorna (ear, mar, yaw, pitch, roll) o None si falla.
    """
    if frame is None:
        return None

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    ) as face_mesh:

        results = face_mesh.process(rgb)

        if not results.multi_face_landmarks:
            return None

        h, w = frame.shape[:2]
        lm = results.multi_face_landmarks[0]

        # Convertir landmarks a coordenadas reales
        landmarks = []
        for p in lm.landmark:
            landmarks.append(np.array([p.x * w, p.y * h]))

        # EAR
        ear = calcular_EAR(landmarks)

        # MAR
        mar = calcular_MAR(landmarks)

        # Head Pose
        pitch, yaw, roll = calcular_head_pose(landmarks, frame.shape)
        if pitch is None:
            return None

        # OJO: el orden debe coincidir con el CSV y el modelo:
        # EAR, MAR, Yaw, Pitch, Roll
        return ear, mar, yaw, pitch, roll


# ============================================================
#  API PARA ENTRENAMIENTO (si usas frames locales)
# ============================================================

def procesar_frame_numpy(frame):
    """
    Versión pública para usar con numpy.ndarray (entrenamiento offline).
    Retorna diccionario con claves: ear, mar, yaw, pitch, roll o None.
    """
    resultado = _procesar_frame_numpy(frame)
    if resultado is None:
        return None

    ear, mar, yaw, pitch, roll = resultado
    return {
        "ear": float(ear),
        "mar": float(mar),
        "yaw": float(yaw),
        "pitch": float(pitch),
        "roll": float(roll)
    }


# ============================================================
#  PROCESAMIENTO DESDE BASE64 (para frontend web)
# ============================================================

def procesar_frame(imagen_base64):
    """
    Procesa un string base64 desde el navegador (uso en views.py).
    Devuelve un diccionario:
    {
        "ear": ...,
        "mar": ...,
        "yaw": ...,
        "pitch": ...,
        "roll": ...
    }
    o None si falla.
    """
    try:
        # imagen_base64 puede venir como "data:image/jpeg;base64,XXXX"
        if "," in imagen_base64:
            imagen_base64 = imagen_base64.split(",")[1]

        img_bytes = base64.b64decode(imagen_base64)
        np_img = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        resultado = _procesar_frame_numpy(frame)
        if resultado is None:
            return None

        ear, mar, yaw, pitch, roll = resultado

        return {
            "ear": float(ear),
            "mar": float(mar),
            "yaw": float(yaw),
            "pitch": float(pitch),
            "roll": float(roll)
        }

    except Exception:
        return None


# Alias por compatibilidad si en algún lado antiguo se usa este nombre
def procesar_frame_base64(imagen_base64):
    return procesar_frame(imagen_base64)
