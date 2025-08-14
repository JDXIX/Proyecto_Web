from django.db import models
from django.core.validators import FileExtensionValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from usuarios.models import Usuario
from uuid import uuid4
from django.utils import timezone

class Curso(models.Model):
    """
    Representa un curso con detalles como nombre, descripción y docente.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField()
    docente = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'docente'},
        related_name='cursos_docente'
    )
    umbral_nota = models.FloatField(
        default=70.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Umbral de aprobación en porcentaje (0-100)"
    )
    creado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='cursos_creados'
    )
    modificado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='cursos_modificados'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Devuelve el nombre del curso."""
        return self.nombre

    class Meta:
        verbose_name = "Curso"
        verbose_name_plural = "Cursos"

class Inscripcion(models.Model):
    """
    Registra la inscripción de un estudiante a un curso.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    estudiante = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'estudiante'},
        related_name='inscripciones'
    )
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Devuelve una representación de la inscripción."""
        return f"Inscripción de {self.estudiante.username} a {self.curso.nombre}"

    class Meta:
        verbose_name = "Inscripción"
        verbose_name_plural = "Inscripciones"
        unique_together = ('estudiante', 'curso')  # Evita duplicados

class Nivel(models.Model):
    """
    Define un nivel dentro de un curso con un orden específico.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    orden = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Orden del nivel dentro del curso (mínimo 1)"
    )
    creado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='niveles_creados'
    )
    modificado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='niveles_modificados'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Devuelve el nombre del nivel con el curso."""
        return f"{self.nombre} (Curso: {self.curso.nombre})"

    class Meta:
        verbose_name = "Nivel"
        verbose_name_plural = "Niveles"
        unique_together = ('curso', 'orden')  # Evita órdenes duplicados por curso

class Fase(models.Model):
    """
    Representa una fase dentro de un nivel.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    nivel = models.ForeignKey(Nivel, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    creado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='fases_creadas'
    )
    modificado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='fases_modificadas'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Devuelve el nombre de la fase con el nivel."""
        return f"{self.nombre} (Nivel: {self.nivel.nombre})"

    class Meta:
        verbose_name = "Fase"
        verbose_name_plural = "Fases"
        unique_together = ('nivel', 'nombre')  # Evita nombres duplicados por nivel

# ...existing code...

class Recurso(models.Model):
    """
    Almacena recursos (videos, quizzes, PDFs, etc.) asociados a una fase.
    """
    TIPO = [('video', 'Video'), ('quiz', 'Quiz'), ('pdf', 'PDF'), ('simulador', 'Simulador'), ('archivo', 'Archivo')]
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO)
    archivo = models.FileField(
        upload_to='recursos/',
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'webm', 'pdf', 'docx', 'jpg', 'png'])],
        help_text="Tamaño máximo: 50MB",
        max_length=255  # Limita el nombre del archivo
    )
    permite_monitoreo = models.BooleanField(default=True)
    es_evaluable = models.BooleanField(default=False)
    # NUEVO CAMPO: duración en segundos (obligatorio para recursos evaluables)
    duracion = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Duración del recurso en segundos (obligatorio para recursos evaluables y monitoreables)"
    )
    nota_maxima = models.FloatField(
        default=100.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Nota máxima en porcentaje (0-100)"
    )
    creado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recursos_creados'
    )
    modificado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recursos_modificados'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Devuelve el nombre del recurso con su tipo."""
        return f"{self.nombre} ({self.get_tipo_display()})"

    def clean(self):
        """Valida que el archivo no sea demasiado grande (50MB) y que la duración sea obligatoria si corresponde."""
        if self.archivo and self.archivo.size > 50 * 1024 * 1024:  # 50MB en bytes
            raise ValidationError("El archivo no debe exceder 50MB.")
        # Validar duración obligatoria para recursos evaluables y monitoreables
        if self.es_evaluable and self.permite_monitoreo and not self.duracion:
            raise ValidationError("Debe especificar la duración para recursos evaluables y monitoreables.")

    class Meta:
        verbose_name = "Recurso"
        verbose_name_plural = "Recursos"

