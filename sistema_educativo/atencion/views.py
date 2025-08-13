from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from .models import SesionMonitoreo, AtencionVisual
from .serializers import SesionMonitoreoSerializer, AtencionVisualSerializer
from django.utils import timezone

# Importa el script actualizado
from atencion.scripts.deteccion_facial import monitorear_atencion_durante_tiempo

from cursos.models import Recurso, Fase, Curso, Inscripcion
from usuarios.models import Usuario

class SesionMonitoreoViewSet(viewsets.ModelViewSet):
    queryset = SesionMonitoreo.objects.all()
    serializer_class = SesionMonitoreoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='monitoreo-atencion')
    def monitoreo_atencion(self, request, pk=None):
        sesion_id = pk or request.data.get('sesion_id')
        atencion = request.data.get('atencion')

        if not sesion_id or atencion is None:
            return Response({"error": "sesion_id y atencion son requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sesion = SesionMonitoreo.objects.get(id=sesion_id)
            score_atencion = float(atencion)
            if score_atencion < 0 or score_atencion > 100:
                return Response({"error": "El score de atención debe estar entre 0 y 100"}, status=status.HTTP_400_BAD_REQUEST)

            # Ejecuta el monitoreo visual (ajusta segundos según necesidad)
            resultados = monitorear_atencion_durante_tiempo(segundos=30, mostrar_ventana=False)

            patrones = {
                "promedio_desviacion": resultados.get("promedio_desviacion", 0.0),
                "porcentaje_cierre_ojos": resultados.get("porcentaje_cierre_ojos", 0.0),
                "porcentaje_cabeza_fuera": resultados.get("porcentaje_cabeza_fuera", 0.0),
                "porcentaje_presencia": resultados.get("porcentaje_presencia", 0.0),
                "total_frames": resultados.get("total_frames", 0),
                "frames_con_rostro": resultados.get("frames_con_rostro", 0),
                "frames_ausente": resultados.get("frames_ausente", 0),
                "inclinacion_promedio": float(
                    sum([f.get("inclinacion", 0.0) for f in resultados.get("detalle_frames", []) if f.get("inclinacion") is not None]) /
                    max(1, len([f for f in resultados.get("detalle_frames", []) if f.get("inclinacion") is not None]))
                ) if resultados.get("detalle_frames") else 0.0
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

            return Response({"status": "monitoreo terminado", "patrones": patrones}, status=status.HTTP_200_OK)
        except SesionMonitoreo.DoesNotExist:
            return Response({"error": "Sesión no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# NUEVO: Endpoint para crear sesiones de monitoreo masivas
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_sesiones_monitoreo(request):
    recurso_id = request.data.get('recurso')
    fase_id = request.data.get('fase')
    if not recurso_id or not fase_id:
        return Response({'error': 'Faltan datos'}, status=400)
    try:
        recurso = Recurso.objects.get(id=recurso_id)
        fase = Fase.objects.get(id=fase_id)
        curso = fase.curso
        # Busca estudiantes inscritos en el curso
        estudiantes = Usuario.objects.filter(inscripcion__curso=curso, inscripcion__rol='estudiante')
        creadas = 0
        for estudiante in estudiantes:
            # Evita duplicados
            if not SesionMonitoreo.objects.filter(estudiante=estudiante, recurso=recurso, fase=fase).exists():
                SesionMonitoreo.objects.create(
                    estudiante=estudiante,
                    recurso=recurso,
                    fase=fase,
                    curso=curso
                )
                creadas += 1
        return Response({'ok': True, 'creadas': creadas})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

class AtencionVisualViewSet(viewsets.ModelViewSet):
    queryset = AtencionVisual.objects.all()
    serializer_class = AtencionVisualSerializer
    permission_classes = [IsAuthenticated]