from django.utils import timezone
from django.db.models import Avg

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SesionMonitoreo, AtencionVisual, NotaAcademica
from .serializers import (
    SesionMonitoreoSerializer,
    AtencionVisualSerializer,
    NotaAcademicaSerializer,
)

from cursos.models import Recurso, Fase, Nivel, Curso, Inscripcion
from usuarios.models import Usuario

# Procesamiento y modelo ML
from atencion.scripts.procesamiento_mediapipe import procesar_frame
from atencion.scripts.modelo_atencion_rf import predecir_atencion


class SesionMonitoreoViewSet(viewsets.ModelViewSet):
    """
    CRUD de sesiones de monitoreo + endpoints de IA.
    """
    queryset = SesionMonitoreo.objects.all()
    serializer_class = SesionMonitoreoSerializer
    permission_classes = [IsAuthenticated]

    # =====================================================
    # A) CREAR SESIONES PARA TODOS LOS ESTUDIANTES DEL CURSO
    #    URL: POST /api/sesiones/crear-multiples/
    # =====================================================
    @action(detail=False, methods=["post"], url_path="crear-multiples")
    def crear_multiples(self, request):
        """
        Crea una SesionMonitoreo por cada estudiante inscrito
        en el curso del recurso indicado.

        Body esperado (variantes toleradas):
        {
            "curso": "<uuid-curso>",
            "fase": "<uuid-fase>",
            "recurso": "<uuid-recurso>"
        }
        """
        data = request.data

        # 1) Resolver ID del recurso
        recurso_raw = (
            data.get("recurso")
            or data.get("recurso_id")
            or data.get("recursoId")
            or data.get("id")
        )

        if isinstance(recurso_raw, dict):
            recurso_id = (
                recurso_raw.get("id")
                or recurso_raw.get("uuid")
                or recurso_raw.get("pk")
            )
        else:
            recurso_id = recurso_raw

        if not recurso_id:
            return Response(
                {"detail": "No se pudo determinar el recurso para crear sesiones."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2) Obtener recurso → fase → nivel → curso
        try:
            recurso = Recurso.objects.select_related(
                "fase", "fase__nivel", "fase__nivel__curso"
            ).get(pk=recurso_id)
        except Recurso.DoesNotExist:
            return Response(
                {"detail": "El recurso indicado no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        fase: Fase = recurso.fase
        nivel: Nivel = fase.nivel
        curso: Curso = nivel.curso

        # 3) Inscripciones del curso
        inscripciones = Inscripcion.objects.select_related("estudiante").filter(
            curso=curso
        )

        if not inscripciones.exists():
            return Response(
                {
                    "detail": "No se encontraron estudiantes inscritos en el curso.",
                    "sesiones_creadas": 0,
                },
                status=status.HTTP_200_OK,
            )

        # 4) Crear (o reutilizar) una sesión por estudiante
        sesiones = []
        for insc in inscripciones:
            usuario_est: Usuario = insc.estudiante  # Usuario con rol 'estudiante'

            sesion, created = SesionMonitoreo.objects.get_or_create(
                estudiante=usuario_est,
                recurso=recurso,
                fase=fase,
            )
            sesiones.append(sesion)

        serializer = self.get_serializer(sesiones, many=True)
        return Response(
            {
                "sesiones": serializer.data,
                "sesiones_creadas": len(sesiones),
            },
            status=status.HTTP_201_CREATED,
        )

    # =====================================================
    # B) MONITOREO FRAME A FRAME
    #    URL: POST /api/sesiones/<id>/monitoreo-atencion/
    # =====================================================
    @action(detail=True, methods=["post"], url_path="monitoreo-atencion")
    def monitoreo_atencion(self, request, pk=None):
        """
        Maneja 2 modos:

        1) INICIAR MONITOREO
           Body:
               { "duracion": 20 }

        2) FRAME A FRAME
           Body:
               { "frame": "data:image/jpeg;base64,..." }
        """
        sesion = self.get_object()

        # ---- MODO A: iniciar monitoreo ----
        duracion = request.data.get("duracion")
        if duracion is not None:
            sesion.inicio = timezone.now()
            sesion.fin = timezone.now() + timezone.timedelta(seconds=int(duracion))
            sesion.save()

            return Response(
                {
                    "sesion": SesionMonitoreoSerializer(sesion).data,
                    "mensaje": "Monitoreo iniciado.",
                },
                status=status.HTTP_200_OK,
            )

        # ---- MODO B: recibir frame ----
        frame_b64 = request.data.get("frame")
        if not frame_b64:
            return Response(
                {"error": "No se recibió 'frame' en la solicitud."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resultado = procesar_frame(frame_b64)

        if resultado is None:
            return Response(
                {"error": "No se detectó rostro."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        ear = resultado["ear"]
        mar = resultado["mar"]
        yaw = resultado["yaw"]
        pitch = resultado["pitch"]
        roll = resultado["roll"]

        pred = predecir_atencion(ear, mar, yaw, pitch, roll)

        AtencionVisual.objects.create(
            sesion=sesion,
            estudiante=sesion.estudiante,
            recurso=sesion.recurso,
            fase=sesion.fase,
            ear=ear,
            mar=mar,
            yaw=yaw,
            pitch=pitch,
            roll=roll,
            nivel_atencion=pred["nivel_atencion"],
            score_atencion=pred.get("score"),
            timestamp=timezone.now(),
        )

        return Response(
            {
                "sesion": sesion.id,
                "metricas": resultado,
                "score_atencion": pred.get("score"),
                "estado_atencion": pred["nivel_atencion"],
            },
            status=status.HTTP_200_OK,
        )


class AtencionVisualViewSet(viewsets.ModelViewSet):
    queryset = AtencionVisual.objects.all()
    serializer_class = AtencionVisualSerializer
    permission_classes = [IsAuthenticated]


class NotaAcademicaViewSet(viewsets.ModelViewSet):
    queryset = NotaAcademica.objects.all()
    serializer_class = NotaAcademicaSerializer
    permission_classes = [IsAuthenticated]


# =====================================================
#   ENDPOINTS EXTRA (nota combinada + sesión para mí)
# =====================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def crear_sesion_para_mi(request):
    """
    Crea una sesión SOLO para el estudiante logueado y el recurso indicado.
    (por si el frontend usa /sesiones/crear-para-mi/)
    """
    recurso_id = (
        request.data.get("recurso")
        or request.data.get("recurso_id")
        or request.data.get("id")
    )

    if isinstance(recurso_id, dict):
        recurso_id = (
            recurso_id.get("id") or recurso_id.get("uuid") or recurso_id.get("pk")
        )

    if not recurso_id:
        return Response(
            {"detail": "Debe indicar el recurso."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        recurso = Recurso.objects.select_related(
            "fase", "fase__nivel", "fase__nivel__curso"
        ).get(pk=recurso_id)
    except Recurso.DoesNotExist:
        return Response(
            {"detail": "El recurso indicado no existe."},
            status=status.HTTP_404_NOT_FOUND,
        )

    fase = recurso.fase
    estudiante: Usuario = request.user

    sesion, created = SesionMonitoreo.objects.get_or_create(
        estudiante=estudiante,
        recurso=recurso,
        fase=fase,
    )

    serializer = SesionMonitoreoSerializer(sesion)
    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def obtener_nota_combinada(request):
    """
    Devuelve una nota combinada (nota académica + atención).
    Endpoint: GET /api/nota-combinada/?estudiante=<id>&recurso=<id>
    """
    estudiante_id = request.query_params.get("estudiante")
    recurso_id = request.query_params.get("recurso")

    if not estudiante_id or not recurso_id:
        return Response(
            {"detail": "Se requieren 'estudiante' y 'recurso' como parámetros."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        estudiante = Usuario.objects.get(pk=estudiante_id)
    except Usuario.DoesNotExist:
        return Response(
            {"detail": "El estudiante indicado no existe."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        recurso = Recurso.objects.get(pk=recurso_id)
    except Recurso.DoesNotExist:
        return Response(
            {"detail": "El recurso indicado no existe."},
            status=status.HTTP_404_NOT_FOUND,
        )

    nota_obj = NotaAcademica.objects.filter(
        estudiante=estudiante, recurso=recurso
    ).first()
    nota_academica = nota_obj.nota if nota_obj else None

    score_atencion = (
        SesionMonitoreo.objects.filter(
            estudiante=estudiante, recurso=recurso
        ).aggregate(Avg("score_atencion"))["score_atencion__avg"]
    )

    nota_combinada = None
    if nota_academica is not None and score_atencion is not None:
        nota_combinada = 0.6 * nota_academica + 0.4 * score_atencion

    return Response(
        {
            "estudiante": estudiante.id,
            "recurso": recurso.id,
            "nota_academica": nota_academica,
            "score_atencion": score_atencion,
            "nota_combinada": nota_combinada,
        },
        status=status.HTTP_200_OK,
    )
