# Revisión de contenido — respuestas marcadas como correctas

804 preguntas revisadas (todas las secciones). 158 problemas encontrados (~20%).

## Estado final: 158 de 158 corregidos

Segunda ronda: en vez de dejar "marcadas para revisión" las preguntas de gráfico/slider
rotas de raíz, se le pidió a cada agente que reformulara enunciado + datos + explicación
para que cuenten la misma historia real (mismo criterio usado en `iet_9`, `sdl_9`, `mkt_9`,
`ret_9`, corregidas a mano primero como ejemplo). Resultado: **158 de 158 problemas
corregidos**.

El último caso, `ait_6` (¿el ancla cambiaria/tipo de cambio fijo es una herramienta
"efectiva" contra la inflación o "suele fracasar en el largo plazo"?), era un juicio de
valor más que un bug de datos — se decidió con el usuario: pasó al bucket "suele fracasar",
con la explanation actualizada para basarse en el patrón repetido en varios países (México
1994, Crisis Asiática 1997-98, Convertibilidad argentina 2001) en vez de un solo caso local.

**Aviso**: todas las correcciones se hicieron sobre `es.json` (español). El proyecto tiene
`en.json`/`pt.json` con las mismas keys de preguntas, pero no se tocaron — si hay usuarios
activos en esos idiomas, van a ver la versión vieja (con los bugs) hasta que se haga la
misma pasada ahí. Algunas de esas traducciones ya estaban incompletas de antes (ej. la
lección de `historia` no tiene `harg_8*` traducido a inglés/portugués).

Verificado con `tsc --noEmit`, build completo, validación de JSON, y re-extracción de las
804 preguntas — todo consistente.

<details>
<summary>Estado anterior (antes de la segunda ronda) — 111 corregidos, 48 pendientes</summary>

Los 6 agentes de revisión corrigieron directamente en el código los problemas de alta
confianza (donde la propia `explanation` ya decía cuál era la respuesta correcta, o la
reasignación de categoría era inequívoca). Verificado con `tsc --noEmit` + build + re-extracción
de las 804 preguntas — todo compila limpio.

### Quedan pendientes de revisión humana (48) — mayormente preguntas de gráfico rotas de raíz

Estas necesitan rediseñar la pregunta (nuevas `labels`/`values`, o repensar el enunciado), no
un simple cambio de campo:

- **Lote 1**: `iet_9` (con el dato corregido, ahora dos monedas quedan negativas pero la pregunta pide una sola respuesta — revisar el enunciado), `priceb_11` (confianza media).
- **Lote 2**: `sdl_9`, `mkt_9`, `emp_9`, `monp_9`, `ait_9`, `exr_9`, `intr_9`, `ftr_9` (graph_point mal formados), `ait_6` (juicio de valor sobre ancla cambiaria).
- **Lote 3**: `ef_9`, `cyc_9`, `arh_9`, `prc_9`, `whyb_9`, `bb_9`, `ante_9`, `ws_9`, `sinstr_9`, `swi_9`, `fcrisis_9` (graph_point mal formados), `r5020_6` (texto de buckets confuso, no es error de fondo).
- **Lote 4**: `htb_11`, `etfp_11` (sliders rotos de raíz), `div_9`, `wii_9`, `r72_9`, `pln_9`, `ccard_9`, `gbd_9`, `god_9`, `bon_9`, `etfp_9`, `htb_9` (graph_point mal formados).
- **Lote 5**: `clatam_11` (slider roto de raíz), `stab_9`, `defi_9`, `taxinv_9`, `ret_9`, `homef_9` (graph_point mal formados).
- **Lote 6**: `mmyth_9`, `imyth_9`, `sdmyth_9`, `ctmyth_9` (graph_point mal formados, uno con año futuro 2030), `hgold_9` (precio del oro en 1971 puesto en $0, falta el dato real ~USD 40/oz), `harg_11` (correct=8 reformas monetarias sin sustento claro en la explanation), `mmyth_8` (pregunta y explanation miden dos ratios distintos, hay que reformular el enunciado).

Nota: `htb_6` (i3/i5, Tesla/SPY quedaban en el bucket local) y `taxinv_8` (contradicción interna
5%/exento) aparecieron durante la corrección y ya se arreglaron.

Generado a partir de `content/lessons/sections.ts` + `i18n/locales/es.json`, revisado por 6 subagentes en paralelo (uno por grupo de secciones), verificando que la `correctId`/`correct`/`correctLabel` marcada sea realmente la correcta según el enunciado, la explicación y conocimiento real de economía/finanzas.

## Resumen por lote

