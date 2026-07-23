# Formularios de privacidad de datos — Google Play y Apple

Respuestas listas para completar cuando tengas las cuentas de desarrollador. Basado en
la auditoría real del código (`lib/supabase.ts`, `lib/syncProgress.ts`, `lib/notifications.ts`,
`store/`, `package.json`) — no son suposiciones genéricas.

Resumen de lo que la app recolecta de verdad:
- **Nombre y email** (al registrarte)
- **Progreso de aprendizaje**: lecciones completadas, XP, nivel, racha, corazones, idioma
- **Nada más**: sin ubicación, sin contactos, sin fotos/cámara, sin identificadores publicitarios,
  sin analítica, sin crash reporting, sin publicidad, sin compras dentro de la app
- Único proveedor externo: **Supabase** (base de datos + autenticación) — actúa como
  procesador de datos en tu nombre, no como "tercero" al que le compartís datos con fines
  propios (esto importa para cómo se responde cada formulario, ver abajo)

---

## Google Play — Data Safety (Seguridad de los datos)

Ruta en Play Console: **Política y programas → Seguridad de los datos**

### ¿Tu app recopila o comparte alguno de los tipos de datos de usuario requeridos?
**Sí**

### Tipos de datos

**Información personal**
| Dato | ¿Se recolecta? | ¿Se comparte con terceros? | ¿Es opcional? | Uso |
|---|---|---|---|---|
| Nombre | Sí | No | No (obligatorio para crear cuenta) | Funcionalidad de la app |
| Dirección de email | Sí | No | No (obligatorio para crear cuenta) | Funcionalidad de la app, Comunicaciones (recordatorios) |

**Actividad en la app**
| Dato | ¿Se recolecta? | ¿Se comparte? | ¿Opcional? | Uso |
|---|---|---|---|---|
| Otras acciones del usuario (progreso: lecciones, XP, racha, corazones) | Sí | No | No | Funcionalidad de la app |

**Todo lo demás** (ubicación, información financiera, fotos/videos, audio, contactos, calendario,
historial de navegación web, identificadores de dispositivo, información de salud/fitness,
mensajes): **No se recolecta**.

**Registros de fallas / diagnóstico de la app**: **No se recolecta** (no hay ningún SDK de
crash reporting como Sentry/Crashlytics).

### Prácticas de seguridad de datos
- **¿Los datos se cifran en tránsito?** Sí (HTTPS/TLS, Supabase)
- **¿Podés solicitar que se borren tus datos?** Sí — la política de privacidad explica cómo
  (contacto a obol.finance2026@gmail.com)
- **¿Los datos se envían fuera de la app de alguna otra forma que no sea la necesaria para
  que funcione?** No

### ¿Comparte tu app datos de usuario con terceros?
**No.** Supabase aloja la base de datos y gestiona la autenticación en tu nombre (como
procesador de datos, con un contrato de procesamiento estándar de su plataforma), no como
un tercero al que le "compartís" datos para uso propio de ese tercero (publicidad, analítica
propia, etc.). Esta distinción es la misma que usa Google en su propia guía para
"proveedores de servicios".

---

## Apple — App Privacy ("Etiqueta de privacidad" / Nutrition Label)

Ruta en App Store Connect: **Tu app → App Privacy → Get Started**

### Datos vinculados a tu identidad ("Data Linked to You")

| Categoría | Dato | Uso |
|---|---|---|
| Contact Info | Name | App Functionality |
| Contact Info | Email Address | App Functionality |
| Identifiers | User ID (id de cuenta en Supabase Auth) | App Functionality |
| Usage Data | Product Interaction (lecciones completadas, XP, racha) | App Functionality |

### Datos NO vinculados a tu identidad
Ninguno adicional — todo lo que se recolecta está atado a la cuenta del usuario.

### Categorías que Apple pregunta explícitamente y la respuesta es "No recolectado"
Ubicación, Salud y estado físico, Información financiera, Contactos, Contenido del
usuario (fotos/videos/audio/etc.), Historial de navegación, Historial de búsqueda,
Identificadores de publicidad, Datos de diagnóstico (crash logs), Compras.

### "¿Usás datos para rastrear al usuario?" (App Tracking Transparency)
**No.** Obol no usa el IDFA ni ningún identificador para rastrear al usuario entre apps o
sitios de otras empresas (no hay SDKs de publicidad ni de atribución). Esto significa que
**no hace falta implementar el prompt de ATT** ("Ask App Not to Track").

---

## Nota sobre menores (COPPA / edad mínima)

Ambos formularios preguntan si la app está dirigida a niños. La política de privacidad ya
declara que Obol es para mayores de 13 años, sin verificación técnica de edad (algo común
en apps educativas de este tipo). En los cuestionarios de las tiendas, la respuesta
correspondiente es:
- **Google Play**: "¿Tu app está dirigida principalmente a niños menores de 13 años?" → **No**
  (target audience: 13+ / general).
- **Apple**: Age rating cuestionario → sin contenido para adultos, sin apuestas reales, sin
  compras — el rating resultante debería salir en **4+** automáticamente al completar el
  cuestionario honestamente (no hay que forzarlo).
