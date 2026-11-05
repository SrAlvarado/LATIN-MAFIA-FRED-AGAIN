# 9 months & 50 hours

Web sobre el mixtape de **LATIN MAFIA & Fred again..** (2026): nueve meses de silencio, cincuenta horas de directo en Lago Algo y el concierto en el Palacio de los Deportes tres horas después.

## Recorrido

1. **El muro.** La portada real como escenario. El scroll es el reloj de las 50 horas: el lienzo se pinta en el orden en que se hizo (lavados, trazos, fotos, título a mano). Dibujado en WebGL con tres texturas: `assets/wall/full.jpg` (portada), `assets/wall/empty.jpg` (lienzo vacío, sintetizado) y `assets/wall/t.png` (mapa con el instante en que aparece cada píxel).
2. **under the fabric.** El primer encuentro, con el corto incrustado.
3. **Los nueve meses.** Línea de tiempo de diciembre a agosto.
4. **Detrás de la mesa.** Fred.
5. **Lago Algo.** Fotogramas y resumen del directo.
6. **De qué va.** Tres ideas.
7. **El disco.** Catorce canciones a escala de su duración, con foto, texto y fragmento de 30 s (previews de Apple Music, pedidas al cargar).
8. **El Palacio.** Concierto completo y fotos.

## Cómo verla

Es estática. Abre `index.html` o sirve la carpeta (`python3 -m http.server`). El audio y los vídeos necesitan conexión.

## Estructura

```
index.html
assets/css/style.css
assets/js/main.js
assets/img/        fotos, fotogramas y miniaturas
assets/wall/       texturas del muro
IMAGES/ INFO/      material de partida
```

Fotos: Flaunt, Theo Batterham (NME), The FADER, Consequence, canal oficial de Fred again.. y LATIN MAFIA en YouTube, y fotógrafos del Palacio. Portada: Apple Music.
