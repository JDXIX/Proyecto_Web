from rest_framework import serializers
from .models import Curso, Nivel, Fase, Recurso, Inscripcion

class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = '__all__'

class NivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nivel
        fields = '__all__'

class FaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fase
        fields = '__all__'

class RecursoSerializer(serializers.ModelSerializer):
    archivo_url = serializers.SerializerMethodField()
    nivel_nombre = serializers.SerializerMethodField()
    leccion_nombre = serializers.SerializerMethodField()

    def get_archivo_url(self, obj):
        request = self.context.get("request")
        if obj.archivo and hasattr(obj.archivo, "url"):
            url = obj.archivo.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_nivel_nombre(self, obj):
        try:
            return obj.fase.nivel.nombre
        except Exception:
            return ""
    def get_leccion_nombre(self, obj):
        try:
            return obj.fase.nombre
        except Exception:
            return ""

    class Meta:
        model = Recurso
        fields = '__all__'
        extra_fields = ['archivo_url', 'nivel_nombre', 'leccion_nombre']
        
class InscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscripcion
        fields = '__all__'