from rest_framework import serializers
from .models import Usuario, PerfilUsuario
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['rol'] = user.rol
        return token

    def validate(self, attrs):
        User = get_user_model()
        username_or_email = attrs.get("username")
        password = attrs.get("password")
        try:
            user = User.objects.get(email=username_or_email)
            attrs["username"] = user.username
        except User.DoesNotExist:
            pass  # Intenta con username normal
        return super().validate(attrs)
    
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = '__all__'