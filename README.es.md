<div align="center">
  <h1>Echo 🎵</h1>
  <p><em>Un moderno mezclador de sonidos ambientales multiplataforma para ayudarte a enfocar, relajarte y ser más "productivo".</em></p>

[![License: GPL v2](https://img.shields.io/badge/License-GPL_v2-blue.svg)](LICENSE.md)
[![Tauri](https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri&logoColor=white)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

_[Read in English](README.md)_

</div>

---

## 📖 La Historia detrás de Echo

Durante mi tiempo usando Linux, me encantaba usar **[Blanket](https://github.com/rafaelmardojai/blanket)**, un fantástico mezclador de sonidos ambientales. Sin embargo, al hacer la transición hacia Windows y macOS, comencé a extrañar muchísimo esta herramienta. Aunque descubrí una alternativa para macOS llamada _[Blankie](https://github.com/codybrom/Blankie)_, esta mantiene exactamente la misma línea visual que Blanket, la cual, francamente, no encaja con mis gustos estéticos.

Este vacío me inspiró a crear **Echo** (un nombre en clave temporal). ¿El objetivo? Construir una alternativa multiplataforma que ofrezca el mismo entorno acústico relajante y libre de distracciones, pero envuelto en un **diseño moderno**, hermoso y altamente pulido.

## 🚀 Estado Actual (MVP)

Echo se encuentra en desarrollo activo. Actualmente estamos atravesando la etapa de **Producto Mínimo Viable (MVP)**, avanzando a través de las siguientes fases generales:

- 🎨 **Fase 1: Identidad Visual y Bases (Actual)**
  Establecer una interfaz limpia y moderna, estructurar el proyecto y garantizar una experiencia de ventana nativa y fluida tanto en macOS como en Windows.
- ⚙️ **Fase 2: Motor de Audio Central**
  Integrar el reproductor de audio mediante el backend en Rust, añadir las pistas ambientales esenciales (Lluvia, Viento, Sonidos de la naturaleza) y conectar los controles de la interfaz.
- ✨ **Fase 3: Pulido y Expansión**
  Añadir soporte para guardar mezclas personalizadas (presets), optimizar el rendimiento y generar los instaladores finales para cada plataforma.

## 🛠️ Tecnologías Utilizadas

Echo aprovecha tecnologías web de última generación empaquetadas en un ejecutable de escritorio ultraligero y rápido:

- **Framework de Escritorio:** Tauri v2 y Rust
- **Frontend:** React 19
- **Estilos y Animación:** Tailwind CSS v4, Framer Motion, Radix UI

## 🎵 Créditos de Audio

Los sonidos ambientales incluidos en Echo provienen de [Freesound.org](https://freesound.org) bajo licencias de Creative Commons:

- **[Rain Loop Ontario](https://freesound.org/people/Ayton/sounds/212799/)** de [Ayton](https://freesound.org/people/Ayton/) – Licenciado bajo [Attribution 3.0](http://creativecommons.org/licenses/by/3.0/)
- **[Storm Winds.aiff](https://freesound.org/people/gnrja/sounds/151770/)** de [gnrja](https://freesound.org/people/gnrja/) – Licenciado bajo [Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

## 📜 Licencia

Echo es orgullosamente de Código Abierto. Se distribuye bajo la **Licencia GPL v2**, lo que garantiza que cualquier trabajo derivado también deberá mantenerse abierto y libre. Consulta el archivo [LICENSE](LICENSE.md) para más detalles.
