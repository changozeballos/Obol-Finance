# Progreso guardado del quiz "Probalo"

Permite que un usuario que deja su mail (login sin contraseña, vía magic link) vea
su puntaje y siga donde quedó si vuelve al sitio, en vez de que el quiz se
resetee en cada visita.

## Pasos para activarlo

1. **Crear la tabla**: en el proyecto de Supabase, abrir `SQL Editor` → pegar y
   correr `quiz_progress.sql` (una sola vez).
2. **Configurar el redirect del magic link**: `Authentication → URL Configuration`
   → agregar en `Redirect URLs` la URL real del sitio, por ejemplo
   `https://changozeballos.github.io/Obol-Finance/*` (con el `*` al final, para
   que también matchee `index.html` con o sin `#anotarse`/`#probalo`).
3. **Listo** — `docs/index.html` ya tiene la URL del proyecto y la `anon key`
   cargadas (son públicas, no hace falta ocultarlas: el acceso real lo controla
   Row Level Security en la base, no el secreto de esta key).

## Cómo funciona

- El panel "Probalo" (quiz) muestra un campo de mail chico en el costado. Si el
  usuario lo completa, Supabase le manda un magic link — sin contraseña que
  crear ni recordar.
- Al volver del mail, la sesión queda guardada en el navegador (`localStorage`)
  y el quiz carga automáticamente el último estado guardado (pregunta, puntaje,
  si ya terminó).
- Cada vez que contesta una pregunta, avanza o reinicia el quiz, el estado se
  guarda (`upsert`) en la tabla `quiz_progress`, en la fila de ese usuario.
- Row Level Security garantiza que cada usuario solo puede leer o escribir su
  propia fila (`auth.uid() = user_id`) — nadie puede ver el progreso de otro
  usuario ni aunque conozca su `user_id`.
- Si Supabase no carga (offline, bloqueador de contenido, etc.), el quiz y el
  chat siguen funcionando igual, solo que sin guardar progreso — es una mejora
  progresiva, no una dependencia dura.

## Nota sobre el testeo local

El magic link necesita una URL `http(s)` real para el redirect — no funciona
abriendo el HTML como `file://` en el navegador. Para probar el flujo completo
de login hay que hacerlo contra el sitio ya publicado en GitHub Pages.
