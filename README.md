# A-Frame Extras

[![Build Status](https://travis-ci.org/donmccurdy/aframe-extras.svg?branch=master)](https://travis-ci.org/donmccurdy/aframe-extras)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/donmccurdy/aframe-extras/master/LICENSE)

Add-ons and helpers for A-Frame VR.

## Usage (Scripts)

In the [dist/](https://github.com/donmccurdy/aframe-extras/tree/master/dist) folder, download any package(s) you need. Include the scripts on your page, and all components are automatically registered for you:

```html
<script src="//cdn.rawgit.com/donmccurdy/aframe-extras/v3.10.1/dist/aframe-extras.min.js"></script>
```

CDN builds for aframe-extras/v3.10.1:

- [aframe-extras.js](https://cdn.rawgit.com/donmccurdy/aframe-extras/v3.10.1/dist/aframe-extras.js) *(development)*
- [aframe-extras.min.js](https://cdn.rawgit.com/donmccurdy/aframe-extras/v3.10.1/dist/aframe-extras.min.js) *(production)*

For partial builds, use a subpackage like `aframe-extras.controls.min.js`. [Full list of packages below](#add-ons).

**A-Frame Version Compatibility**

| A-Frame   | Extras                |
|-----------|-----------------------|
| v0.5.X | aframe-extras/v3.10.1     |
| v0.4.X | */v3.3.0     |
| v0.3.X | */v2.6.1                 |
| v0.2.X | */v1.17.0                |

## Usage (NPM)

```
npm install --save aframe-extras
```

```javascript
// custom-extras.js

var extras = require('aframe-extras');

// Register a single component.
AFRAME.registerComponent('checkpoint', extras.misc.checkpoint);

// Register a particular package, and its dependencies.
extras.controls.registerAll();

// Register everything.
extras.registerAll();
```

Once installed, you'll need to compile your JavaScript using something like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/). Example:

```bash
npm install -g browserify
browserify custom-extras.js -o bundle.js
```

`bundle.js` may then be included in your page. See [here](http://browserify.org/#middle-section) for a better introduction to Browserify.

## Add-ons

<!-- tree src -I index.js -->
<pre>
src
├── <b>controls/</b> (<a href="/src/controls">Documentation</a>)
│   ├── checkpoint-controls.js
│   ├── gamepad-controls.js
│   ├── hmd-controls.js
│   ├── keyboard-controls.js
│   ├── mouse-controls.js
│   ├── touch-controls.js
│   └── universal-controls.js
├── <b>loaders/</b> (<a href="/src/loaders">Documentation</a>)
│   ├── animation-mixer.js
│   ├── fbx-model.js            <sub><img alt="Experimental" src="https://img.shields.io/badge/status-experimental-orange.svg"></sub>
│   ├── gltf-model-next.js      <sub><img alt="New" src="https://img.shields.io/badge/status-new-green.svg"></sub>
│   ├── gltf-model-legacy.js    <sub><img alt="New" src="https://img.shields.io/badge/status-new-green.svg"></sub>
│   ├── json-model.js
│   ├── object-model.js
│   └── ply-model.js
├── <b>misc/</b> (<a href="/src/misc">Documentation</a>)
│   ├── checkpoint.js
│   ├── cube-env-map.js         <sub><img alt="New" src="https://img.shields.io/badge/status-new-green.svg"></sub>
│   ├── grab.js
│   ├── jump-ability.js
│   ├── kinematic-body.js       <sub><img alt="Experimental" src="https://img.shields.io/badge/status-experimental-orange.svg"></sub>
│   ├── mesh-smooth.js          <sub><img alt="New" src="https://img.shields.io/badge/status-new-green.svg"></sub>
│   ├── sphere-collider.js
│   └── toggle-velocity.js
├── <b>physics/</b> (<a href="https://github.com/donmccurdy/aframe-physics-system">Moved to aframe-physics-system</a>)
└── <b>primitives/</b> (<a href="/src/primitives">Documentation</a>)
    ├── a-grid.js
    ├── a-hex-grid.js           <sub><img alt="New" src="https://img.shields.io/badge/status-new-green.svg"></sub>
    ├── a-ocean.js
    └── a-tube.js
</pre>
