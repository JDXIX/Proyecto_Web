from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecomendacionIAViewSet, HistorialEstudianteViewSet, generar_recomendacion_ia

router = DefaultRouter()
router.register(r'recomendaciones', RecomendacionIAViewSet)
router.register(r'historial-estudiantes', HistorialEstudianteViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('recomendaciones/generar/', generar_recomendacion_ia, name='generar_recomendacion_ia'),
]