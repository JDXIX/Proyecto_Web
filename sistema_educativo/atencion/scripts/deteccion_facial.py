import cv2
import mediapipe as mp
import numpy as np
import time
from datetime import datetime
import json

# FPS objetivo para no sobrecargar (2 fps)
FPS_OBJETIVO = 2

def convertir_a_nativo(obj):
    if isinstance(obj, np.generic):
        return obj.item()
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    raise TypeError(f"Tipo no serializable: {type(obj)}")

def calcular_desviacion_mirada(landmarks, frame):
    if len(landmarks) < 387:
        return 0.0
    h, w, _ = frame.shape
    left_eye = landmarks[145]
    right_eye = landmarks[374]
    cx = (left_eye.x * w + right_eye.x * w) / 2
    cy = (left_eye.y * h + right_eye.y * h) / 2
    frame_cx, frame_cy = w / 2, h / 2
    dist = np.sqrt((cx - frame_cx) ** 2 + (cy - frame_cy) ** 2)
    return float(dist / max(w, h))

def detectar_cierre_ojos(landmarks, frame_shape):
    if len(landmarks) < 387:
        return False
    h, w, _ = frame_shape
    lt = [landmarks[145].x * w, landmarks[145].y * h]
    lb = [landmarks[159].x * w, landmarks[159].y * h]
    ll = [landmarks[33].x * w, landmarks[33].y * h]
    lr = [landmarks[133].x * w, landmarks[133].y * h]
    rt = [landmarks[374].x * w, landmarks[374].y * h]
    rb = [landmarks[386].x * w, landmarks[386].y * h]
    rl = [landmarks[263].x * w, landmarks[263].y * h]
    rr = [landmarks[362].x * w, landmarks[362].y * h]
    left_ear = np.linalg.norm(np.array(lt) - np.array(lb)) / np.linalg.norm(np.array(ll) - np.array(lr))
    right_ear = np.linalg.norm(np.array(rt) - np.array(rb)) / np.linalg.norm(np.array(rl) - np.array(rr))
    ear = (left_ear + right_ear) / 2.0
    return bool(ear < 0.20)

def detectar_cabeza_fuera_inclinada(landmarks, frame_shape):
    h, w, _ = frame_shape
    if len(landmarks) < 455:
        return True, 0.0
    nariz = landmarks[1]
    ear_l = landmarks[234]
    ear_r = landmarks[454]
    cx, cy = w / 2, h / 2
    nx, ny = nariz.x * w, nariz.y * h
    fuera = abs(nx - cx) > w * 0.35 or abs(ny - cy) > h * 0.35
    inclinacion = abs((ear_l.y - ear_r.y) * h)
    return bool(fuera), float(inclinacion)

