var CANNON = require('cannon');

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
module.exports = function (object) {
  var geometry, meshes = [];
  object.traverse(function (object) {
    if (object.type === 'Mesh') {
      meshes.push(object);
    }
  });

  if (meshes.length > 1) {
    // Merge additional geometries into the first. Could try to create a
    // compound shape from primitives, but this is probably a custom model, and
    // doing that well automatically is complex.
    geometry = meshes.pop().geometry.clone();
    for (var i = 0; i < meshes.length; i++) {
      geometry.merge(meshes[i].geometry);
    }
  } else if (meshes.length === 1) {
    geometry = meshes[0].geometry;
  } else if (meshes.length === 0) {
    return null;
  }

  switch (geometry.type) {
    case 'BoxGeometry':
    case 'BoxBufferGeometry':
      return createBoxShape(geometry);
    case 'CylinderGeometry':
    case 'CylinderBufferGeometry':
      return createCylinderShape(geometry);
    case 'PlaneGeometry':
    case 'PlaneBufferGeometry':
      return createPlaneShape(geometry);
    case 'SphereGeometry':
    case 'SphereBufferGeometry':
      return createSphereShape(geometry);
    case 'Geometry':
    case 'BufferGeometry':
      return createTrimeshShape(geometry);
    default:
      console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', geometry.type);
      return createBoxShape(geometry);
  }
};

function createBoxShape (geometry) {
  geometry.computeBoundingBox();
  var box = geometry.boundingBox;
  return new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2,
    (box.max.y - box.min.y) / 2,
    (box.max.z - box.min.z) / 2
  ));
}

function createCylinderShape (geometry) {
  var shape,
      params = geometry.parameters;
  shape = new CANNON.Cylinder(
    params.radiusTop,
    params.radiusBottom,
    params.height,
    params.radialSegments
  );
  shape.orientation = new CANNON.Quaternion();
  shape.orientation.setFromEuler(THREE.Math.degToRad(-90), 0, 0, 'XYZ').normalize();
  return shape;
}

function createPlaneShape (geometry) {
  geometry.computeBoundingBox();
  var box = geometry.boundingBox;
  return new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2 || 0.1,
    (box.max.y - box.min.y) / 2 || 0.1,
    (box.max.z - box.min.z) / 2 || 0.1
  ));
}

function createSphereShape (geometry) {
  return new CANNON.Sphere(geometry.parameters.radius);
}

function createTrimeshShape (geometry) {
  if (!geometry.attributes) return null;

  var vertices = geometry.attributes.position.array;
  var indices = Object.keys(vertices).map(Number);
  return new CANNON.Trimesh(vertices, indices);
}
