# Lista de espera — n8n

Workflow que recibe los envíos del formulario de trivia en `docs/index.html` (sección `#obol-quiz`), valida el mail, guarda el lead en Google Sheets y manda un mail de bienvenida.

## Pasos para activarlo

1. **Google Sheet**: crear una planilla nueva con estas columnas en la primera fila:
   `email · nombre · puntaje · segmento · origen · pagina · referrer · fecha`
2. **Importar**: en n8n, `Import from File` → `obol-waitlist-n8n.json`.
3. **Google Sheets**: abrir el nodo "Guarda en la planilla", conectar tu credencial de Google y reemplazar `PEGAR_ID_DEL_GOOGLE_SHEET` por el ID real de la planilla (está en la URL, entre `/d/` y `/edit`).
4. **Gmail**: abrir el nodo "Manda la bienvenida" y conectar tu credencial de Gmail.
5. **Activar** el workflow (toggle arriba a la derecha).
6. **Copiar la URL de producción** del nodo "Recibe el formulario" (pestaña "Production URL", no la de test).
7. Pegar esa URL en `docs/index.html`, dentro del `<script>` del widget, en la línea:
   ```js
   var WEBHOOK = ""; // pegar acá la URL de producción
   ```

Sin el paso 7 el widget queda en "modo demo": el formulario funciona en la página pero no manda nada a n8n (solo lo loguea en la consola del navegador).