def monitorear_atencion_durante_tiempo(segundos=10, fps_objetivo=FPS_OBJETIVO, mostrar_ventana=True):
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        refine_landmarks=True
    )
    drawing = mp.solutions.drawing_utils
    draw_style = mp.solutions.drawing_styles

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError("No se pudo abrir la cámara")

    resultados = []
    start_time = time.time()
    last_frame_time = 0

    while time.time() - start_time < segundos:
        now = time.time()
        if now - last_frame_time < 1.0 / fps_objetivo:
            time.sleep(0.002)
            continue
        last_frame_time = now

        ok, frame = cap.read()
        if not ok:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = face_mesh.process(frame_rgb)

        frame_data = {
            "timestamp": datetime.now().isoformat(),
            "rostro_detectado": False,
            "desviacion": None,
            "cierre_ojos": None,
            "cabeza_fuera": None,
            "inclinacion": None
        }

        if result.multi_face_landmarks:
            face_landmarks = result.multi_face_landmarks[0]
            frame_data["rostro_detectado"] = True

            drawing.draw_landmarks(
                frame,
                face_landmarks,
                mp_face_mesh.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=draw_style.get_default_face_mesh_tesselation_style()
            )

            frame_data["desviacion"] = calcular_desviacion_mirada(face_landmarks.landmark, frame)
            frame_data["cierre_ojos"] = detectar_cierre_ojos(face_landmarks.landmark, frame.shape)
            frame_data["cabeza_fuera"], frame_data["inclinacion"] = detectar_cabeza_fuera_inclinada(face_landmarks.landmark, frame.shape)
        else:
            frame_data["cabeza_fuera"] = True  # Sin rostro => fuera

        resultados.append(frame_data)

        if mostrar_ventana:
            y0 = 25
            dy = 22
            def put(txt, color):
                nonlocal y0
                cv2.putText(frame, txt, (10, y0), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                y0 += dy

            put(f"Rostro: {'SI' if frame_data['rostro_detectado'] else 'NO'}", (0,255,0) if frame_data['rostro_detectado'] else (0,0,255))
            put(f"Desv: {frame_data['desviacion']:.3f}" if frame_data['desviacion'] is not None else "Desv: -", (255,255,0))
            put(f"Cierre ojos: {'SI' if frame_data['cierre_ojos'] else 'NO'}" if frame_data['cierre_ojos'] is not None else "Cierre ojos: -", (0,255,255))
            put(f"Cabeza fuera: {'SI' if frame_data['cabeza_fuera'] else 'NO'}", (0,0,255) if frame_data['cabeza_fuera'] else (0,255,0))
            put(f"Inclinacion(px): {frame_data['inclinacion']:.1f}" if frame_data['inclinacion'] is not None else "Inclinacion: -", (255,0,0))
            frames_tot = len(resultados)
            frames_on = sum(1 for r in resultados if r["rostro_detectado"])
            presencia = (frames_on / frames_tot * 100) if frames_tot else 0
            put(f"Presencia acum: {presencia:.1f}%", (200,200,255))
            put(f"FPS objetivo: {fps_objetivo}", (180,255,180))

            cv2.imshow("Monitoreo (ESC para salir)", frame)
            if cv2.waitKey(1) & 0xFF == 27:
                break

    cap.release()
    cv2.destroyAllWindows()

    total_frames = len(resultados)
    frames_con_rostro = sum(1 for r in resultados if r["rostro_detectado"])
    frames_ausente = total_frames - frames_con_rostro
    promedio_desviacion = float(np.mean([r["desviacion"] for r in resultados if r["desviacion"] is not None])) if frames_con_rostro else 0.0
    porcentaje_cierre_ojos = float(np.mean([r["cierre_ojos"] for r in resultados if r["cierre_ojos"] is not None])) if frames_con_rostro else 0.0
    porcentaje_cabeza_fuera = float(np.mean([r["cabeza_fuera"] for r in resultados if r["cabeza_fuera"] is not None])) if total_frames else 0.0
    porcentaje_presencia = frames_con_rostro / total_frames if total_frames else 0.0

    resumen = {
        "fecha_inicio": datetime.fromtimestamp(start_time).isoformat(),
        "fecha_fin": datetime.now().isoformat(),
        "duracion_segundos": segundos,
        "fps_objetivo": fps_objetivo,
        "total_frames": total_frames,
        "frames_con_rostro": frames_con_rostro,
        "frames_ausente": frames_ausente,
        "porcentaje_presencia": porcentaje_presencia,
        "promedio_desviacion": promedio_desviacion,
        "porcentaje_cierre_ojos": porcentaje_cierre_ojos,
        "porcentaje_cabeza_fuera": porcentaje_cabeza_fuera,
        "detalle_frames": resultados
    }
    return resumen

if __name__ == "__main__":
    resumen = monitorear_atencion_durante_tiempo(segundos=10, fps_objetivo=FPS_OBJETIVO, mostrar_ventana=True)
    print("Resumen de atención:")
    print(json.dumps(resumen, default=convertir_a_nativo, indent=2))

