# Goniómetro digital de rodilla

Herramienta web para trazar manualmente ejes anatómicos sobre una radiografía
de rodilla (proyección AP) y calcular automáticamente:

- **LDFA** (ángulo entre el eje anatómico femoral y la línea articular distal del fémur)
- **MPTA** (ángulo entre el eje anatómico tibial y la línea articular proximal de la tibia)
- **Ángulo tibiofemoral anatómico** (entre ambos ejes)

Todos los puntos trazados quedan arrastrables para ajuste fino.

> ⚠️ **Aviso**: esta es una herramienta de apoyo a la medición, no un dispositivo
> médico certificado ni un sistema de diagnóstico automático. No detecta huesos
> ni puntos anatómicos por sí sola: el usuario marca los puntos sobre la imagen,
> y el sistema calcula los ángulos según geometría estándar. Todo resultado debe
> ser verificado por un profesional capacitado antes de cualquier uso clínico.

## Cómo se usa

1. Subís la radiografía (una rodilla por imagen).
2. Marcás con clics:
   - 3 puntos sobre la cortical de la diáfisis femoral, en dos niveles
     (esto define 2 círculos → su línea de centros es el eje anatómico femoral).
   - 2 puntos sobre la superficie articular distal del fémur (cóndilo medial,
     luego lateral).
   - Lo mismo para la tibia (2 círculos diafisarios + línea articular proximal).
3. Los ángulos se calculan y muestran en vivo.
4. Si algún punto quedó mal ubicado, lo arrastrás directamente sobre la imagen
   y el cálculo se actualiza al instante. También podés tocar el ícono ↺ junto
   a cualquier paso para borrarlo y volver a clickearlo desde cero.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Subir a GitHub

```bash
git init
git add .
git commit -m "Goniómetro digital de rodilla"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

## Desplegar en Vercel

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión (podés usar tu
   cuenta de GitHub).
2. Click en **"Add New..." → "Project"**.
3. Elegí el repositorio que acabás de subir.
4. Vercel detecta automáticamente que es un proyecto Vite (Framework Preset:
   "Vite"). No hace falta tocar nada más — el `vercel.json` incluido ya
   configura las rutas para que funcione como SPA.
5. Click en **Deploy**. En un par de minutos tenés la URL pública
   (algo como `tu-proyecto.vercel.app`).

Cada vez que hagas `git push` a la rama `main`, Vercel vuelve a desplegar
automáticamente.

## Estructura del proyecto

```
src/
  geometry.js          → funciones matemáticas puras (circuncentro, ángulos)
  measurementSteps.js  → definición de los pasos guiados de medición
  KneeAngleCanvas.jsx  → componente principal: canvas interactivo + lógica de UI
  App.jsx              → monta el componente principal
  App.css              → estilos
```

## Limitaciones conocidas

- No hay detección automática de bordes óseos: todos los puntos se marcan
  a mano. Esto es intencional — es más confiable que una detección
  automática no validada clínicamente, y es el mismo principio que usan
  los softwares de planificación ortopédica profesionales (la IA ahí sugiere,
  pero el ajuste final es siempre humano).
- Pensada para una rodilla por imagen. Si tu radiografía tiene ambas piernas,
  recortá o hacé zoom sobre la rodilla de interés antes de subirla, o avisame
  si querés que extienda la herramienta para medir ambos lados en la misma foto.
- El orden de los clics importa (medial primero, luego lateral) para que el
  ángulo se calcule del lado correcto. Las instrucciones en pantalla lo indican
  en cada paso.
