from django.db import models
from usuarios.models import Usuario
from cursos.models import Fase, Recurso
from uuid import uuid4

class RecomendacionIA(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'rol': 'estudiante'}, related_name='recomendaciones')
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE)
    acciones = models.JSONField()
    mensaje = models.TextField()
    estado = models.CharField(max_length=20, choices=[('pendiente', 'Pendiente'), ('aprobada', 'Aprobada'), ('descartada', 'Descartada')])
    docente_aprobo = models.BooleanField(default=False)
    creado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='recomendaciones_creadas')
    modificado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='recomendaciones_modificadas')
    fecha = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

class HistorialEstudiante(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'rol': 'estudiante'}, related_name='historial')
    curso = models.ForeignKey('cursos.Curso', on_delete=models.CASCADE)
    nivel = models.ForeignKey('cursos.Nivel', on_delete=models.CASCADE)
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE)
    recurso = models.ForeignKey(Recurso, on_delete=models.CASCADE, null=True)
    score_atencion = models.FloatField(null=True)
    nota_academica = models.FloatField(null=True)
    recomendacion = models.ForeignKey(RecomendacionIA, on_delete=models.SET_NULL, null=True, related_name='historiales')
    estado = models.CharField(max_length=20, choices=[('Listo', 'Listo'), ('Observacion', 'Observación'), ('Refuerzo', 'Refuerzo')])
    fecha = models.DateTimeField(auto_now_add=True)