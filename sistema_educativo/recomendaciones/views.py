from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import RecomendacionIA, HistorialEstudiante
from .serializers import RecomendacionIASerializer, HistorialEstudianteSerializer

from usuarios.models import Usuario
from cursos.models import Fase, Curso, Nivel, Recurso
from .claude_api import generar_sugerencia_personalizada

class RecomendacionIAViewSet(viewsets.ModelViewSet):
    queryset = RecomendacionIA.objects.all()
    serializer_class = RecomendacionIASerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        rec = self.get_object()
        rec.estado = "aprobada"
        rec.docente_aprobo = True
        rec.save()
        return Response({"status": "aprobada"})

    @action(detail=True, methods=['post'])
    def descartar(self, request, pk=None):
        rec = self.get_object()
        rec.estado = "descartada"
        rec.save()
        return Response({"status": "descartada"})

    @action(detail=True, methods=['post'])
    def editar(self, request, pk=None):
        rec = self.get_object()
        mensaje = request.data.get("mensaje")
        acciones = request.data.get("acciones")
        if mensaje:
            rec.mensaje = mensaje
        if acciones:
            rec.acciones = acciones
        rec.save()
        return Response({"status": "editada"})

class HistorialEstudianteViewSet(viewsets.ModelViewSet):
    queryset = HistorialEstudiante.objects.all()
    serializer_class = HistorialEstudianteSerializer
    permission_classes = [permissions.IsAuthenticated]

# Endpoint para generar recomendación IA (Claude)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generar_recomendacion_ia(request):
    estudiante_id = request.data.get("estudiante")
    fase_id = request.data.get("fase")
    atencion = float(request.data.get("atencion", 0))
    nota = float(request.data.get("nota", 0))
    if not estudiante_id or not fase_id:
        return Response({"error": "Faltan datos"}, status=400)
    try:
        estudiante = Usuario.objects.get(id=estudiante_id)
        fase = Fase.objects.get(id=fase_id)
        nivel = fase.nivel
        curso = nivel.curso

        # Busca el recurso principal de la fase (opcional: puedes ajustar la lógica)
        recurso = Recurso.objects.filter(fase=fase).first()

        ctx = {
            "estudiante_nombre": f"{estudiante.first_name} {estudiante.last_name}".strip() or estudiante.username,
            "especialidad": getattr(estudiante, "especialidad", "Ingeniería de Software"),
            "curso_nombre": curso.nombre,
            "nivel_nombre": nivel.nombre,
            "leccion_nombre": fase.nombre,
            "recurso_nombre": recurso.nombre if recurso else "",
            "recurso_tipo": recurso.tipo if recurso else "",
            "recurso_id": str(recurso.id) if recurso else "",
            "score_atencion": atencion,
            "patrones": {},  # Puedes incluir patrones si los tienes
            "nota_academica": nota,
            "umbral_aprobacion": curso.umbral_nota,
        }
        sugerencia = generar_sugerencia_personalizada(ctx)
        rec = RecomendacionIA.objects.create(
            estudiante=estudiante,
            fase=fase,
            acciones=sugerencia.get("acciones"),
            mensaje=sugerencia.get("mensaje"),
            estado="pendiente"
        )
        # Guardar en historial
        HistorialEstudiante.objects.create(
            estudiante=estudiante,
            curso=curso,
            nivel=nivel,
            fase=fase,
            actividad=recurso,
            score_atencion=atencion,
            nota_academica=nota,
            recomendacion=rec,
            estado="pendiente"
        )
        return Response(RecomendacionIASerializer(rec).data)
    except Usuario.DoesNotExist:
        return Response({"error": "Estudiante no encontrado"}, status=404)
    except Fase.DoesNotExist:
        return Response({"error": "Fase no encontrada"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)