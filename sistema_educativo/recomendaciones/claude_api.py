import os
import json
import requests

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")  # Lee desde entorno

def _call_claude(prompt: str):
    if not CLAUDE_API_KEY:
        return None, "CLAUDE_API_KEY no configurada"
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    data = {
        "model": "claude-3-haiku-20240307",
        "max_tokens": 300,
        "messages": [{"role": "user", "content": prompt}]
    }
    try:
        res = requests.post(url, json=data, headers=headers, timeout=30)
        if res.status_code != 200:
            return None, f"HTTP {res.status_code}: {res.text}"
        content = res.json().get("content", [])
        text = content[0].get("text", "").strip() if content else ""
        return text, None
    except Exception as e:
        return None, str(e)

def generar_sugerencia_personalizada(ctx: dict) -> dict:
    """
    ctx esperado:
      {
        estudiante_nombre, especialidad, curso_nombre, nivel_nombre, leccion_nombre,
        recurso_nombre, recurso_tipo, recurso_id,
        score_atencion, patrones (dict), nota_academica, umbral_aprobacion
      }
    """
    atencion = float(ctx.get("score_atencion") or 0)
    nota = float(ctx.get("nota_academica") or 0)
    umbral = float(ctx.get("umbral_aprobacion") or 70)
    patrones = ctx.get("patrones") or {}

    prompt = f"""
Eres un asistente educativo que genera recomendaciones personalizadas, prácticas y aplicables de inmediato para estudiantes universitarios en cursos de Ingeniería de Software, alineadas con ISO 21001:2018. Basándote en los datos proporcionados, sugiere una o dos acciones específicas que el estudiante pueda realizar ahora mismo en la plataforma para mejorar su aprendizaje. Evita términos complejos (por ejemplo, "Pomodoro") que puedan confundir y explica cualquier técnica en una frase simple. Las recomendaciones deben ser claras, motivadoras y vinculadas a recursos específicos de la plataforma (videos, quizzes, PDFs, talleres, laboratorios). Enfócate en el área débil del estudiante: baja atención (<50%), bajo rendimiento académico (<{umbral}%) o ambos.

Datos del Estudiante:
- Nombre: {ctx.get("estudiante_nombre")}
- Especialidad: {ctx.get("especialidad", "Ingeniería de Software")}
- Curso: {ctx.get("curso_nombre")}
- Nivel: {ctx.get("nivel_nombre")}
- Lección: {ctx.get("leccion_nombre")}
- Recurso: {ctx.get("recurso_nombre")} (Tipo: {ctx.get("recurso_tipo")}, ID: {ctx.get("recurso_id")})
- Score de Atención: {atencion}% (Patrones: {json.dumps(patrones, ensure_ascii=False)})
- Nota Académica: {nota}%
- Umbral de Aprobación: {umbral}%

Instrucciones:
1. Si el score de atención es <50%, sugiere una técnica sencilla para mejorar la concentración (ej.: estudiar en bloques cortos, eliminar distracciones) y explica cómo aplicarla en una frase.
2. Si la nota académica es <{umbral}%, recomienda un recurso específico de la plataforma (por nombre y tipo) indicando qué hacer con él.
3. Si ambos son bajos, combina una técnica de concentración y un recurso específico.
4. Usa un tono motivador, claro y profesional, sin jerga técnica.
5. Responde SOLO en JSON con el siguiente formato exacto:

{{
  "acciones": [
    {{
      "tipo": "tecnica" | "contenido",
      "descripcion": "texto breve y claro",
      "recurso": {{
        "id": "{ctx.get("recurso_id")}",
        "nombre": "{ctx.get("recurso_nombre")}",
        "tipo": "{ctx.get("recurso_tipo")}"
      }}
    }}
  ],
  "mensaje": "máximo 2 frases, motivador y específico"
}}
    """.strip()

    text, err = _call_claude(prompt)
    if err or not text:
        return _fallback_personalizado(ctx)

    try:
        data = json.loads(text)
        # sanea estructura mínima
        if not isinstance(data.get("acciones"), list) or "mensaje" not in data:
            raise ValueError("Estructura inválida")
        return data
    except Exception:
        return _fallback_personalizado(ctx)

def _fallback_personalizado(ctx: dict) -> dict:
    atencion = float(ctx.get("score_atencion") or 0)
    nota = float(ctx.get("nota_academica") or 0)
    umbral = float(ctx.get("umbral_aprobacion") or 70)
    recurso = {
        "id": ctx.get("recurso_id"),
        "nombre": ctx.get("recurso_nombre"),
        "tipo": ctx.get("recurso_tipo"),
    }
    acciones = []
    if atencion < 50:
        acciones.append({
            "tipo": "tecnica",
            "descripcion": "Estudia 10 minutos sin distracciones (silencia notificaciones) y repasa solo este recurso.",
            "recurso": recurso,
        })
    if nota < umbral:
        acciones.append({
            "tipo": "contenido",
            "descripcion": "Abre el recurso indicado y completa la actividad propuesta.",
            "recurso": recurso,
        })
    if not acciones:
        acciones.append({
            "tipo": "contenido",
            "descripcion": "Continúa con el recurso indicado y verifica tu comprensión con las preguntas guía.",
            "recurso": recurso,
        })
    mensaje = "Buen trabajo, sigue así." if atencion >= 50 and nota >= umbral else \
              "Puedes mejorar con estos pasos concretos. Estoy para ayudarte."
    return {"acciones": acciones[:2], "mensaje": mensaje}