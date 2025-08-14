from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SesionMonitoreoViewSet,
    AtencionVisualViewSet,
    NotaAcademicaViewSet,
    crear_sesiones_monitoreo,
    obtener_nota_combinada,
    crear_sesion_para_mi,
)

router = DefaultRouter()
router.register(r'sesiones', SesionMonitoreoViewSet)
router.register(r'atencion-visual', AtencionVisualViewSet)
router.register(r'notas-academicas', NotaAcademicaViewSet)

urlpatterns = [
    # RUTAS PERSONALIZADAS PRIMERO
    path('sesiones/crear-multiples/', crear_sesiones_monitoreo, name='crear_sesiones_monitoreo'),
    path('sesiones/crear-para-mi/', crear_sesion_para_mi, name='crear_sesion_para_mi'),
    path('nota-combinada/', obtener_nota_combinada, name='nota_combinada'),
    # LUEGO EL ROUTER
    path('', include(router.urls)),
]