from rest_framework import serializers
from .models import SesionMonitoreo, AtencionVisual

class SesionMonitoreoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SesionMonitoreo
        fields = '__all__'

class AtencionVisualSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtencionVisual
        fields = '__all__'