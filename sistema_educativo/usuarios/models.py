from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from uuid import uuid4

class Usuario(AbstractUser):
    """
    Modelo de usuario personalizado que extiende AbstractUser con un ID UUID y rol.
    Usado como AUTH_USER_MODEL en el sistema.
    """
    ROLES = [('admin', 'Administrador'), ('docente', 'Docente'), ('estudiante', 'Estudiante')]
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    rol = models.CharField(
        max_length=20,
        choices=ROLES,
        default='estudiante',
        help_text="Rol del usuario en el sistema"
    )
    email = models.EmailField(
        unique=True,
        blank=False,  # Obligatorio
        help_text="Correo electrónico único del usuario"
    )
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='usuarios_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='usuarios_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    def __str__(self):
        """Devuelve el nombre completo o username si no hay nombres."""
        if self.first_name or self.last_name:
            return f"{self.first_name} {self.last_name} ({self.username})"
        return self.username

    def clean(self):
        """Valida que email no esté vacío."""
        if not self.email:
            raise ValidationError("El correo electrónico es obligatorio.")

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

class PerfilUsuario(models.Model):
    """
    Almacena datos adicionales de un usuario en una relación uno a uno.
    """
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        primary_key=True
    )
    matricula = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        help_text="Número de matrícula del estudiante (opcional)"
    )
    especialidad = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Especialidad del usuario (opcional)"
    )

    def __str__(self):
        """Devuelve una representación legible del perfil."""
        return f"Perfil de {self.usuario.username}"

    class Meta:
        verbose_name = "Perfil Usuario"
        verbose_name_plural = "Perfiles Usuarios"