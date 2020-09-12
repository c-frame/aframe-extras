# A-Frame Extras

[![Latest NPM release](https://img.shields.io/npm/v/aframe-extras.svg)](https://www.npmjs.com/package/aframe-extras)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/donmccurdy/aframe-extras/master/LICENSE)
[![Build Status](https://travis-ci.org/donmccurdy/aframe-extras.svg?branch=master)](https://travis-ci.org/donmccurdy/aframe-extras)

Add-ons and helpers for A-Frame VR.

Includes components for controls, model loaders, pathfinding, and more:

<!-- tree src -I index.js -->
<pre>
src
├── <b>controls/</b> (<a href="/src/controls">Documentation</a>)
│   ├── movement-controls.js
│   ├── checkpoint-controls.js
│   ├── gamepad-controls.js
│   ├── keyboard-controls.js
│   ├── mouse-controls.js
│   ├── touch-controls.js
│   └── trackpad-controls.js
├── <b>loaders/</b> (<a href="/src/loaders">Documentation</a>)
│   ├── animation-mixer.js
│   ├── collada-model-legacy.js
│   ├── fbx-model.js
│   ├── gltf-model-legacy.js
│   └── object-model.js
├── <b>misc/</b> (<a href="/src/misc">Documentation</a>)
│   ├── checkpoint.js
│   ├── cube-env-map.js
│   ├── grab.js
│   ├── jump-ability.js
│   ├── kinematic-body.js       <sub><img alt="Deprecated" src="https://img.shields.io/badge/status-deprecated-orange.svg"></sub>
│   ├── mesh-smooth.js
│   ├── normal-material.js
│   └── sphere-collider.js
├── <b>pathfinding/</b> (<a href="/src/pathfinding">Documentation</a>)
│   ├── nav-mesh.js
│   └── nav-agent.js
└── <b>primitives/</b> (<a href="/src/primitives">Documentation</a>)
    ├── a-grid.js
    ├── a-hex-grid.js
    ├── a-ocean.js
    └── a-tube.js
</pre>

## Usage (Scripts)

In the [dist/](https://github.com/donmccurdy/aframe-extras/tree/master/dist) folder, download any package(s) you need. Include the scripts on your page, and all components are automatically registered for you:

```html
<script src="https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v6.1.1/dist/aframe-extras.min.js"></script>
```

CDN builds for aframe-extras/v6.0.0:

- [aframe-extras.js](https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v6.1.1/dist/aframe-extras.js) *(development)*
- [aframe-extras.min.js](https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v6.1.1/dist/aframe-extras.min.js) *(production)*

For partial builds, use a subpackage like `aframe-extras.controls.min.js`. Full list of packages above.

**A-Frame Version Compatibility**

| A-Frame  | Extras               |
|----------|----------------------|
| v0.9.X   | aframe-extras/v6.0.0 |
| v0.8.X   | */v5.1.0             |
| v0.5.X   | */v3.13.1            |
| v0.4.X   | */v3.3.0             |
| v0.3.X   | */v2.6.1             |
| v0.2.X   | */v1.17.0            |

> **NOTE:** Several components and examples also rely on [aframe-physics-system](https://github.com/donmccurdy/aframe-physics-system).

## Usage (NPM)

```
npm install --save aframe-extras
```

```javascript
// index.js
require('aframe-extras');
```

Once installed, you'll need to compile your JavaScript using something like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/). Example:

```bash
npm install -g browserify
browserify index.js -o bundle.js
```

`bundle.js` may then be included in your page. See [here](http://browserify.org/#middle-section) for a better introduction to Browserify.
