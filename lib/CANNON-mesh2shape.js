var CANNON = require('cannon');

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
module.exports = function (object, options) {
  options = options || {};

  if (options.type === 'BoxGeometry') {
    return createBoundingBoxShape(object);
  } else if (options.type) {
    throw new Error('[CANNON.mesh2shape] Invalid type "%s".', options.type);
  }

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
    case 'TubeGeometry':
      return createTubeShape(geometry);
    case 'Geometry':
    case 'BufferGeometry':
      return createTrimeshShape(geometry);
    default:
      console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', geometry.type);
      return createBoxShape(geometry);
  }
};

/******************************************************************************
 * Type overrides
 */

module.exports.Type = {BOX: 'BoxGeometry'};

/******************************************************************************
 * Shape construction
 */

/**
 * Bounding box needs to be computed with the entire mesh, not just geometry.
 * @param  {THREE.Object3D} mesh
 * @return {CANNON.Shape}
 */
function createBoundingBoxShape (object) {
  var box,
      shape,
      helper = new THREE.BoundingBoxHelper(object);
  helper.update();
  box = helper.box;

  if (!isFinite(box.min.lengthSq())) return null;

  shape = new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2,
    (box.max.y - box.min.y) / 2,
    (box.max.z - box.min.z) / 2
  ));

  helper.position.sub(object.position);
  if (helper.position.lengthSq()) {
    shape.offset = helper.position;
  }

  return shape;
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createBoxShape (geometry) {
  var vertices = getVertices(geometry);

  if (!vertices.length) return null;

  geometry.computeBoundingBox();
  var box = geometry.boundingBox;
  return new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2,
    (box.max.y - box.min.y) / 2,
    (box.max.z - box.min.z) / 2
  ));
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
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

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createPlaneShape (geometry) {
  geometry.computeBoundingBox();
  var box = geometry.boundingBox;
  return new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2 || 0.1,
    (box.max.y - box.min.y) / 2 || 0.1,
    (box.max.z - box.min.z) / 2 || 0.1
  ));
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createSphereShape (geometry) {
  return new CANNON.Sphere(geometry.parameters.radius);
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createTubeShape (geometry) {
  var tmp = new THREE.BufferGeometry();
  tmp.fromGeometry(geometry);
  return createTrimeshShape(tmp);
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createTrimeshShape (geometry) {
  var indices,
      vertices = getVertices(geometry);

  if (!vertices.length) return null;

  indices = Object.keys(vertices).map(Number);
  return new CANNON.Trimesh(vertices, indices);
}

/******************************************************************************
 * Utils
 */

/**
 * @param  {THREE.Geometry} geometry
 * @return {Array<number>}
 */
function getVertices (geometry) {
  if (geometry.attributes) {
    return geometry.attributes.position.array;
  }
  return geometry.vertices || [];
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {THREE.Geometry} Original geometry.
 */
function centerGeometry (geometry) {
  geometry.computeBoundingSphere();

  var center = geometry.boundingSphere.center;
  var radius = geometry.boundingSphere.radius;

  var s = radius === 0 ? 1 : 1.0 / radius;

  var matrix = new THREE.Matrix4();
  matrix.set(
    1, 0, 0, - 1 * center.x,
    0, 1, 0, - 1 * center.y,
    0, 0, 1, - 1 * center.z,
    0, 0, 0, 1
  );

  geometry.applyMatrix(matrix);

  return geometry;
}
