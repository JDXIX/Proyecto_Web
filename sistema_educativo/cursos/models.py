from django.core.validators import FileExtensionValidator
from django.db import models
from usuarios.models import Usuario
from uuid import uuid4

class Curso(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    docente = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'rol': 'docente'}, related_name='cursos_docente')
    umbral_nota = models.FloatField(default=70.0)
    creado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='cursos_creados')
    modificado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='cursos_modificados')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

class Inscripcion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'rol': 'estudiante'}, related_name='inscripciones')
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

class Nivel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    orden = models.IntegerField()
    creado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='niveles_creados')
    modificado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='niveles_modificados')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

class Fase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    nivel = models.ForeignKey(Nivel, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    creado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='fases_creadas')
    modificado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='fases_modificadas')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

class Recurso(models.Model):
    TIPO = [('video', 'Video'), ('quiz', 'Quiz'), ('pdf', 'PDF'), ('simulador', 'Simulador'), ('archivo', 'Archivo')]
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO)
    archivo = models.FileField(upload_to='recursos/', validators=[FileExtensionValidator(allowed_extensions=['mp4', 'webm', 'pdf', 'docx', 'jpg', 'png'])])
    permite_monitoreo = models.BooleanField(default=True)
    es_evaluable = models.BooleanField(default=False)
    nota_maxima = models.FloatField(default=100.0)
    creado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='recursos_creados')
    modificado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='recursos_modificados')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)