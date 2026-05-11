# Vanilla 3D Engine

An experimental 3D engine built entirely with **Vanilla JavaScript**, **HTML**, and **CSS** — no WebGL, no Three.js, no Canvas. Every 3D object is represented as a DOM element and manipulated through CSS 3D transformations.

This project was developed as part of the **IP6** at **FHNW**. It demonstrates how a functional, interactive 3D scene can be created using only native web technologies.

---

## 🚀 Features

* **DOM-based 3D rendering** using `transform: rotate3d()`, `translate3d()`, and `perspective()`
* **Scene management** with camera, lighting, scaling, rotation, and translation
* **Interactive controls** via mouse (drag, middle-click pan, scroll/pinch zoom)
* **Modular structure** with JSDoc typedefs for IDE support

---

## 📂 Project Structure

<pre>
<span style="color:#7ee787">vanilla_3d/</span>                          <span style="color:#a5d6ff">Core Vanilla-3D framework</span>
├── <span style="color:#7ee787">objects/</span>                         <span style="color:#a5d6ff">3D primitives and composite objects</span>
│   ├── <span style="color:#7ee787">box/</span>                         <span style="color:#a5d6ff">Box geometry implementation</span>
│   │   ├── <span style="color:#e6edf3">box.js</span>                   <span style="color:#8b949e">Object factory and logic</span>
│   │   ├── <span style="color:#e6edf3">box.css</span>                  <span style="color:#8b949e">Visual styling</span>
│   │   └── <span style="color:#e6edf3">box.test.js</span>              <span style="color:#8b949e">Unit tests</span>
│   ├── <span style="color:#7ee787">plane/</span>                       <span style="color:#a5d6ff">Planar surface primitive</span>
│   │   ├── <span style="color:#e6edf3">plane.js</span>                 <span style="color:#8b949e">Object factory and logic</span>
│   │   ├── <span style="color:#e6edf3">plane.css</span>                <span style="color:#8b949e">Visual styling</span>
│   │   └── <span style="color:#e6edf3">plane.test.js</span>            <span style="color:#8b949e">Unit tests</span>
│   └── <span style="color:#8b949e">...</span>
├── <span style="color:#7ee787">scene/</span>                           <span style="color:#a5d6ff">Scene setup, camera, and controls</span>
│   ├── <span style="color:#7ee787">functions/</span>                   <span style="color:#a5d6ff">Reusable scene-related helpers</span>
│   │   ├── <span style="color:#e6edf3">bind-controls.js</span>         <span style="color:#8b949e">Mouse and touch interaction</span>
│   │   ├── <span style="color:#e6edf3">bind-controls.test.js</span>    <span style="color:#8b949e">Interaction tests</span>
│   │   └── <span style="color:#8b949e">...</span>
│   ├── <span style="color:#e6edf3">scene-3d.js</span>                  <span style="color:#8b949e">Scene factory and public API</span>
│   └── <span style="color:#e6edf3">scene-3d.css</span>                 <span style="color:#8b949e">Scene layout and transforms</span>
├── <span style="color:#7ee787">textures/</span>                        <span style="color:#a5d6ff">Texture handling and mapping</span>
│   ├── <span style="color:#7ee787">pictures/</span>                    <span style="color:#a5d6ff">Image assets</span>
│   │   ├── <span style="color:#e6edf3">wood.jpg</span>
│   │   └── <span style="color:#8b949e">...</span>
│   ├── <span style="color:#e6edf3">texture.js</span>                   <span style="color:#8b949e">Texture abstraction</span>
│   ├── <span style="color:#e6edf3">texture.test.js</span>              <span style="color:#8b949e">Texture tests</span>
│   └── <span style="color:#e6edf3">texture.css</span>                  <span style="color:#8b949e">Texture-related styles</span>
├── <span style="color:#7ee787">types/</span><span style="color:#8b949e">...</span>                        <span style="color:#a5d6ff">Shared type definitions</span>
├── <span style="color:#7ee787">utils/</span><span style="color:#8b949e">...</span>                        <span style="color:#a5d6ff">Math and helper utilities</span>
├── <span style="color:#e6edf3">allTests.html</span>                    <span style="color:#8b949e">Browser test runner</span>
└── <span style="color:#e6edf3">allTestsSuite.js</span>                 <span style="color:#8b949e">Aggregated test imports</span>
</pre>

---

## 🧠 Concept

Unlike traditional 3D engines (like Three.js or Babylon.js), this engine does **not** rely on GPU rasterization. Instead, it leverages the browser’s **CSS 3D engine**. Each object is a DOM element (`<div>`) that is transformed in 3D space using CSS.

Example — creating a simple cube:

```js
const scene = createScene3D(document.getElementById("main"));
const box = createBox({dimensions: {width: 2, height: 2, depth: 2}});

scene.addObject(box);
scene.addControls();
scene.showAxisHelper();
```

The result is an interactive 3D cube that can be rotated and moved using the mouse.

---

## ⚙️ Installation & Run

> **Note:** No build tools are required — simply launch a local server to handle JavaScript modules.

### 🔹 Option 1: IntelliJ IDEA (Recommended)
The easiest way using the built-in web server:
1. **Open** `main.html` in the editor.
2. **Hover** over the top-right corner of the code to reveal the **browser icons**.
3. **Click** your preferred browser (e.g., Chrome) to launch the app via `localhost`.

### 🔹 Option 2: VS Code
* Install the **Live Server** extension.
* Right-click `main.html` and select **"Open with Live Server"**.

---

## 🎮 Controls

| Action            | Description              |
| ----------------- | ------------------------ |
| 🖱️ Left Mouse    | Rotate camera            |
| 🖱️ Middle Mouse  | Pan scene                |
| 🔍 Scroll / Pinch | Zoom in/out              |
| ⭕ Axis Rings | Rotate specifically along X, Y, or Z axis |
| ⬆️ Axis Arrows | Move scene or object along a specific axis          |


---

## 🎨 Materials & Textures

Materials are defined entirely in CSS, for example:

```css
.wood {
  background-image: url("textures/wood.jpg");
  background-size: cover;
}
```

They can be dynamically applied to objects:

```js
applyPictureTexture(Object.values(box.faces), 'brick');
```

---

## 🧩 Core Modules

### `scene-3d.js`

Manages the scene root, camera, transformations, and user controls.

### `box.js`, `sphere.js`, `plane.js`

Construct 3D objects using multiple DOM faces (`<div>`) with proper 3D orientation.

### `load-css.js`

Utility for dynamically importing CSS files into modules.

---

## 🔬 Development

### Typedefs

This project uses JSDoc `@typedef` for full IDE autocompletion and inline type checking in pure JavaScript:

```js
/** @typedef Vec3
 * @property {Number} x
 * @property {Number} y
 * @property {Number} z
 */
```

---

## 👨‍💻 Authors

**Florian Christ & Livio Jäckle** <br>
Bachelor of Science in Computer Science (FHNW) <br>
📍 Switzerland
