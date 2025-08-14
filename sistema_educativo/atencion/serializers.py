from rest_framework import serializers
from .models import SesionMonitoreo, AtencionVisual, NotaAcademica

class SesionMonitoreoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SesionMonitoreo
        fields = '__all__'

class AtencionVisualSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtencionVisual
        fields = '__all__'

class NotaAcademicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotaAcademica
        fields = '__all__'