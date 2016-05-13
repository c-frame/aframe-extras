var CANNON = require('cannon');

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
module.exports = CANNON.mesh2shape = function (object, options) {
  options = options || {};

  if (options.type === 'BoxGeometry') {
    return createBoundingBoxShape(object);
  } else if (options.type) {
    throw new Error('[CANNON.mesh2shape] Invalid type "%s".', options.type);
  }

  var geometry = getGeometry(object);

  if (!geometry) return null;

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
 * Returns a single geometry for the given object. If the object is compound,
 * its geometries are automatically merged.
 * @param {THREE.Object3D} object
 * @return {THREE.Geometry}
 */
function getGeometry (object) {
  var geometry, tmpGeometry, scale, mesh, meshes = [];
  object.traverse(function (object) {
    if (object.type === 'Mesh') {
      meshes.push(object);
    }
  });

  if (meshes.length === 0) return null;

  geometry = safeCloneGeometry(meshes.pop());
  while (meshes.length > 0) {
    geometry.merge( safeCloneGeometry(meshes.pop()) );
  }

  return geometry;
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {Array<number>}
 */
function getVertices (geometry) {
  if (!geometry.attributes) {
    geometry = new THREE.BufferGeometry().fromGeometry(geometry);
  }
  return geometry.attributes.position.array;
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

/**
 * Clones a mesh's geometry, with several non-default workarounds.
 *
 * 1. Scale geometry to match the mesh.
 * 2. Offset geometry position to match mesh.
 * 3. Avoid cloning when possible, to keep type information. For example,
 *    cloning PlaneBufferGeometry normally returns a BufferGeometry instead.
 *
 * @param  {THREE.Mesh} mesh
 * @return {THREE.Geometry}
 */
function safeCloneGeometry (mesh) {
  var cloned = false;
  var geometry = mesh.geometry;
  var scale = mesh.getWorldScale();
  var offset = mesh.getWorldPosition();

  if (scale.x !== 1 || scale.y !== 1 || scale.z !== 1) {
    console.log('SCALE %f %f %f', scale.x, scale.y, scale.z);
    geometry = geometry.clone().scale(scale.x, scale.y, scale.z);
    cloned = true;
  }

  if (offset.x || offset.y || offset.z) {
    console.log('OFFSET %f %f %f', offset.x, offset.y, offset.z);
    geometry = cloned ? geometry : geometry.clone();
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(offset.x, offset.y, offset.z));
    cloned = true;
  }

  return geometry;
}