| Lote | Secciones | Preguntas | Problemas |
|---|---|---|---|
| 1 | base_comun, inflation_prices, goods_markets_intro | 144 | 6 |
| 2 | supply_demand_markets, macro_indicators, economic_policy, international_money | 156 | 45 |
| 3 | crises_cycles, personal_budgeting, saving_track | 144 | 36 |
| 4 | debt_credit, investments_base, capital_markets | 156 | 30 |
| 5 | crypto_track, advanced_finance | 108 | 25 |
| 6 | myths_busting, historia | 96 | 16 |
| **Total** | | **804** | **158** |

## Patrón sistemático (la mayoría de los problemas)

No son errores conceptuales aislados — son bugs de generación que afectan sobre todo a los tipos de pregunta "interactivos":

- **`graph_id`** (elegir el gráfico correcto entre 4): en el lote 2, **13 de 13** preguntas de este tipo tenían la opción marcada mal (casi siempre marca "a" cuando la propia `explanation` dice "el gráfico B/C muestra..."). Mismo patrón en los lotes 1 y 3.
- **`slider`** (arrastrar a un valor numérico): en varios lotes, **más de la mitad** de los sliders tienen un `correct` que contradice el número que la propia `explanation` menciona — a veces por una unidad (% vs $ vs ARS), a veces por un orden de magnitud (10 en vez de 100), a veces con el signo invertido.
- **`classify`** (arrastrar ítems a categorías): varias preguntas tienen la mayoría de los ítems en el balde equivocado (ej. en `insur_6`, 4 de 5 ítems de seguros están invertidos; en `defi_6`, 4 de 5 ítems DeFi/CeFi están invertidos).
- **`graph_point`** (leer un punto de un gráfico): muchas preguntas piden un "año" pero los labels del gráfico son meses/días/porcentajes, o los datos numéricos no sustentan la respuesta marcada.

Las preguntas de opción múltiple y verdadero/falso están mayormente bien — los pocos errores ahí son conceptuales puntuales (datos de inflación desactualizados, confusión de fechas históricas, etc.), no el bug sistemático.

</details>

## Detalle completo por lote (diagnóstico original — la mayoría ya está corregida, ver arriba)

### Lote 1 — base_comun, inflation_prices, goods_markets_intro (6 problemas)

1. **wim_9** — explanation contradictoria/sin sentido (no afecta la respuesta marcada, que sí es correcta, pero confunde).
2. **wim_10** — orden de países por inflación 2023 (EEUU/Brasil/Argentina/Venezuela): Argentina (211,4%) superó a Venezuela (~193%) en 2023, el orden está al revés.
3. **iet_9** — datos de depreciación de monedas 2023 mal puestos: ARS subestimado (54,2% vs ~185-350% real), BRL marcado como depreciado cuando en realidad se apreció ~8%.
4. **hyp_5** — explanation confunde tasa mensual con anualizada de Zimbabue 2008.
5. **hyp_7** — cifra de hiperinflación de Venezuela 2018 subestimada 25x (65.000% vs ~1.700.000% real).
6. **priceb_11** — slider % ingresos a alimentación (correct=38) parece alto vs. estimaciones INDEC (22-30% promedio nacional).

### Lote 2 — supply_demand_markets, macro_indicators, economic_policy, international_money (45 problemas)

**graph_id con correctId mal (13/13):** sdl_12, mkt_12, ela_12, gdp_12, emp_12, pov_12, tbl_12, monp_12, fisp_12, ait_12, exr_12, intr_12, ftr_12 — en todos, la opción marcada describe lo contrario de lo pedido; la explanation casi siempre identifica la opción correcta textualmente ("el gráfico B muestra...").

**slider con correct que contradice la explanation (12/13):** sdl_11, mkt_11, ela_11, gdp_11, pov_11, tbl_11, monp_11, fisp_11 (valor negativo imposible), ait_11 (error de 10x), exr_11, intr_11 (no permite valores negativos pese a pedirlos), ftr_11.

**fill_number con correctId que contradice la explanation:** mkt_8, ela_8, tbl_8, monp_8 (dato real: BCRA llegó a 133% TNA, no 60%), ait_8 (error grave: hiperinflación 1989 fue ~196,6% mensual, no 5%).

**graph_point con datos/labels que no corresponden:** sdl_9, mkt_9, emp_9, monp_9, ait_9, exr_9, intr_9 (contradice su propia explanation sobre el año), ftr_9.

**classify con ítems mal ubicados:** mkt_6 (Telecom/verdulero/gas mal clasificados), ela_6 (sal fina, ejemplo clásico de inelasticidad, marcada como elástica), emp_6 (renuncia para mejor trabajo = desempleo friccional, no estructural), pov_6 (servicios básicos ≠ canasta alimentaria), monp_6 (subir encajes es contractivo, no expansivo), exr_6 (dólar blue/CCL marcados como "oficiales"), ait_6 (ancla cambiaria vs. convertibilidad, juicio de valor discutible).

