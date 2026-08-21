# BandCoach v5

## Novedades v5
- Temporizador y controles movidos a una barra inferior **sticky**: permanecen visibles aunque la explicación sea larga.
- La barra distingue TRABAJO y DESCANSO y conserva progreso, +15 s y Siguiente.
- Cada ejercicio tiene ahora un **esquema Inicio → Final** generado desde su posición, patrón de movimiento, anclaje y tipo de banda.
- El esquema aparece grande en modo instructor y como miniatura en la sesión propuesta.
- Las fichas técnicas detalladas de v4 se mantienen intactas.
- Cache actualizada a v5 para facilitar el despliegue en GitHub Pages.

> Los esquemas son orientativos; la descripción técnica, el rango sin dolor y la estabilidad tienen prioridad.

# BandCoach v4

Versión avanzada centrada exclusivamente en entrenamiento con bandas.

## Cambios
- 70 ejercicios.
- 11 posiciones corporales, incluyendo de pie, sentado, tumbado, arrodillado y cuadrupedia.
- Compatibilidad por banda larga, tubo con asas y minibanda.
- Material auxiliar: anclaje, silla y esterilla.
- Algoritmo anti-monotonía: evita repetir ejercicio dentro de una semana cuando hay alternativas y penaliza repetirlo la semana siguiente.
- Más variedad de patrones y posiciones en cada sesión.
- Ficha técnica detallada: banda/anclaje, pies, manos/agarre, ejecución, final, respiración, claves y errores.
- Mantiene aprendizaje por ejercicio y banda, programas de 4–12 semanas, descarga, temporizador, descansos e historial.

## Actualizar GitHub Pages
Reemplaza index.html, app.js, styles.css, manifest.json, sw.js y README.md, y añade exercise_library.js.

Los datos anteriores se migran desde la clave local de BandCoach v3 al abrir v4 en el mismo dominio.
