from rest_framework import viewsets, permissions
from .models import RecomendacionIA, HistorialEstudiante
from .serializers import RecomendacionIASerializer, HistorialEstudianteSerializer

class RecomendacionIAViewSet(viewsets.ModelViewSet):
    queryset = RecomendacionIA.objects.all()
    serializer_class = RecomendacionIASerializer
    permission_classes = [permissions.IsAuthenticated]

class HistorialEstudianteViewSet(viewsets.ModelViewSet):
    queryset = HistorialEstudiante.objects.all()
    serializer_class = HistorialEstudianteSerializer
    permission_classes = [permissions.IsAuthenticated]