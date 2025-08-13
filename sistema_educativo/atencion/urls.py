from django.urls import path
from .views import crear_sesiones_monitoreo

urlpatterns = [
    path('sesiones/crear-multiples/', crear_sesiones_monitoreo, name='crear_sesiones_monitoreo'),
]