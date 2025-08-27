from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from .models import SesionMonitoreo, AtencionVisual, NotaAcademica
from .serializers import SesionMonitoreoSerializer, AtencionVisualSerializer, NotaAcademicaSerializer
from django.utils import timezone

# Importa el script actualizado
# from atencion.scripts.deteccion_facial import monitorear_atencion_durante_tiempo

from cursos.models import Recurso, Fase, Curso, Inscripcion
from usuarios.models import Usuario

class SesionMonitoreoViewSet(viewsets.ModelViewSet):
    queryset = SesionMonitoreo.objects.all()
    serializer_class = SesionMonitoreoSerializer
    permission_classes = [IsAuthenticated]

    # MODIFICADO: Solo devuelve sesiones del estudiante autenticado para el recurso
    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        recurso = self.request.query_params.get("recurso")
        # Si el usuario es estudiante, filtra por él
        if hasattr(user, "rol") and user.rol == "estudiante":
            qs = qs.filter(estudiante=user)
        if recurso:
            qs = qs.filter(recurso_id=recurso)
        return qs

    @action(detail=True, methods=['post'], url_path='monitoreo-atencion')
    def monitoreo_atencion(self, request, pk=None):
        """
        Ejecuta el monitoreo visual y calcula el score de atención con la fórmula:
          score = 100 - (0.4*desviacion + 0.3*cierre_ojos + 0.2*cabeza_fuera + 0.1*(100 - presencia))

        Donde todas las métricas están en el rango 0-100. El score se limita a [0, 100].
        Se guarda el score y los patrones tanto en AtencionVisual como en la SesionMonitoreo.
        También clasifica por umbrales: Alto (>=80), Medio (50-79), Bajo (<50).
        """
        sesion_id = pk or request.data.get('sesion_id')
        duracion = request.data.get('duracion')  # opcional, en segundos

        if not sesion_id:
            return Response({"error": "sesion_id es requerido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sesion = SesionMonitoreo.objects.get(id=sesion_id)

            # Determina la duración a usar
            if duracion is not None:
                try:
                    segundos = int(duracion)
                except Exception:
                    segundos = 30
            elif sesion.recurso and getattr(sesion.recurso, "duracion", None):
                segundos = sesion.recurso.duracion
            else:
                segundos = 30

            # Ejecuta el monitoreo visual con la duración correcta
            # TEMPORARILY DISABLED: resultados = monitorear_atencion_durante_tiempo(
            #     segundos=segundos,
            #     mostrar_ventana=False
            # )
            # Mock results for development
            resultados = {
                "promedio_desviacion": 15.0,
                "porcentaje_cierre_ojos": 10.0,
                "porcentaje_cabeza_fuera": 5.0,
                "porcentaje_presencia": 95.0
            }

            # Extrae patrones con valores por defecto (0-100)
            promedio_desviacion = float(resultados.get("promedio_desviacion", 0.0) or 0.0)           # 0..100
            porcentaje_cierre_ojos = float(resultados.get("porcentaje_cierre_ojos", 0.0) or 0.0)     # 0..100
            porcentaje_cabeza_fuera = float(resultados.get("porcentaje_cabeza_fuera", 0.0) or 0.0)   # 0..100
            porcentaje_presencia = float(resultados.get("porcentaje_presencia", 100.0) or 0.0)       # 0..100

            # Ponderaciones
            pesos = {
                "desviacion": 0.40,
                "cierre_ojos": 0.30,
                "cabeza_fuera": 0.20,
                "presencia": 0.10,  # se penaliza (100 - presencia)
            }

            # Cálculo del score (limitado a [0, 100])
            score_atencion = 100 - (
                pesos["desviacion"] * promedio_desviacion +
                pesos["cierre_ojos"] * porcentaje_cierre_ojos +
                pesos["cabeza_fuera"] * porcentaje_cabeza_fuera +
                pesos["presencia"] * (100 - porcentaje_presencia)
            )
            score_atencion = max(0.0, min(100.0, round(score_atencion, 2)))

            # Clasificación por umbrales
            # Alto (≥80), Medio (50–79), Bajo (<50)
            if score_atencion >= 80:
                nivel_atencion = "ALTO"
            elif score_atencion >= 50:
                nivel_atencion = "MEDIO"
            else:
                nivel_atencion = "BAJO"

            # Estructura de patrones detallados para persistir
            patrones = {
                "promedio_desviacion": promedio_desviacion,
                "porcentaje_cierre_ojos": porcentaje_cierre_ojos,
                "porcentaje_cabeza_fuera": porcentaje_cabeza_fuera,
                "porcentaje_presencia": porcentaje_presencia,
                "total_frames": resultados.get("total_frames", 0),
                "frames_con_rostro": resultados.get("frames_con_rostro", 0),
                "frames_ausente": resultados.get("frames_ausente", 0),
                "inclinacion_promedio": float(
                    sum(
                        [f.get("inclinacion", 0.0) for f in resultados.get("detalle_frames", []) if f.get("inclinacion") is not None]
                    ) / max(1, len([f for f in resultados.get("detalle_frames", []) if f.get("inclinacion") is not None]))
                ) if resultados.get("detalle_frames") else 0.0,
                "pesos_utilizados": pesos,
                "umbrales": {"ALTO": ">=80", "MEDIO": "50-79", "BAJO": "<50"},
                "nivel_atencion": nivel_atencion,
                "duracion_segundos": segundos,
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

            return Response(
                {
                    "status": "monitoreo terminado",
                    "score_atencion": score_atencion,
                    "nivel_atencion": nivel_atencion,
                    "patrones": patrones,
                },
                status=status.HTTP_200_OK
            )

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
        curso = fase.nivel.curso
        estudiantes = Usuario.objects.filter(
            inscripciones__curso=curso,
            rol='estudiante'
        ).distinct()
        creadas = 0
        for estudiante in estudiantes:
            if not SesionMonitoreo.objects.filter(estudiante=estudiante, recurso=recurso, fase=fase).exists():
                SesionMonitoreo.objects.create(
                    estudiante=estudiante,
                    recurso=recurso,
                    fase=fase
                )
                creadas += 1
        return Response({'ok': True, 'creadas': creadas})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# NUEVO: Crear (o devolver) una sesión de monitoreo para el estudiante autenticado y un recurso
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_sesion_para_mi(request):
    """
    Crea (o retorna) una SesionMonitoreo para el estudiante autenticado y el recurso dado.
    body: { recurso: uuid }
    """
    try:
        user = request.user
        if not hasattr(user, "rol") or user.rol != "estudiante":
            return Response({"error": "Solo estudiantes"}, status=403)
        recurso_id = request.data.get('recurso')
        if not recurso_id:
            return Response({"error": "Falta recurso"}, status=400)
        recurso = Recurso.objects.get(id=recurso_id)
        sesion, _ = SesionMonitoreo.objects.get_or_create(
            estudiante=user,
            recurso=recurso,
            fase=recurso.fase
        )
        return Response({"id": str(sesion.id)}, status=200)
    except Recurso.DoesNotExist:
        return Response({"error": "Recurso no encontrado"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

class AtencionVisualViewSet(viewsets.ModelViewSet):
    queryset = AtencionVisual.objects.all()
    serializer_class = AtencionVisualSerializer
    permission_classes = [IsAuthenticated]


class NotaAcademicaViewSet(viewsets.ModelViewSet):
    queryset = NotaAcademica.objects.all()
    serializer_class = NotaAcademicaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        estudiante = self.request.query_params.get('estudiante')
        recurso = self.request.query_params.get('recurso')
        if estudiante:
            qs = qs.filter(estudiante_id=estudiante)
        if recurso:
            qs = qs.filter(recurso_id=recurso)
        return qs

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_nota_combinada(request):
    estudiante_id = request.query_params.get('estudiante')
    recurso_id = request.query_params.get('recurso')
    if not estudiante_id or not recurso_id:
        return Response({'error': 'Faltan parámetros'}, status=400)
    try:
        from .models import AtencionVisual, NotaAcademica
        atencion = AtencionVisual.objects.filter(
            estudiante_id=estudiante_id, recurso_id=recurso_id
        ).order_by('-id').first()
        nota = NotaAcademica.objects.filter(
            estudiante_id=estudiante_id, recurso_id=recurso_id
        ).order_by('-id').first()
        score_atencion = atencion.score_atencion if atencion else 0
        nota_academica = nota.nota if nota else 0
        nota_combinada = round(0.4 * score_atencion + 0.6 * nota_academica, 2)
        return Response({
            'score_atencion': score_atencion,
            'nota_academica': nota_academica,
            'nota_combinada': nota_combinada
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)