from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from usuarios.views import UsuarioViewSet, PerfilUsuarioViewSet, CustomTokenObtainPairView
from cursos.views import CursoViewSet, NivelViewSet, FaseViewSet, RecursoViewSet, InscripcionViewSet
from atencion.views import SesionMonitoreoViewSet, AtencionVisualViewSet
from recomendaciones.views import RecomendacionIAViewSet, HistorialEstudianteViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static


router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'perfil-usuarios', PerfilUsuarioViewSet)
router.register(r'cursos', CursoViewSet)
router.register(r'niveles', NivelViewSet)
router.register(r'fases', FaseViewSet)
router.register(r'recursos', RecursoViewSet)
router.register(r'inscripciones', InscripcionViewSet)
router.register(r'sesiones', SesionMonitoreoViewSet)
router.register(r'atencion-visual', AtencionVisualViewSet)
router.register(r'recomendaciones', RecomendacionIAViewSet)
router.register(r'historial-estudiantes', HistorialEstudianteViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)