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
            pass
        return super().validate(attrs)

class UsuarioSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get('request')
        if request and not request.user.is_authenticated:
            validated_data['rol'] = 'estudiante'
        first = validated_data.get('first_name', '').strip().lower().replace(' ', '_')
        last = validated_data.get('last_name', '').strip().lower().replace(' ', '_')
        rol = validated_data.get('rol', '').strip().lower()
        base_username = f"{first}_{last}_{rol}"
        username = base_username
        from .models import Usuario
        counter = 1
        while Usuario.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        validated_data['username'] = username

        # --- Aquí el cambio importante ---
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.set_password(password)  # Encripta la contraseña
        usuario.save()
        return usuario

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = '__all__'