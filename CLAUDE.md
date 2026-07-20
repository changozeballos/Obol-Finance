# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Qué es Obol

App estilo Duolingo para educación financiera, orientada a usuarios argentinos (modismos locales, ejemplos con pesos/inflación, etc.).

## Stack

- **Expo Router 57** + React Native 0.81 + React 19
- **Supabase** (auth + backend) — credenciales en `.env` (no versionado, ver `.env.example`), schema en `supabase-setup.sql`
- **Zustand** para estado global (`store/`)
- **i18next** para contenido — `i18n/locales/es.json` tiene los textos y preguntas de las lecciones
- Motor de lecciones en `content/lessons/sections.ts`, con 9 tipos de preguntas: `mc`, `tf`, `order`, `classify`, `slider`, `graph_id`, entre otros
- **EAS** para builds nativos (`eas.json`, proyecto ya vinculado)

## Estructura relevante

- `app/` — rutas de Expo Router (pantallas)
- `components/` — componentes reutilizables (p.ej. `SectionHeaderCard.tsx`, `PigAvatar`)
- `content/lessons/sections.ts` — estructura y lógica de lecciones/preguntas
- `i18n/locales/es.json` — contenido textual de preguntas y lecciones
- `store/` — estado Zustand
- `constants/` — tokens de diseño (colores, sombras, `platform.ts`)
- `assets/characters/` — sprites del chanchito (Obol) en sus distintos estados de ánimo
- `assets/section-headers/` — fondos `bg_*.png` por sección temática

## Convenciones de contenido

- Preguntas tipo `mc` usan `correctIdx` (índice de opción correcta); tipo `tf` usa `correctId`/`true`/`false`. Mantené el mapeo entre `sections.ts` (estructura/tipo) y `es.json` (texto/opciones) sincronizado — un desajuste de índice es el bug más común en este proyecto.
- Modismos argentinos son intencionales en el copy ("abajo del colchón", "oferta o robo", etc.) — no neutralizar el lenguaje al editar contenido.
- Los archivos `.html` grandes en la raíz (`plan_contenido.html`, `obol_prototype.html`, etc.) y los scripts `fix_*.js` / `qbank_*.js` son herramientas puntuales de migración/visualización de contenido, no código vivo de la app. No hace falta leerlos ni mantenerlos salvo pedido explícito.

## Git

- Rama de trabajo: `main`. Se commitea localmente y se pushea a pedido del usuario — no asumir push automático.
- Antes de asumir que un pendiente sigue abierto (bugs marcados en `plan_contenido.html`, contenido pendiente de revisión), confirmar con el usuario si ya se resolvió en una sesión previa.

## Comandos

| Comando | Propósito |
|---|---|
| `npm run start` / `expo start` | Levantar Metro bundler |
| `npm run android` / `npm run ios` / `npm run web` | Levantar en plataforma específica |
| `eas build` | Build nativo vía EAS |

## Handover entre sesiones

`handover_claude.md` en la raíz se actualiza al final de sesiones largas con el estado exacto (commits recientes, cambios sin commitear, pendientes). Leerlo primero en una sesión nueva antes de asumir el estado del proyecto.
