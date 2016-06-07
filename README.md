# A-Frame Extras

[![Build Status](https://travis-ci.org/donmccurdy/aframe-extras.svg?branch=master)](https://travis-ci.org/donmccurdy/aframe-extras)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/donmccurdy/aframe-extras/master/LICENSE)

Add-ons and helpers for A-Frame VR.

## Usage (Scripts)

In the [dist/](https://github.com/donmccurdy/aframe-extras/tree/master/dist) folder, download any package(s) you need. Include the scripts on your page, and all components are automatically registered for you:

```html
<script src="//cdn.rawgit.com/donmccurdy/aframe-extras/v1.16.2/dist/aframe-extras.min.js"></script>
```

CDN builds for aframe-extras/v1.16.2:

- [aframe-extras.js](https://cdn.rawgit.com/donmccurdy/aframe-extras/v1.16.2/dist/aframe-extras.js) *(development)*
- [aframe-extras.min.js](https://cdn.rawgit.com/donmccurdy/aframe-extras/v1.16.2/dist/aframe-extras.min.js) *(production)*

## Usage (NPM)

```
npm install --save aframe-extras
```

```javascript
// custom-extras.js

var extras = require('aframe-extras');
AFRAME.registerComponent('velocity', extras.math.velocity); // Register a single component.
extras.physics.registerAll();                               // Register a particular package, and its dependencies.
extras.registerAll();                                       // Register everything.
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
├── controls/ (<a href="/src/controls">Documentation</a>)
│   ├── checkpoint-controls.js
│   ├── gamepad-controls.js
│   ├── hmd-controls.js
│   ├── keyboard-controls.js    <sub><img alt="Experimental" src="https://img.shields.io/badge/VR--friendly-no-red.svg"></sub>
│   ├── mouse-controls.js       <sub><img alt="Experimental" src="https://img.shields.io/badge/VR--friendly-no-red.svg"></sub>
│   ├── touch-controls.js
│   └── universal-controls.js
├── loaders/ (<a href="/src/loaders">Documentation</a>)
│   ├── fbx-model.js            <sub><img alt="Experimental" src="https://img.shields.io/badge/status-deprecated-lightgrey.svg"></sub>
│   ├── ply-model.js
│   └── three-model.js
├── math/ (<a href="/src/math">Documentation</a>)
│   ├── quaternion.js
│   └── velocity.js
├── misc/ (<a href="/src/misc">Documentation</a>)
│   ├── checkpoint.js
│   ├── jump-ability.js         <sub><img alt="Experimental" src="https://img.shields.io/badge/VR--friendly-no-red.svg"></sub>
│   └── toggle-velocity.js
├── physics/ (<a href="/src/physics">Documentation</a>)
│   ├── body.js
│   ├── dynamic-body.js
│   ├── kinematic-body.js       <sub><img alt="Experimental" src="https://img.shields.io/badge/status-experimental-orange.svg"></sub>
│   ├── physics.js
│   ├── static-body.js
│   └── system
│       └── physics.js
├── primitives/ (<a href="/src/primitives">Documentation</a>)
│   ├── a-grid.js
│   ├── a-ocean.js
│   └── a-tube.js
└── shadows/ (<a href="/src/shadows">Documentation</a>)    <sub><img alt="Experimental" src="https://img.shields.io/badge/status-experimental-orange.svg"></sub>
    ├── shadow-light.js
    └── shadow.js
</pre>
