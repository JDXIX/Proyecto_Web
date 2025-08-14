from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SesionMonitoreoViewSet,
    AtencionVisualViewSet,
    NotaAcademicaViewSet,
    crear_sesiones_monitoreo,
    obtener_nota_combinada,  # <-- Importa la vista para nota combinada
)

router = DefaultRouter()
router.register(r'sesiones', SesionMonitoreoViewSet)
router.register(r'atencion-visual', AtencionVisualViewSet)
router.register(r'notas-academicas', NotaAcademicaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('sesiones/crear-multiples/', crear_sesiones_monitoreo, name='crear_sesiones_monitoreo'),
    path('nota-combinada/', obtener_nota_combinada, name='nota_combinada'),  # <-- Nueva ruta
]