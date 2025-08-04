import cv2
import mediapipe as mp
import numpy as np

def calcular_desviacion_mirada(landmarks, frame):
    if len(landmarks) < 387:
        print(f"Landmarks: {len(landmarks)}")
        return 0.0
    altura, ancho, _ = frame.shape
    left_eye = landmarks[145]
    right_eye = landmarks[374]
    centro_ojos_x = (left_eye.x * ancho + right_eye.x * ancho) / 2
    centro_ojos_y = (left_eye.y * altura + right_eye.y * altura) / 2
    centro_frame_x = ancho / 2
    centro_frame_y = altura / 2
    desviacion = np.sqrt((centro_ojos_x - centro_frame_x)**2 + (centro_ojos_y - centro_frame_y)**2)
    desviacion_norm = desviacion / max(ancho, altura)
    print(f"Coords: ({centro_ojos_x:.2f}, {centro_ojos_y:.2f}), Desv: {desviacion_norm:.2f}")
    return desviacion_norm

def detectar_cierre_ojos(landmarks, frame_shape=(480, 640, 3)):
    if len(landmarks) < 387:
        print(f"Landmarks: {len(landmarks)}")
        return False
    altura, ancho, _ = frame_shape
    # Puntos para el ojo izquierdo
    left_top = [landmarks[145].x * ancho, landmarks[145].y * altura]
    left_bottom = [landmarks[159].x * ancho, landmarks[159].y * altura]
    left_left = [landmarks[33].x * ancho, landmarks[33].y * altura]
    left_right = [landmarks[133].x * ancho, landmarks[133].y * altura]
    # Puntos para el ojo derecho
    right_top = [landmarks[374].x * ancho, landmarks[374].y * altura]
    right_bottom = [landmarks[386].x * ancho, landmarks[386].y * altura]
    right_left = [landmarks[263].x * ancho, landmarks[263].y * altura]
    right_right = [landmarks[362].x * ancho, landmarks[362].y * altura]

    # Calcular EAR para ojo izquierdo
    left_ear = (np.linalg.norm(np.array(left_top) - np.array(left_bottom))) / (np.linalg.norm(np.array(left_left) - np.array(left_right)))
    # Calcular EAR para ojo derecho
    right_ear = (np.linalg.norm(np.array(right_top) - np.array(right_bottom))) / (np.linalg.norm(np.array(right_left) - np.array(right_right)))
    ear = (left_ear + right_ear) / 2
    print(f"EAR: {ear:.4f}")
    return ear < 0.20  # Umbral inicial ajustado

if __name__ == "__main__":
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.3, min_tracking_confidence=0.3)
    mp_drawing = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: No se pudo abrir la cámara.")
        exit()

    while cap.isOpened():
        success, image = cap.read()
        if not success:
            print("No se puede acceder a la cámara.")
            break

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(image_rgb)

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                mp_drawing.draw_landmarks(image, face_landmarks, mp_face_mesh.FACEMESH_TESSELATION)
                desviacion = calcular_desviacion_mirada(face_landmarks.landmark, image)
                cierre_ojos = detectar_cierre_ojos(face_landmarks.landmark, image.shape)
                cv2.putText(image, f"Desv: {desviacion:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                cv2.putText(image, f"Cierre: {cierre_ojos}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        else:
            cv2.putText(image, "No rostro", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        cv2.imshow('Detección Facial', image)
        if cv2.waitKey(5) & 0xFF == 27 or cv2.getWindowProperty('Detección Facial', cv2.WND_PROP_VISIBLE) < 1:
            break

    cap.release()
    cv2.destroyAllWindows()