from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SesionMonitoreoViewSet,
    AtencionVisualViewSet,
    NotaAcademicaViewSet,
    crear_sesion_para_mi,
    obtener_nota_combinada,
)

router = DefaultRouter()
router.register(r'sesiones', SesionMonitoreoViewSet, basename='sesion-monitoreo')
router.register(r'atencion-visual', AtencionVisualViewSet, basename='atencion-visual')
router.register(r'notas-academicas', NotaAcademicaViewSet, basename='nota-academica')

urlpatterns = [
    # Solo dejamos estos extras; "crear-multiples" lo maneja el @action del ViewSet
    path('sesiones/crear-para-mi/', crear_sesion_para_mi, name='crear_sesion_para_mi'),
    path('nota-combinada/', obtener_nota_combinada, name='nota_combinada'),
    path('', include(router.urls)),
]
