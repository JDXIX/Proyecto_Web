from django.db import models
from usuarios.models import Usuario
from cursos.models import Recurso, Fase
from uuid import uuid4
from django.core.exceptions import ValidationError
from django.utils import timezone

class SesionMonitoreo(models.Model):
    """
    Registra una sesión de monitoreo asociada a un estudiante, recurso y fase.
    Campos como fin y duracion se calculan o completan al cerrar la sesión.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    estudiante = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'estudiante'},
        related_name='sesiones_monitoreo'
    )
    recurso = models.ForeignKey(Recurso, on_delete=models.CASCADE)
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE)
    inicio = models.DateTimeField(auto_now_add=True)
    fin = models.DateTimeField(null=True, blank=True)
    duracion = models.DurationField(null=True, blank=True)
    score_atencion = models.FloatField(
        null=True,
        blank=True,
        help_text="Puntuación de atención entre 0 y 100"
    )
    patrones = models.JSONField(
        null=True,
        blank=True,
        help_text="Datos JSON con patrones de atención (e.g., {'desviacion_gaze': 0.4, 'cierre_ojos': 0.3, ...})"
    )

    def __str__(self):
        return f"Sesión de {self.estudiante.username} - {self.recurso.nombre} (Fase: {self.fase.nombre})"

    def clean(self):
        if self.fin and self.fin < self.inicio:
            raise ValidationError("La fecha de fin no puede ser anterior a la de inicio.")
        if self.duracion and self.duracion < timezone.timedelta(0):
            raise ValidationError("La duración no puede ser negativa.")

    def save(self, *args, **kwargs):
        if self.fin and not self.duracion:
            self.duracion = self.fin - self.inicio
        super().save(*args, **kwargs)

class AtencionVisual(models.Model):
    """
    Registra datos visuales de atención para una sesión de monitoreo.
    Incluye score global y patrones detallados.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    sesion = models.ForeignKey(SesionMonitoreo, on_delete=models.CASCADE, null=True, blank=True)
    estudiante = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'estudiante'},
        related_name='atenciones_visuales',
        null=True, blank=True
    )
    recurso = models.ForeignKey(Recurso, on_delete=models.CASCADE, null=True, blank=True)
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, blank=True)
    score_atencion = models.FloatField(
        help_text="Puntaje global de atención (0-100)",
        null=True, blank=True
    )
    patrones = models.JSONField(
        help_text="Patrones detectados: {'desviacion_gaze': 0.4, 'cierre_ojos': 0.3, ...}",
        null=True, blank=True
    )
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Atención Visual de {self.estudiante.username if self.estudiante else 'N/A'} - Sesión {self.sesion.id if self.sesion else 'N/A'}"

    def clean(self):
        if self.score_atencion is not None and (self.score_atencion < 0 or self.score_atencion > 100):
            raise ValidationError("El score de atención debe estar entre 0 y 100.")

    class Meta:
        verbose_name = "Atención Visual"