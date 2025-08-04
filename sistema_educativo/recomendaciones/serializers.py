from rest_framework import serializers
from .models import RecomendacionIA, HistorialEstudiante

class RecomendacionIASerializer(serializers.ModelSerializer):
    class Meta:
        model = RecomendacionIA
        fields = '__all__'

class HistorialEstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialEstudiante
        fields = '__all__'