### Lote 3 — crises_cycles, personal_budgeting, saving_track (36 problemas)

**correctId contradice el cálculo de la propia explanation:** cyc_8 (recesión técnica: 1 vs 2 trimestres), fcrisis_8 (desempleo Gran Depresión: 15% vs 25%), fcrisis_11 (slider caída S&P 500: 40 vs ~57), bb_8 ($300.000−$180.000: da $60.000 en vez de $120.000), bb_11 (slider gastos fijos: 15% vs 50-70%), r5020_8 (20% de $400.000: da $60.000 en vez de $80.000), r5020_11 (slider: 20% marcado para "necesidades" cuando el 20% es ahorro, confusión conceptual), ante_11 (unidad ARS en vez de %), whyb_8 (35% vs "más del 80%"), ws_8 (1 mes vs 3-6 meses de fondo de emergencia), ws_11 (20% vs 5-10% de ahorro), ef_8 (3×$150.000 da $300.000 en vez de $450.000), ef_9 (pregunta rota: la explanation calcula 9 meses pero esa etiqueta ni existe en el gráfico), prc_8 (dólar blue oct 2023: $400 vs ~$1.000), prc_11 (30% vs 40-60% ahorros en USD), sinstr_8 (rendimiento real: -20% vs -10%), sinstr_11 (TNA plazo fijo: 5% vs ~90%), swi_8 ($100.000 con 120% inflación: da igual en vez de $45.455).

**graph_id con correctId mal (4/4):** cyc_12, fcrisis_12, arh_12, prc_12.

**graph_point con datos que no sustentan la respuesta:** cyc_9, arh_9, arh_11 (slider defaults Argentina: correct=3000% en vez de 9 veces), prc_9 (labels son clases de activos, no años), whyb_9, bb_9, ante_9, ws_9, sinstr_9, swi_9, fcrisis_9.

**classify:** sinstr_6 (plazo fijo banco oficial marcado como riesgo alto), fcrisis_6 (contagio entre bancos clasificado como causa en vez de efecto).

**Otro:** r5020_6 (labels de buckets confusos/incompletos, no es error de fondo).

### Lote 4 — debt_credit, investments_base, capital_markets (30 problemas)

**fill_number/mc que contradicen su explanation:** gbd_8 (ganancia con préstamo: 100% vs 40%), ccard_8 (deuda compuesta 6 meses: $108.000 vs ~$148-158.000), pln_8 (CFT 180%: $800.000 vs $1.400.000), bon_8 (rendimiento corriente: 8% vs 12,5%), div_8 (dividend yield: 2% vs 5%), htb_8 (comisión brokers: 0% vs 0,25-0,6%), wii_8 (retorno real S&P 500 100 años: ~2% vs ~7%, error también factual).

**slider con correct desalineado:** rr_11 (renta fija cartera conservadora: 10% vs 60-80%, y el rango del slider ni permite marcar la respuesta), bon_11 (bonos arg. riesgo país alto: 5% vs 15-30%), wii_11 (retorno real cartera diversificada: 10% vs 5-7%), div_11 (dividend yield S&P histórico: 4% vs ~2%), ccard_11 (días de gracia: 60 con unidad "%" vs ~20 días), god_11 (meses para salir de deuda: 24 vs 12-18), pln_11 (unidad "meses" en vez de "%"), r72_11 (unidad "años" en vez de "%"), htb_11 (pregunta pide horario, slider es 0-10%, totalmente desconectado), etfp_11 (pregunta pide años de historia del SPY, slider es 0-1% en "M USD").

**classify:** wii_6 (plazo fijo marcado como especulación; comprar cripto especulativo marcado como inversión — invertido), bon_6 (bonos soberanos argentinos AL30 y CER marcados como "riesgo bajo/emisor sólido", contradice el resto del propio contenido sobre default de Argentina), htb_6 (acciones del Merval y AL30 marcadas como "mercado internacional" — es al revés, son instrumentos locales).

**graph_point:** div_9 (primera reducción de dividendo: dice 2022 cuando los datos muestran que fue en 2020), wii_9 (datos no corresponden al 7% real declarado, y "Año 5" no alcanza a duplicar el capital), r72_9 ("Año 10" cuando la propia explanation dice "año 20", que ni es una opción), pln_9 (cruce capital/interés en el primer mes, contradice explanation que dice "mitad del plazo"), ccard_9 (datos del gráfico no guardan relación con el capital de la pregunta), gbd_9 (labels son porcentajes, no años; falta una segunda serie para comparar), god_9 (falta segunda serie para comparar los dos métodos), bon_9 (label no responde lo preguntado, dato de caída inconsistente con la propia explanation), etfp_9 (labels son meses cuando se pregunta por años), htb_9 (labels son días de la semana cuando se pregunta por meses).

