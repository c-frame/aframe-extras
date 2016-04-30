var CANNON = require('cannon');

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
module.exports = function (object) {
  var mesh, meshes = [];
  object.traverse(function (object) {
    if (object.type === 'Mesh') {
      meshes.push(object);
    }
  });

  mesh = meshes[0];
  if (meshes.length > 1) {
    console.warn('[mesh2shape] Found too many objects - returning shape for first first');
  } else if (meshes.length === 0) {
    return null;
  }

  switch (mesh.geometry.type) {
    case 'BoxGeometry':
      return createBoxShape(mesh.geometry);
    case 'CylinderGeometry':
      return createCylinderShape(mesh.geometry);
    case 'PlaneGeometry':
    case 'PlaneBufferGeometry':
      return createPlaneShape(mesh.geometry);
    case 'BufferGeometry':
      return createTrimeshShape(mesh.geometry);
    default:
      console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', mesh.geometry.type);
      return createBoxShape(mesh.geometry);
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

function createTrimeshShape (geometry) {
  var vertices = geometry.attributes.position.array;
  var indices = Object.keys(vertices).map(Number);
  return new CANNON.Trimesh(vertices, indices);
}
