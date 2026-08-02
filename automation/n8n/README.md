# Workflows de n8n

## 1. Lista de espera (`obol-waitlist-n8n.json`)

Recibe los envíos del formulario de trivia en `docs/index.html` (sección `#obol-quiz`), valida el mail, guarda el lead en Google Sheets y manda un mail de bienvenida.

### Pasos para activarlo

1. **Google Sheet**: crear una planilla nueva con estas columnas en la primera fila:
   `email · nombre · puntaje · segmento · origen · pagina · referrer · fecha`
2. **Importar**: en n8n, `Import from File` → `obol-waitlist-n8n.json`.
3. **Google Sheets**: abrir el nodo "Guarda en la planilla", conectar tu credencial de Google y reemplazar `PEGAR_ID_DEL_GOOGLE_SHEET` por el ID real de la planilla (está en la URL, entre `/d/` y `/edit`).
4. **Gmail**: abrir el nodo "Manda la bienvenida" y conectar tu credencial de Gmail.
5. **Activar** el workflow (toggle arriba a la derecha).
6. **Copiar la URL de producción** del nodo "Recibe el formulario" (pestaña "Production URL", no la de test).
7. Pegar esa URL en `docs/index.html` y `docs/dolar.html`, dentro de cada `<script>`, en la línea:
   ```js
   var WEBHOOK = ""; // pegar acá la URL de producción
   ```

Sin el paso 7 los formularios quedan en "modo demo": funcionan en la página pero no mandan nada a n8n (solo lo loguean en la consola del navegador).

---

## 2. Newsletter semanal (`obol-newsletter-n8n.json`)

Todos los viernes a las 8am: junta cotizaciones (DolarAPI) e inflación/riesgo país (ArgentinaDatos), arma un briefing con esos datos, hace que Claude escriba una nota de 350-450 palabras con la voz de uno de los 5 personajes del blog (rota semana a semana), y deja el resultado como **borrador** en Gmail — no se envía solo.

### Pasos para activarlo

1. **Credencial de Anthropic**: en n8n, `Credentials → New → Anthropic account`, pegar tu API key de `console.anthropic.com`. El nodo "Claude escribe la nota" usa esta credencial vía `Predefined Credential Type` (la key nunca queda escrita en el JSON del workflow).
2. **Importar**: `Import from File` → `obol-newsletter-n8n.json`.
3. **Gmail**: abrir el nodo "Borrador en Gmail" y conectar tu credencial de Gmail (la misma que uses en el workflow de lista de espera sirve).
4. Si querés que el borrador llegue a otra casilla, cambiá el mail en el campo "To" (dentro de "Options") del nodo "Borrador en Gmail" — hoy apunta a `obol.finance2026@gmail.com`.
5. **Probar antes de activar**: click derecho → `Execute Workflow`, y revisá el borrador que aparece en Gmail antes de dejarlo corriendo solo.
6. **Activar** el workflow.

### Notas

- El modelo usado es `claude-sonnet-5`. Para bajar costo, `claude-haiku-4-5-20251001` alcanza de sobra para una nota de 400 palabras — se cambia en el campo `jsonBody` del nodo "Claude escribe la nota".
- El prompt está armado para que Claude use únicamente los números del briefing (nunca inventa cifras, noticias ni recomienda comprar/vender). Los datos exactos que recibió quedan pegados en un comentario HTML al final del borrador, así podés auditar cada cifra antes de mandar el mail.
- Si el endpoint del blue de hace 7 días falla, el nodo sigue de largo (`continueRegularOutput`) y la nota simplemente omite la variación semanal en vez de cortar todo el flujo.
- Si Claude devuelve algo que no es JSON válido, el workflow no se rompe: arma un borrador con asunto "revisar borrador" y el texto crudo, para que lo corrijas a mano.