### Lote 5 — crypto_track, advanced_finance (25 problemas)

**classify con mayoría de ítems invertidos:** wic_6 (fiat/cripto invertidos), stab_6 (DAI marcado como "sin respaldo" cuando es cripto-colateralizado — contradice otra pregunta del mismo lote), defi_6 (4 de 5 ítems CeFi/DeFi invertidos), taxinv_6 (3 ítems de impuestos mal ubicados, contradice otras preguntas del mismo lote), ret_6 (Roth IRA/401k marcados como "ahorro general" en vez de "vehículo específico de retiro"), insur_6 (4 de 5 ítems de seguros invertidos), homef_6 (3 ítems de gasto estructural/gestionable invertidos).

**fill_number que contradicen su explanation:** wic_8 (caída máxima de Bitcoin: ~30% vs ~80%), stab_8 (colapso de UST: -10% vs -99%), clatam_8 (remesas cripto: ~5% vs &lt;1%), homef_8 (% alimentación: ~10% vs 25-35%).

**slider con valores/unidades desalineados:** bc_11 (TPS Bitcoin: 10 vs ~7, unidad mal puesta), stab_11 (unidad USD en vez de %, valor 1 vs 60-80), defi_11 (unidad % en vez de USD, valor 15 vs $3.800 millones — desalineación de escala total), clatam_11 (pregunta pide un año, slider configurado en 0-100 "M USD"), taxinv_11 (Bienes Personales: 15% vs 0,5-1,75%, dos órdenes de magnitud), ret_11 (jubilación SIPA: 15% vs 40-70%), insur_11 (múltiplo de ingreso asegurado: 500 vs 5-10, dos órdenes de magnitud, unidad ARS sin sentido), wic_11 (unidad "M" en vez de "%", menor).

**graph_point:** stab_9 (mínimo real está en otro mes que el marcado), defi_9 (pide una caída &gt;50% pero los datos son monótonamente crecientes), taxinv_9 (labels no incluyen la tasa mencionada en el enunciado), ret_9 (labels son edades cuando se pregunta por año; mínimo mal identificado), homef_9 (falta una segunda serie para comparar).

### Lote 6 — myths_busting, historia (16 problemas)

**correctId contradice la explanation (más graves — enseñan algo falso):** sdmyth_8 (tasa de ahorro: marca 98%/tasa de gasto en vez de 2%/tasa de ahorro real), imyth_8 (estudio Dalbar: marca "empata al mercado" cuando la explanation dice "rinde 3-5 puntos menos"), ctmyth_8 (~50 cripto para 90% de cap. de mercado, cuando la explanation dice ~10), ctmyth_11 (slider estafas cripto FBI 2023: 21 millones vs ~5.600 millones, error de 266x), harg_9 (inflación arg. más alta: marca 1990 cuando los propios datos del gráfico muestran que 1989 fue mayor), harg_8 (Plan Austral: invierte la dirección de la conversión — dice que 1 peso de 1985 vale 100 billones de pesos de 2024, cuando es al revés).

**slider desalineado:** mmyth_11 (inflación arg. vs LatAm: 70% vs 400-900% según la propia explanation), sdmyth_11 (costo de comprar en cuotas: 20% vs 70-120%).

**graph_point mal formado:** mmyth_9 (labels incluyen el año 2030, futuro; la respuesta correcta según la explanation ni es una opción disponible), imyth_9 (pide un monto/%, las opciones son años), sdmyth_9 (pide años, las opciones son meses), ctmyth_9 (pide un %, las opciones son años), hmon_9 (la mayor caída de uso de efectivo según los propios datos fue en 2021/2022, no 2020), hgold_9 (precio del oro en 1971 puesto en $0, dato placeholder).

**Otros:** harg_11 (slider reformas monetarias: correct=8 pero la explanation solo nombra 4, falta sustento), mmyth_8 (la pregunta y la explanation miden dos ratios distintos que no son intercambiables).

## Cómo seguir

Muchos de estos son mecánicos y de alta confianza (la propia `explanation` ya dice cuál es la respuesta correcta, solo hay que alinear `correctId`/`correct`/`correctLabel`). Otros requieren juicio (datos económicos reales a verificar, ambigüedad de la pregunta, o rediseñar el gráfico/slider porque los datos no sustentan ninguna respuesta clara).
