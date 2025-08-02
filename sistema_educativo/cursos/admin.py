from django.contrib import admin
from .models import Curso, Inscripcion, Nivel, Fase, Recurso

admin.site.register(Curso)
admin.site.register(Inscripcion)
admin.site.register(Nivel)
admin.site.register(Fase)
admin.site.register(Recurso)