from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import RecomendacionIA, HistorialEstudiante
from .serializers import RecomendacionIASerializer, HistorialEstudianteSerializer

# --- Claude API integración (mock, reemplaza por tu llamada real) ---
def generar_sugerencia_claude(atencion, nota, fase_nombre):
    # Aquí deberías llamar a la API real de Claude
    # Este es un ejemplo simulado
    if atencion < 50:
        return {
            "acciones": {"tarea": "revisar", "duracion": 30},
            "mensaje": f"Tu atención fue baja en {fase_nombre}. Revisa el material y realiza ejercicios extra."
        }
    else:
        return {
            "acciones": {"tarea": "continuar"},
            "mensaje": f"Buen trabajo en {fase_nombre}. Continúa con la siguiente fase."
        }

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
    from usuarios.models import Usuario
    from cursos.models import Fase
    estudiante = Usuario.objects.get(id=estudiante_id)
    fase = Fase.objects.get(id=fase_id)
    sugerencia = generar_sugerencia_claude(atencion, nota, fase.nombre)
    rec = RecomendacionIA.objects.create(
        estudiante=estudiante,
        fase=fase,
        acciones=sugerencia["acciones"],
        mensaje=sugerencia["mensaje"],
        estado="pendiente"
    )
    return Response(RecomendacionIASerializer(rec).data)