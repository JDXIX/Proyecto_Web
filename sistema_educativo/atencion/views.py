from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import SesionMonitoreo, AtencionVisual
from .serializers import SesionMonitoreoSerializer, AtencionVisualSerializer
from django.utils import timezone
import cv2
import numpy as np
import mediapipe as mp

# Importa correctamente el script
from atencion.scripts.deteccion_facial import calcular_desviacion_mirada, detectar_cierre_ojos

class SesionMonitoreoViewSet(viewsets.ModelViewSet):
    queryset = SesionMonitoreo.objects.all()
    serializer_class = SesionMonitoreoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='monitoreo-atencion')
    def monitoreo_atencion(self, request, pk=None):
        sesion_id = pk or request.data.get('sesion_id')
        atencion = request.data.get('atencion')
        timestamp = request.data.get('timestamp')

        if not sesion_id or atencion is None:
            return Response({"error": "sesion_id y atencion son requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sesion = SesionMonitoreo.objects.get(id=sesion_id)
            score_atencion = float(atencion)
            if score_atencion < 0 or score_atencion > 100:
                return Response({"error": "El score de atención debe estar entre 0 y 100"}, status=status.HTTP_400_BAD_REQUEST)

            # Lógica de detección visual usando el script
            patrones = {}
            cierre_ojos = False
            desviacion_gaze = 0.0

            cap = cv2.VideoCapture(0)
            if cap.isOpened():
                ret, frame = cap.read()
                if ret and frame is not None:
                    mp_face_mesh = mp.solutions.face_mesh
                    with mp_face_mesh.FaceMesh(min_detection_confidence=0.3, min_tracking_confidence=0.3) as face_mesh:
                        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        results = face_mesh.process(rgb_frame)
                        if results.multi_face_landmarks:
                            face_landmarks = results.multi_face_landmarks[0]
                            desviacion_gaze = calcular_desviacion_mirada(face_landmarks.landmark, frame)
                            cierre_ojos = detectar_cierre_ojos(face_landmarks.landmark)
                            cierre_ojos = bool(cierre_ojos)  # <-- ¡Asegura tipo bool estándar!
                cap.release()
            else:
                return Response({"error": "No se detectó cámara"}, status=status.HTTP_400_BAD_REQUEST)

            patrones = {
                "desviacion_gaze": desviacion_gaze,
                "cierre_ojos": cierre_ojos
            }

            # Guardar en la base de datos
            AtencionVisual.objects.create(
                sesion=sesion,
                estudiante=sesion.estudiante,
                recurso=sesion.recurso,
                fase=sesion.fase,
                score_atencion=score_atencion,
                patrones=patrones
            )
            sesion.fin = timezone.now()
            sesion.duracion = sesion.fin - sesion.inicio
            sesion.score_atencion = score_atencion
            sesion.patrones = patrones
            sesion.save()

            return Response({"status": "monitoreo terminado"}, status=status.HTTP_200_OK)
        except SesionMonitoreo.DoesNotExist:
            return Response({"error": "Sesión no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class AtencionVisualViewSet(viewsets.ModelViewSet):
    queryset = AtencionVisual.objects.all()
    serializer_class = AtencionVisualSerializer
    permission_classes = [IsAuthenticated]