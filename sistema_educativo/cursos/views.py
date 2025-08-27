from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .models import Curso, Nivel, Fase, Recurso, Inscripcion
from .serializers import CursoSerializer, NivelSerializer, FaseSerializer, RecursoSerializer, InscripcionSerializer
from usuarios.models import Usuario
import csv


class CursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Solo mostrar cursos en los que el estudiante está inscrito
        if hasattr(user, "rol") and user.rol == "estudiante":
            return Curso.objects.filter(inscripcion__estudiante=user).distinct()
        return super().get_queryset()

    @action(detail=False, methods=["get"], url_path="docente", permission_classes=[permissions.IsAuthenticated])
    def cursos_docente(self, request):
        """
        Retorna los cursos asignados al docente autenticado.
        """
        usuario = request.user
        cursos = Curso.objects.filter(docente=usuario)
        serializer = self.get_serializer(cursos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="estudiantes", permission_classes=[permissions.IsAuthenticated])
    def estudiantes(self, request, pk=None):
        """
        Retorna los estudiantes inscritos en el curso.
        """
        curso = self.get_object()
        inscripciones = Inscripcion.objects.filter(curso=curso)
        data = [
            {
                "id": insc.estudiante.id,
                "nombre": (
                    (insc.estudiante.first_name or "") + " " + (insc.estudiante.last_name or "")
                ).strip() or insc.estudiante.username,
                "email": insc.estudiante.email,
                "progreso": getattr(insc, "progreso", 0),  # Ajusta según tu modelo
                "estado": getattr(insc, "estado", "Listo"), # Ajusta según tu modelo
            }
            for insc in inscripciones
        ]
        return Response(data)

class NivelViewSet(viewsets.ModelViewSet):
    queryset = Nivel.objects.all()
    serializer_class = NivelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        curso_id = self.request.query_params.get("curso")
        if curso_id:
            queryset = queryset.filter(curso_id=curso_id)
        return queryset

class FaseViewSet(viewsets.ModelViewSet):
    queryset = Fase.objects.all().order_by('nivel', 'orden')
    serializer_class = FaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        nivel_id = self.request.query_params.get("nivel")
        if nivel_id:
            queryset = queryset.filter(nivel_id=nivel_id)
        return queryset.order_by('orden')

class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.all()
    serializer_class = RecursoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        fase_id = self.request.query_params.get("fase")
        if fase_id:
            queryset = queryset.filter(fase_id=fase_id)
        return queryset

class InscripcionViewSet(viewsets.ModelViewSet):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser])
    def cargar_csv(self, request):
        """
        Endpoint para inscripción masiva de estudiantes a cursos mediante archivo CSV.
        El CSV debe tener columnas: email,curso_id
        """
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No se envió archivo"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            decoded_file = file_obj.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded_file)
        except Exception as e:
            return Response({"error": f"Error al leer el archivo: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        resultados = []
        for row in reader:
            email = row.get('email')
            curso_id = row.get('curso_id')
            if not email or not curso_id:
                resultados.append({"email": email, "curso_id": curso_id, "status": "Faltan datos"})
                continue
            try:
                usuario = Usuario.objects.get(email=email)
                curso = Curso.objects.get(id=curso_id)
                insc, created = Inscripcion.objects.get_or_create(estudiante=usuario, curso=curso)
                resultados.append({
                    "email": email,
                    "curso_id": curso_id,
                    "status": "inscrito" if created else "ya inscrito"
                })
            except Usuario.DoesNotExist:
                resultados.append({"email": email, "curso_id": curso_id, "status": "Usuario no encontrado"})
            except Curso.DoesNotExist:
                resultados.append({"email": email, "curso_id": curso_id, "status": "Curso no encontrado"})
            except Exception as e:
                resultados.append({"email": email, "curso_id": curso_id, "status": f"Error: {str(e)}"})
        return Response(resultados, status=status.HTTP_200_OK)