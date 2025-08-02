from django.db import models
from usuarios.models import Usuario
from cursos.models import Recurso, Fase
from uuid import uuid4

class SesionMonitoreo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'rol': 'estudiante'}, related_name='sesiones_monitoreo')
    recurso = models.ForeignKey(Recurso, on_delete=models.CASCADE)
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE)
    inicio = models.DateTimeField(auto_now_add=True)
    fin = models.DateTimeField(null=True)
    duracion = models.DurationField(null=True)
    score_atencion = models.FloatField(null=True)
    patrones = models.JSONField(null=True)

class AtencionVisual(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'rol': 'estudiante'}, related_name='atenciones_visuales')
    sesion = models.ForeignKey(SesionMonitoreo, on_delete=models.CASCADE)
    recurso = models.ForeignKey(Recurso, on_delete=models.CASCADE)
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE)
    score_atencion = models.FloatField()
    patrones = models.JSONField()
    fecha = models.DateTimeField(auto_now_add=True)