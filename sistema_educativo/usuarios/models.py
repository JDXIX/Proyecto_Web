from django.contrib.auth.models import AbstractUser
from django.db import models
from uuid import uuid4

class Usuario(AbstractUser):
    ROLES = [('admin', 'Administrador'), ('docente', 'Docente'), ('estudiante', 'Estudiante')]
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    rol = models.CharField(max_length=20, choices=ROLES, default='estudiante')
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='usuarios_groups',  # Nombre único
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='usuarios_user_permissions',  # Nombre único
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

class PerfilUsuario(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    matricula = models.CharField(max_length=20, null=True, blank=True)
    especialidad = models.CharField(max_length=100, null=True, blank=True)