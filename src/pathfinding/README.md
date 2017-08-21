# Pathfinding

Set of components for pathfinding along a nav mesh, using [PatrolJS](https://github.com/nickjanssen/PatrolJS/).

- **nav-mesh**: Assigns model from the current entity as a [navigation mesh](https://en.wikipedia.org/wiki/Navigation_mesh) for the pathfinding system. A navigation mesh is not the same as visible terrain geometry. See below.
- **nav-controller**: Adds behaviors to an entity allowing it to navigate to any reachable destination along the nav mesh.

## Creating a nav mesh

[Blog post](https://medium.com/@donmccurdy/creating-a-nav-mesh-for-a-webvr-scene-b3fdb6bed918).

## Setting a destination

Controllers can be activated to begin moving their entity toward a destination. Example:

```html
<!-- NPC -->
<a-entity id="npc"
          gltf-model="npc.gltf"
          nav-controller="speed: 1.5"></a-entity>

<!-- Nav Mesh -->
<a-entity gltf-model="navmesh.gltf"
          nav-mesh></a-entity>

<!-- Scene -->
<a-entity gltf-model="scene.gltf"></a-entity>
```

```js
var npcEl = document.querySelector('#npc');
npcEl.setAttribute('nav-controller', {
  active: true,
  destination: e.detail.intersection.point
});
```

## Events

The `nav-controller` component will emit two events:

- `nav-start`: Entity beginning travel to a destination.
- `nav-end`: Entity has reached destination.

## Important notes

This implementation is meant as a proof-of-concept, and doesn't have all the features and polish of game engine navigation. Currently missing:

- [ ] Smooth rotation when navigating around corners.
- [ ] Dynamic obstacles, like mobile props and NPCs.
- [ ] Multiple nav meshes and/or levels.
