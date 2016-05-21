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
  var matrix, mesh,
      meshes = getMeshes(object),
      tmp = new THREE.Geometry(),
      combined = new THREE.Geometry();

  if (meshes.length === 0) return null;
  if (meshes.length === 1) return meshes[0].geometry;

  while ((mesh = meshes.pop())) {
    if (mesh.geometry instanceof THREE.BufferGeometry) {
      tmp.fromBufferGeometry(mesh.geometry);
      combined.merge(tmp, mesh.userData.matrix || mesh.matrix);
    } else {
      combined.merge(mesh.geometry, mesh.userData.matrix || mesh.matrix);
    }
    delete mesh.userData.matrix;
  }

  matrix = new THREE.Matrix4();
  matrix.scale(object.scale);
  combined.applyMatrix(matrix);
  return combined;
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
 * Returns a flat array of THREE.Mesh instances from the given object. If
 * nested transformations are found, they are applied to child meshes
 * as mesh.userData.matrix, so that each mesh has its position/rotation/scale
 * independently of all of its parents except the top-level object.
 * @param  {THREE.Object3D} object
 * @return {Array<THREE.Mesh>}
 */
function getMeshes (object) {
  var meshes = [],
      identity = new THREE.Matrix4();

  object.traverse(function (o) {
    o.updateMatrix();
    if (o.type === 'Mesh') {
      meshes.push(o);
    } else if (o !== object && !o.matrix.equals(identity)) {
      // If transformations are applied to a THREE.Object3D or THREE.Group,
      // they need to be inherited by descendent geometry.
      o.traverse(function (o2) {
        o2.updateMatrix();
        o2.userData.matrix = o2.userData.matrix || o2.matrix.clone();
        o2.userData.matrix.multiply(o.matrix);
      });
    }
  });

  return meshes;
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
