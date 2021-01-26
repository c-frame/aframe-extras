(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./src/pathfinding');

},{"./src/pathfinding":3}],2:[function(require,module,exports){
var e=function(){};e.computeCentroids=function(e){var t,n,r;for(t=0,n=e.faces.length;t<n;t++)(r=e.faces[t]).centroid=new THREE.Vector3(0,0,0),r.centroid.add(e.vertices[r.a]),r.centroid.add(e.vertices[r.b]),r.centroid.add(e.vertices[r.c]),r.centroid.divideScalar(3)},e.roundNumber=function(e,t){return Number(e.toFixed(t))},e.sample=function(e){return e[Math.floor(Math.random()*e.length)]},e.mergeVertexIds=function(e,t){var n=[];if(e.forEach(function(e){t.indexOf(e)>=0&&n.push(e)}),n.length<2)return[];n.includes(e[0])&&n.includes(e[e.length-1])&&e.push(e.shift()),n.includes(t[0])&&n.includes(t[t.length-1])&&t.push(t.shift()),n=[],e.forEach(function(e){t.includes(e)&&n.push(e)});for(var r=n[1],o=n[0],i=e.slice();i[0]!==r;)i.push(i.shift());for(var s=0,u=t.slice();u[0]!==o;)if(u.push(u.shift()),s++>10)throw new Error("Unexpected state");return u.shift(),u.pop(),i=i.concat(u)},e.setPolygonCentroid=function(e,t){var n=new THREE.Vector3,r=t.vertices;e.vertexIds.forEach(function(e){n.add(r[e])}),n.divideScalar(e.vertexIds.length),e.centroid.copy(n)},e.cleanPolygon=function(e,t){for(var n=[],r=t.vertices,o=0;o<e.vertexIds.length;o++){var i,s,u,c=r[e.vertexIds[o]];0===o?(i=e.vertexIds[1],s=e.vertexIds[e.vertexIds.length-1]):o===e.vertexIds.length-1?(i=e.vertexIds[0],s=e.vertexIds[e.vertexIds.length-2]):(i=e.vertexIds[o+1],s=e.vertexIds[o-1]),u=r[s];var h=r[i].clone().sub(c),a=u.clone().sub(c),d=h.angleTo(a);if(d>Math.PI-.01&&d<Math.PI+.01){var f=[];e.neighbours.forEach(function(t){t.vertexIds.includes(e.vertexIds[o])||f.push(t)}),e.neighbours=f}else n.push(e.vertexIds[o])}e.vertexIds=n,this.setPolygonCentroid(e,t)},e.isConvex=function(e,t){var n=t.vertices;if(e.vertexIds.length<3)return!1;for(var r=!0,o=[],i=0;i<e.vertexIds.length;i++){var s,u,c=n[e.vertexIds[i]];0===i?(s=n[e.vertexIds[1]],u=n[e.vertexIds[e.vertexIds.length-1]]):i===e.vertexIds.length-1?(s=n[e.vertexIds[0]],u=n[e.vertexIds[e.vertexIds.length-2]]):(s=n[e.vertexIds[i+1]],u=n[e.vertexIds[i-1]]);var h=s.clone().sub(c),a=u.clone().sub(c),d=h.angleTo(a);if(d===Math.PI||0===d)return!1;var f=h.cross(a).y;o.push(f)}return o.forEach(function(e){0===e&&(r=!1)}),o.forEach(o[0]>0?function(e){e<0&&(r=!1)}:function(e){e>0&&(r=!1)}),r},e.distanceToSquared=function(e,t){var n=e.x-t.x,r=e.y-t.y,o=e.z-t.z;return n*n+r*r+o*o},e.isPointInPoly=function(e,t){for(var n=!1,r=-1,o=e.length,i=o-1;++r<o;i=r)(e[r].z<=t.z&&t.z<e[i].z||e[i].z<=t.z&&t.z<e[r].z)&&t.x<(e[i].x-e[r].x)*(t.z-e[r].z)/(e[i].z-e[r].z)+e[r].x&&(n=!n);return n},e.isVectorInPolygon=function(e,t,n){var r=1e5,o=-1e5,i=[];return t.vertexIds.forEach(function(e){r=Math.min(n[e].y,r),o=Math.max(n[e].y,o),i.push(n[e])}),!!(e.y<o+.5&&e.y>r-.5&&this.isPointInPoly(i,e))},e.triarea2=function(e,t,n){return(n.x-e.x)*(t.z-e.z)-(t.x-e.x)*(n.z-e.z)},e.vequal=function(e,t){return this.distanceToSquared(e,t)<1e-5};var t=function(e){this.content=[],this.scoreFunction=e};t.prototype.push=function(e){this.content.push(e),this.sinkDown(this.content.length-1)},t.prototype.pop=function(){var e=this.content[0],t=this.content.pop();return this.content.length>0&&(this.content[0]=t,this.bubbleUp(0)),e},t.prototype.remove=function(e){var t=this.content.indexOf(e),n=this.content.pop();t!==this.content.length-1&&(this.content[t]=n,this.scoreFunction(n)<this.scoreFunction(e)?this.sinkDown(t):this.bubbleUp(t))},t.prototype.size=function(){return this.content.length},t.prototype.rescoreElement=function(e){this.sinkDown(this.content.indexOf(e))},t.prototype.sinkDown=function(e){for(var t=this.content[e];e>0;){var n=(e+1>>1)-1,r=this.content[n];if(!(this.scoreFunction(t)<this.scoreFunction(r)))break;this.content[n]=t,this.content[e]=r,e=n}},t.prototype.bubbleUp=function(e){for(var t=this.content.length,n=this.content[e],r=this.scoreFunction(n);;){var o=e+1<<1,i=o-1,s=null,u=void 0;if(i<t)(u=this.scoreFunction(this.content[i]))<r&&(s=i);if(o<t)this.scoreFunction(this.content[o])<(null===s?r:u)&&(s=o);if(null===s)break;this.content[e]=this.content[s],this.content[s]=n,e=s}};var n=function(){};n.init=function(e){for(var t=0;t<e.length;t++){var n=e[t];n.f=0,n.g=0,n.h=0,n.cost=1,n.visited=!1,n.closed=!1,n.parent=null}},n.cleanUp=function(e){for(var t=0;t<e.length;t++){var n=e[t];delete n.f,delete n.g,delete n.h,delete n.cost,delete n.visited,delete n.closed,delete n.parent}},n.heap=function(){return new t(function(e){return e.f})},n.search=function(e,t,n){this.init(e);var r=this.heap();for(r.push(t);r.size()>0;){var o=r.pop();if(o===n){for(var i=o,s=[];i.parent;)s.push(i),i=i.parent;return this.cleanUp(s),s.reverse()}o.closed=!0;for(var u=this.neighbours(e,o),c=0,h=u.length;c<h;c++){var a=u[c];if(!a.closed){var d=o.g+a.cost,f=a.visited;if(!f||d<a.g){if(a.visited=!0,a.parent=o,!a.centroid||!n.centroid)throw new Error("Unexpected state");a.h=a.h||this.heuristic(a.centroid,n.centroid),a.g=d,a.f=a.g+a.h,f?r.rescoreElement(a):r.push(a)}}}}return[]},n.heuristic=function(t,n){return e.distanceToSquared(t,n)},n.neighbours=function(e,t){for(var n=[],r=0;r<t.neighbours.length;r++)n.push(e[t.neighbours[r]]);return n};var r=1,o=function(){};o.buildZone=function(t){var n=this,r=this._buildNavigationMesh(t),o={};r.vertices.forEach(function(t){t.x=e.roundNumber(t.x,2),t.y=e.roundNumber(t.y,2),t.z=e.roundNumber(t.z,2)}),o.vertices=r.vertices;var i=this._buildPolygonGroups(r);o.groups=[];var s=function(e,t){for(var n=0;n<e.length;n++)if(t===e[n])return n};return i.forEach(function(t){var r=[];t.forEach(function(o){var i=o.neighbours.map(function(e){return s(t,e)}),u=o.neighbours.map(function(e){return n._getSharedVerticesInOrder(o,e)});o.centroid.x=e.roundNumber(o.centroid.x,2),o.centroid.y=e.roundNumber(o.centroid.y,2),o.centroid.z=e.roundNumber(o.centroid.z,2),r.push({id:s(t,o),neighbours:i,vertexIds:o.vertexIds,centroid:o.centroid,portals:u})}),o.groups.push(r)}),o},o._buildNavigationMesh=function(t){return e.computeCentroids(t),t.mergeVertices(),this._buildPolygonsFromGeometry(t)},o._buildPolygonGroups=function(e){var t=[],n=0,r=function(e){e.neighbours.forEach(function(t){void 0===t.group&&(t.group=e.group,r(t))})};return e.polygons.forEach(function(e){void 0===e.group&&(e.group=n++,r(e)),t[e.group]||(t[e.group]=[]),t[e.group].push(e)}),t},o._buildPolygonNeighbours=function(e,t,n){var r=new Set,o=n.get(e.vertexIds[0]),i=n.get(e.vertexIds[1]),s=n.get(e.vertexIds[2]);o.forEach(function(e){(i.has(e)||s.has(e))&&r.add(t.polygons[e])}),i.forEach(function(e){s.has(e)&&r.add(t.polygons[e])}),e.neighbours=Array.from(r)},o._buildPolygonsFromGeometry=function(e){for(var t=this,n=[],o=e.vertices,i=e.faceVertexUvs,s=new Map,u=0;u<o.length;u++)s.set(u,new Set);e.faces.forEach(function(e){n.push({id:r++,vertexIds:[e.a,e.b,e.c],centroid:e.centroid,normal:e.normal,neighbours:[]}),s.get(e.a).add(n.length-1),s.get(e.b).add(n.length-1),s.get(e.c).add(n.length-1)});var c={polygons:n,vertices:o,faceVertexUvs:i};return n.forEach(function(e){t._buildPolygonNeighbours(e,c,s)}),c},o._getSharedVerticesInOrder=function(e,t){var n=e.vertexIds,r=t.vertexIds,o=new Set;if(n.forEach(function(e){r.includes(e)&&o.add(e)}),o.size<2)return[];o.has(n[0])&&o.has(n[n.length-1])&&n.push(n.shift()),o.has(r[0])&&o.has(r[r.length-1])&&r.push(r.shift());var i=[];return n.forEach(function(e){r.includes(e)&&i.push(e)}),i};var i=function(){this.portals=[]};i.prototype.push=function(e,t){void 0===t&&(t=e),this.portals.push({left:e,right:t})},i.prototype.stringPull=function(){var t,n,r,o=this.portals,i=[],s=0,u=0,c=0;n=o[0].left,r=o[0].right,i.push(t=o[0].left);for(var h=1;h<o.length;h++){var a=o[h].left,d=o[h].right;if(e.triarea2(t,r,d)<=0){if(!(e.vequal(t,r)||e.triarea2(t,n,d)>0)){i.push(n),n=t=n,r=t,u=s=u,c=s,h=s;continue}r=d,c=h}if(e.triarea2(t,n,a)>=0){if(!(e.vequal(t,n)||e.triarea2(t,r,a)<0)){i.push(r),n=t=r,r=t,u=s=c,c=s,h=s;continue}n=a,u=h}}return 0!==i.length&&e.vequal(i[i.length-1],o[o.length-1].left)||i.push(o[o.length-1].left),this.path=i,i};var s,u,c,h,a,d,f=function(){this.zones={}};f.createZone=function(e){return o.buildZone(e)},f.prototype.setZoneData=function(e,t){this.zones[e]=t},f.prototype.getGroup=function(t,n){if(!this.zones[t])return null;var r=null,o=Math.pow(50,2);return this.zones[t].groups.forEach(function(t,i){t.forEach(function(t){var s=e.distanceToSquared(t.centroid,n);s<o&&(r=i,o=s)})}),r},f.prototype.getRandomNode=function(t,n,r,o){if(!this.zones[t])return new THREE.Vector3;r=r||null,o=o||0;var i=[];return this.zones[t].groups[n].forEach(function(t){r&&o?e.distanceToSquared(r,t.centroid)<o*o&&i.push(t.centroid):i.push(t.centroid)}),e.sample(i)||new THREE.Vector3},f.prototype.getClosestNode=function(t,n,r,o){void 0===o&&(o=!1);var i=this.zones[n].vertices,s=null,u=Infinity;return this.zones[n].groups[r].forEach(function(n){var r=e.distanceToSquared(n.centroid,t);r<u&&(!o||e.isVectorInPolygon(t,n,i))&&(s=n,u=r)}),s},f.prototype.findPath=function(e,t,r,o){var s=this.zones[r].groups[o],u=this.zones[r].vertices,c=this.getClosestNode(e,r,o),h=this.getClosestNode(t,r,o,!0);if(!c||!h)return null;var a=n.search(s,c,h),d=function(e,t){for(var n=0;n<e.neighbours.length;n++)if(e.neighbours[n]===t.id)return e.portals[n]},f=new i;f.push(e);for(var l=0;l<a.length;l++){var v=a[l+1];if(v){var p=d(a[l],v);f.push(u[p[0]],u[p[1]])}}f.push(t),f.stringPull();var g=f.path.map(function(e){return new THREE.Vector3(e.x,e.y,e.z)});return g.shift(),g},f.prototype.clampStep=(c=new THREE.Vector3,h=new THREE.Plane,a=new THREE.Triangle,d=new THREE.Vector3,function(e,t,n,r,o,i){var f=this.zones[r].vertices,l=this.zones[r].groups[o],v=[n],p={};p[n.id]=0,s=void 0,d.set(0,0,0),u=Infinity,h.setFromCoplanarPoints(f[n.vertexIds[0]],f[n.vertexIds[1]],f[n.vertexIds[2]]),h.projectPoint(t,c),t.copy(c);for(var g=v.pop();g;g=v.pop()){a.set(f[g.vertexIds[0]],f[g.vertexIds[1]],f[g.vertexIds[2]]),a.closestPointToPoint(t,c),c.distanceToSquared(t)<u&&(s=g,d.copy(c),u=c.distanceToSquared(t));var x=p[g];if(!(x>2))for(var I=0;I<g.neighbours.length;I++){var b=l[g.neighbours[I]];b.id in p||(v.push(b),p[b.id]=x+1)}}return i.copy(d),s}),exports.Pathfinding=f;


},{}],3:[function(require,module,exports){
'use strict';

require('./nav-mesh');
require('./nav-agent');
require('./system');

},{"./nav-agent":4,"./nav-mesh":5,"./system":6}],4:[function(require,module,exports){
'use strict';

module.exports = AFRAME.registerComponent('nav-agent', {
  schema: {
    destination: { type: 'vec3' },
    active: { default: false },
    speed: { default: 2 }
  },
  init: function init() {
    this.system = this.el.sceneEl.systems.nav;
    this.system.addAgent(this);
    this.group = null;
    this.path = [];
    this.raycaster = new THREE.Raycaster();
  },
  remove: function remove() {
    this.system.removeAgent(this);
  },
  update: function update() {
    this.path.length = 0;
  },
  updateNavLocation: function updateNavLocation() {
    this.group = null;
    this.path = [];
  },
  tick: function () {
    var vDest = new THREE.Vector3();
    var vDelta = new THREE.Vector3();
    var vNext = new THREE.Vector3();

    return function (t, dt) {
      var el = this.el;
      var data = this.data;
      var raycaster = this.raycaster;
      var speed = data.speed * dt / 1000;

      if (!data.active) return;

      // Use PatrolJS pathfinding system to get shortest path to target.
      if (!this.path.length) {
        var position = this.el.object3D.position;
        this.group = this.group || this.system.getGroup(position);
        this.path = this.system.getPath(position, vDest.copy(data.destination), this.group) || [];
        el.emit('navigation-start');
      }

      // If no path is found, exit.
      if (!this.path.length) {
        console.warn('[nav] Unable to find path to %o.', data.destination);
        this.el.setAttribute('nav-agent', { active: false });
        el.emit('navigation-end');
        return;
      }

      // Current segment is a vector from current position to next waypoint.
      var vCurrent = el.object3D.position;
      var vWaypoint = this.path[0];
      vDelta.subVectors(vWaypoint, vCurrent);

      var distance = vDelta.length();
      var gazeTarget = void 0;

      if (distance < speed) {
        // If <1 step from current waypoint, discard it and move toward next.
        this.path.shift();

        // After discarding the last waypoint, exit pathfinding.
        if (!this.path.length) {
          this.el.setAttribute('nav-agent', { active: false });
          el.emit('navigation-end');
          return;
        }

        vNext.copy(vCurrent);
        gazeTarget = this.path[0];
      } else {
        // If still far away from next waypoint, find next position for
        // the current frame.
        vNext.copy(vDelta.setLength(speed)).add(vCurrent);
        gazeTarget = vWaypoint;
      }

      // Look at the next waypoint.
      gazeTarget.y = vCurrent.y;
      el.object3D.lookAt(gazeTarget);

      // Raycast against the nav mesh, to keep the agent moving along the
      // ground, not traveling in a straight line from higher to lower waypoints.
      raycaster.ray.origin.copy(vNext);
      raycaster.ray.origin.y += 1.5;
      raycaster.ray.direction = { x: 0, y: -1, z: 0 };
      var intersections = raycaster.intersectObject(this.system.getNavMesh());

      if (!intersections.length) {
        // Raycasting failed. Step toward the waypoint and hope for the best.
        vCurrent.copy(vNext);
      } else {
        // Re-project next position onto nav mesh.
        vDelta.subVectors(intersections[0].point, vCurrent);
        vCurrent.add(vDelta.setLength(speed));
      }
    };
  }()
});

},{}],5:[function(require,module,exports){
'use strict';

/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */

module.exports = AFRAME.registerComponent('nav-mesh', {
  init: function init() {
    this.system = this.el.sceneEl.systems.nav;
    this.hasLoadedNavMesh = false;
    this.el.addEventListener('object3dset', this.loadNavMesh.bind(this));
  },

  play: function play() {
    if (!this.hasLoadedNavMesh) this.loadNavMesh();
  },

  loadNavMesh: function loadNavMesh() {
    var object = this.el.getObject3D('mesh');
    var scene = this.el.sceneEl.object3D;

    if (!object) return;

    var navMesh = void 0;
    object.traverse(function (node) {
      if (node.isMesh) navMesh = node;
    });

    if (!navMesh) return;

    var navMeshGeometry = navMesh.geometry.isBufferGeometry ? new THREE.Geometry().fromBufferGeometry(navMesh.geometry) : navMesh.geometry.clone();

    scene.updateMatrixWorld();
    navMeshGeometry.applyMatrix(navMesh.matrixWorld);
    this.system.setNavMeshGeometry(navMeshGeometry);

    this.hasLoadedNavMesh = true;
  }
});

},{}],6:[function(require,module,exports){
'use strict';

var _require = require('three-pathfinding'),
    Pathfinding = _require.Pathfinding;

var pathfinder = new Pathfinding();
var ZONE = 'level';

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
module.exports = AFRAME.registerSystem('nav', {
  init: function init() {
    this.navMesh = null;
    this.agents = new Set();
  },

  /**
   * @param {THREE.Geometry} geometry
   */
  setNavMeshGeometry: function setNavMeshGeometry(geometry) {
    this.navMesh = new THREE.Mesh(geometry);
    pathfinder.setZoneData(ZONE, Pathfinding.createZone(geometry));
    Array.from(this.agents).forEach(function (agent) {
      return agent.updateNavLocation();
    });
  },

  /**
   * @return {THREE.Mesh}
   */
  getNavMesh: function getNavMesh() {
    return this.navMesh;
  },

  /**
   * @param {NavAgent} ctrl
   */
  addAgent: function addAgent(ctrl) {
    this.agents.add(ctrl);
  },

  /**
   * @param {NavAgent} ctrl
   */
  removeAgent: function removeAgent(ctrl) {
    this.agents.delete(ctrl);
  },

  /**
   * @param  {THREE.Vector3} start
   * @param  {THREE.Vector3} end
   * @param  {number} groupID
   * @return {Array<THREE.Vector3>}
   */
  getPath: function getPath(start, end, groupID) {
    return this.navMesh ? pathfinder.findPath(start, end, ZONE, groupID) : null;
  },

  /**
   * @param {THREE.Vector3} position
   * @return {number}
   */
  getGroup: function getGroup(position) {
    return this.navMesh ? pathfinder.getGroup(ZONE, position) : null;
  },

  /**
   * @param  {THREE.Vector3} position
   * @param  {number} groupID
   * @return {Node}
   */
  getNode: function getNode(position, groupID) {
    return this.navMesh ? pathfinder.getClosestNode(position, ZONE, groupID, true) : null;
  },

  /**
   * @param  {THREE.Vector3} start Starting position.
   * @param  {THREE.Vector3} end Desired ending position.
   * @param  {number} groupID
   * @param  {Node} node
   * @param  {THREE.Vector3} endTarget (Output) Adjusted step end position.
   * @return {Node} Current node, after step is taken.
   */
  clampStep: function clampStep(start, end, groupID, node, endTarget) {
    if (!this.navMesh) {
      endTarget.copy(end);
      return null;
    } else if (!node) {
      endTarget.copy(end);
      return this.getNode(end, groupID);
    }
    return pathfinder.clampStep(start, end, node, ZONE, groupID, endTarget);
  }
});

},{"three-pathfinding":2}]},{},[1]);
