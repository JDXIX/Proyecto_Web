from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from usuarios.models import Usuario
from cursos.models import Fase, Recurso, Curso, Nivel
from uuid import uuid4
from django.utils import timezone

class RecomendacionIA(models.Model):
    """
    Representa una recomendación generada por IA para un estudiante en una fase específica.
    Incluye acciones, mensaje y estado de aprobación.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    estudiante = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'estudiante'},
        related_name='recomendaciones'
    )
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE)
    acciones = models.JSONField(
        help_text="Datos JSON con acciones recomendadas (e.g., {'tarea': 'revisar', 'duracion': 30})"
    )
    mensaje = models.TextField()
    estado = models.CharField(
        max_length=20,
        choices=[('pendiente', 'Pendiente'), ('aprobada', 'Aprobada'), ('descartada', 'Descartada')],
        default='pendiente'
    )
    docente_aprobo = models.BooleanField(default=False)
    creado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recomendaciones_creadas'
    )
    modificado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recomendaciones_modificadas'
    )
    fecha = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Devuelve una representación legible de la recomendación."""
        return f"Recomendación para {self.estudiante.username} - {self.fase.nombre} ({self.estado})"

    class Meta:
        verbose_name = "Recomendación IA"
        verbose_name_plural = "Recomendaciones IA"

class HistorialEstudiante(models.Model):
    """
    Registra el historial académico y de atención de un estudiante por fase.
    Incluye puntajes y relación con recomendaciones.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    estudiante = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'estudiante'},
        related_name='historial'
    )
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    nivel = models.ForeignKey(Nivel, on_delete=models.CASCADE)
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE)
    recurso = models.ForeignKey(
        Recurso,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Recurso asociado (opcional, derivable de fase)"
    )
    score_atencion = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Puntuación de atención en porcentaje (0-100)"
    )
    nota_academica = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Nota académica en porcentaje (0-100)"
    )
    recomendacion = models.ForeignKey(
        RecomendacionIA,
        on_delete=models.SET_NULL,
        null=True,
        related_name='historiales'
    )
    estado = models.CharField(
        max_length=20,
        choices=[('Listo', 'Listo'), ('Observacion', 'Observación'), ('Refuerzo', 'Refuerzo')],
        default='Observacion'
    )
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Devuelve una representación legible del historial."""
        return f"Historial de {self.estudiante.username} - {self.curso.nombre} (Fase: {self.fase.nombre})"

    def clean(self):
        """Valida que los puntajes estén en rango si están definidos."""
        if self.score_atencion and (self.score_atencion < 0 or self.score_atencion > 100):
            raise ValidationError("El score_atencion debe estar entre 0 y 100.")
        if self.nota_academica and (self.nota_academica < 0 or self.nota_academica > 100):
            raise ValidationError("La nota_academica debe estar entre 0 y 100.")

    class Meta:
        verbose_name = "Historial Estudiante"
        verbose_name_plural = "Historiales Estudiantes"
        unique_together = ('estudiante', 'fase')  # Evita duplicados por estudiante y fase