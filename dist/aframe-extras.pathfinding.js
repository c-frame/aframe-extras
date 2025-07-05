(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("THREE"));
	else if(typeof define === 'function' && define.amd)
		define(["THREE"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("THREE")) : factory(root["THREE"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, (__WEBPACK_EXTERNAL_MODULE_three__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/three-pathfinding/dist/three-pathfinding.module.js":
/*!*************************************************************************!*\
  !*** ./node_modules/three-pathfinding/dist/three-pathfinding.module.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pathfinding: () => (/* binding */ f),
/* harmony export */   PathfindingHelper: () => (/* binding */ v)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
class d{static roundNumber(t,e){const s=Math.pow(10,e);return Math.round(t*s)/s}static sample(t){return t[Math.floor(Math.random()*t.length)]}static distanceToSquared(t,e){var s=t.x-e.x,r=t.y-e.y,n=t.z-e.z;return s*s+r*r+n*n}static isPointInPoly(t,e){for(var s=!1,r=-1,n=t.length,o=n-1;++r<n;o=r)(t[r].z<=e.z&&e.z<t[o].z||t[o].z<=e.z&&e.z<t[r].z)&&e.x<(t[o].x-t[r].x)*(e.z-t[r].z)/(t[o].z-t[r].z)+t[r].x&&(s=!s);return s}static isVectorInPolygon(t,e,s){var r=1e5,n=-1e5,o=[];return e.vertexIds.forEach(t=>{r=Math.min(s[t].y,r),n=Math.max(s[t].y,n),o.push(s[t])}),!!(t.y<n+.5&&t.y>r-.5&&this.isPointInPoly(o,t))}static triarea2(t,e,s){return(s.x-t.x)*(e.z-t.z)-(e.x-t.x)*(s.z-t.z)}static vequal(t,e){return this.distanceToSquared(t,e)<1e-5}static mergeVertices(s,r=1e-4){r=Math.max(r,Number.EPSILON);for(var n={},o=s.getIndex(),i=s.getAttribute("position"),h=o?o.count:i.count,c=0,a=[],u=[],l=Math.log10(1/r),d=Math.pow(10,l),p=0;p<h;p++){var g=o?o.getX(p):p,f="";f+=~~(i.getX(g)*d)+",",f+=~~(i.getY(g)*d)+",",(f+=~~(i.getZ(g)*d)+",")in n?a.push(n[f]):(u.push(i.getX(g)),u.push(i.getY(g)),u.push(i.getZ(g)),n[f]=c,a.push(c),c++)}const v=new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(u),i.itemSize,i.normalized),b=new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry;return b.setAttribute("position",v),b.setIndex(a),b}}class p{constructor(t){this.content=[],this.scoreFunction=t}push(t){this.content.push(t),this.sinkDown(this.content.length-1)}pop(){const t=this.content[0],e=this.content.pop();return this.content.length>0&&(this.content[0]=e,this.bubbleUp(0)),t}remove(t){const e=this.content.indexOf(t),s=this.content.pop();e!==this.content.length-1&&(this.content[e]=s,this.scoreFunction(s)<this.scoreFunction(t)?this.sinkDown(e):this.bubbleUp(e))}size(){return this.content.length}rescoreElement(t){this.sinkDown(this.content.indexOf(t))}sinkDown(t){const e=this.content[t];for(;t>0;){const s=(t+1>>1)-1,r=this.content[s];if(!(this.scoreFunction(e)<this.scoreFunction(r)))break;this.content[s]=e,this.content[t]=r,t=s}}bubbleUp(t){const e=this.content.length,s=this.content[t],r=this.scoreFunction(s);for(;;){const n=t+1<<1,o=n-1;let i,h=null;if(o<e&&(i=this.scoreFunction(this.content[o]),i<r&&(h=o)),n<e&&this.scoreFunction(this.content[n])<(null===h?r:i)&&(h=n),null===h)break;this.content[t]=this.content[h],this.content[h]=s,t=h}}}class g{constructor(){this.portals=[]}push(t,e){void 0===e&&(e=t),this.portals.push({left:t,right:e})}stringPull(){const t=this.portals,e=[];let s,r,n,o=0,i=0,h=0;s=t[0].left,r=t[0].left,n=t[0].right,e.push(s);for(let c=1;c<t.length;c++){const a=t[c].left,u=t[c].right;if(d.triarea2(s,n,u)<=0){if(!(d.vequal(s,n)||d.triarea2(s,r,u)>0)){e.push(r),s=r,o=i,r=s,n=s,i=o,h=o,c=o;continue}n=u,h=c}if(d.triarea2(s,r,a)>=0){if(!(d.vequal(s,r)||d.triarea2(s,n,a)<0)){e.push(n),s=n,o=h,r=s,n=s,i=o,h=o,c=o;continue}r=a,i=c}}return 0!==e.length&&d.vequal(e[e.length-1],t[t.length-1].left)||e.push(t[t.length-1].left),this.path=e,e}}class f{constructor(){this.zones={}}static createZone(t,e=1e-4){return class{static buildZone(t,e){const r=this._buildNavigationMesh(t,e),n={};r.vertices.forEach(t=>{t.x=d.roundNumber(t.x,2),t.y=d.roundNumber(t.y,2),t.z=d.roundNumber(t.z,2)}),n.vertices=r.vertices;const o=this._buildPolygonGroups(r);return n.groups=new Array(o.length),o.forEach((t,e)=>{const r=new Map;t.forEach((t,e)=>{r.set(t,e)});const o=new Array(t.length);t.forEach((t,e)=>{const i=[];t.neighbours.forEach(t=>i.push(r.get(t)));const h=[];t.neighbours.forEach(e=>h.push(this._getSharedVerticesInOrder(t,e)));const c=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(0,0,0);c.add(n.vertices[t.vertexIds[0]]),c.add(n.vertices[t.vertexIds[1]]),c.add(n.vertices[t.vertexIds[2]]),c.divideScalar(3),c.x=d.roundNumber(c.x,2),c.y=d.roundNumber(c.y,2),c.z=d.roundNumber(c.z,2),o[e]={id:e,neighbours:i,vertexIds:t.vertexIds,centroid:c,portals:h}}),n.groups[e]=o}),n}static _buildNavigationMesh(t,e){return t=d.mergeVertices(t,e),this._buildPolygonsFromGeometry(t)}static _spreadGroupId(t){let e=new Set([t]);for(;e.size>0;){const s=e;e=new Set,s.forEach(s=>{s.group=t.group,s.neighbours.forEach(t=>{void 0===t.group&&e.add(t)})})}}static _buildPolygonGroups(t){const e=[];return t.polygons.forEach(t=>{void 0!==t.group?e[t.group].push(t):(t.group=e.length,this._spreadGroupId(t),e.push([t]))}),e}static _buildPolygonNeighbours(t,e){const s=new Set,r=e[t.vertexIds[1]],n=e[t.vertexIds[2]];return e[t.vertexIds[0]].forEach(e=>{e!==t&&(r.includes(e)||n.includes(e))&&s.add(e)}),r.forEach(e=>{e!==t&&n.includes(e)&&s.add(e)}),s}static _buildPolygonsFromGeometry(t){const e=[],r=[],n=t.attributes.position,o=t.index,i=[];for(let t=0;t<n.count;t++)r.push((new three__WEBPACK_IMPORTED_MODULE_0__.Vector3).fromBufferAttribute(n,t)),i[t]=[];for(let s=0;s<t.index.count;s+=3){const t=o.getX(s),r=o.getX(s+1),n=o.getX(s+2),h={vertexIds:[t,r,n],neighbours:null};e.push(h),i[t].push(h),i[r].push(h),i[n].push(h)}return e.forEach(t=>{t.neighbours=this._buildPolygonNeighbours(t,i)}),{polygons:e,vertices:r}}static _getSharedVerticesInOrder(t,e){const s=t.vertexIds,r=s[0],n=s[1],o=s[2],i=e.vertexIds,h=i.includes(r),c=i.includes(n),a=i.includes(o);return h&&c&&a?Array.from(s):h&&c?[r,n]:c&&a?[n,o]:h&&a?[o,r]:(console.warn("Error processing navigation mesh neighbors; neighbors with <2 shared vertices found."),[])}}.buildZone(t,e)}setZoneData(t,e){this.zones[t]=e}getRandomNode(t,e,r,n){if(!this.zones[t])return new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;r=r||null,n=n||0;const o=[];return this.zones[t].groups[e].forEach(t=>{r&&n?d.distanceToSquared(r,t.centroid)<n*n&&o.push(t.centroid):o.push(t.centroid)}),d.sample(o)||new three__WEBPACK_IMPORTED_MODULE_0__.Vector3}getClosestNode(t,e,s,r=!1){const n=this.zones[e].vertices;let o=null,i=Infinity;return this.zones[e].groups[s].forEach(e=>{const s=d.distanceToSquared(e.centroid,t);s<i&&(!r||d.isVectorInPolygon(t,e,n))&&(o=e,i=s)}),o}findPath(t,e,r,n){const o=this.zones[r].groups[n],i=this.zones[r].vertices,h=this.getClosestNode(t,r,n,!0),c=this.getClosestNode(e,r,n,!0);if(!h||!c)return null;const a=class{static init(t){for(let e=0;e<t.length;e++){const s=t[e];s.f=0,s.g=0,s.h=0,s.cost=1,s.visited=!1,s.closed=!1,s.parent=null}}static cleanUp(t){for(let e=0;e<t.length;e++){const s=t[e];delete s.f,delete s.g,delete s.h,delete s.cost,delete s.visited,delete s.closed,delete s.parent}}static heap(){return new p(function(t){return t.f})}static search(t,e,s){this.init(t);const r=this.heap();for(r.push(e);r.size()>0;){const e=r.pop();if(e===s){let t=e;const s=[];for(;t.parent;)s.push(t),t=t.parent;return this.cleanUp(s),s.reverse()}e.closed=!0;const n=this.neighbours(t,e);for(let t=0,o=n.length;t<o;t++){const o=n[t];if(o.closed)continue;const i=e.g+o.cost,h=o.visited;if(!h||i<o.g){if(o.visited=!0,o.parent=e,!o.centroid||!s.centroid)throw new Error("Unexpected state");o.h=o.h||this.heuristic(o.centroid,s.centroid),o.g=i,o.f=o.g+o.h,h?r.rescoreElement(o):r.push(o)}}}return[]}static heuristic(t,e){return d.distanceToSquared(t,e)}static neighbours(t,e){const s=[];for(let r=0;r<e.neighbours.length;r++)s.push(t[e.neighbours[r]]);return s}}.search(o,h,c),u=function(t,e){for(var s=0;s<t.neighbours.length;s++)if(t.neighbours[s]===e.id)return t.portals[s]},l=new g;l.push(t);for(let t=0;t<a.length;t++){const e=a[t],s=a[t+1];if(s){const t=u(e,s);l.push(i[t[0]],i[t[1]])}}l.push(e),l.stringPull();const f=l.path.map(t=>new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(t.x,t.y,t.z));return f.shift(),f}}f.prototype.getGroup=function(){const t=new three__WEBPACK_IMPORTED_MODULE_0__.Plane;return function(e,s,r=!1){if(!this.zones[e])return null;let n=null,o=Math.pow(50,2);const i=this.zones[e];for(let e=0;e<i.groups.length;e++){const h=i.groups[e];for(const c of h){if(r&&(t.setFromCoplanarPoints(i.vertices[c.vertexIds[0]],i.vertices[c.vertexIds[1]],i.vertices[c.vertexIds[2]]),Math.abs(t.distanceToPoint(s))<.01)&&d.isPointInPoly([i.vertices[c.vertexIds[0]],i.vertices[c.vertexIds[1]],i.vertices[c.vertexIds[2]]],s))return e;const h=d.distanceToSquared(c.centroid,s);h<o&&(n=e,o=h)}}return n}}(),f.prototype.clampStep=function(){const t=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3,e=new three__WEBPACK_IMPORTED_MODULE_0__.Plane,o=new three__WEBPACK_IMPORTED_MODULE_0__.Triangle,i=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;let h,c,a=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;return function(s,r,n,u,l,d){const p=this.zones[u].vertices,g=this.zones[u].groups[l],f=[n],v={};v[n.id]=0,h=void 0,a.set(0,0,0),c=Infinity,e.setFromCoplanarPoints(p[n.vertexIds[0]],p[n.vertexIds[1]],p[n.vertexIds[2]]),e.projectPoint(r,t),i.copy(t);for(let e=f.pop();e;e=f.pop()){o.set(p[e.vertexIds[0]],p[e.vertexIds[1]],p[e.vertexIds[2]]),o.closestPointToPoint(i,t),t.distanceToSquared(i)<c&&(h=e,a.copy(t),c=t.distanceToSquared(i));const s=v[e.id];if(!(s>2))for(let t=0;t<e.neighbours.length;t++){const r=g[e.neighbours[t]];r.id in v||(f.push(r),v[r.id]=s+1)}}return d.copy(a),h}}();class v extends three__WEBPACK_IMPORTED_MODULE_0__.Object3D{constructor(){super(),this._playerMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.SphereGeometry(.25,32,32),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:15631215})),this._targetMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(.3,.3,.3),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:14469912})),this._nodeMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(.1,.8,.1),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:4417387})),this._stepMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(.1,1,.1),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:14472114})),this._pathMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Object3D,this._pathLineMaterial=new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial({color:41903,linewidth:2}),this._pathPointMaterial=new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:41903}),this._pathPointGeometry=new three__WEBPACK_IMPORTED_MODULE_0__.SphereGeometry(.08),this._markers=[this._playerMarker,this._targetMarker,this._nodeMarker,this._stepMarker,this._pathMarker],this._markers.forEach(t=>{t.visible=!1,this.add(t)})}setPath(s){for(;this._pathMarker.children.length;)this._pathMarker.children[0].visible=!1,this._pathMarker.remove(this._pathMarker.children[0]);s=[this._playerMarker.position].concat(s);const r=new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry;r.setAttribute("position",new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(3*s.length),3));for(let t=0;t<s.length;t++)r.attributes.position.setXYZ(t,s[t].x,s[t].y+.2,s[t].z);this._pathMarker.add(new three__WEBPACK_IMPORTED_MODULE_0__.Line(r,this._pathLineMaterial));for(let t=0;t<s.length-1;t++){const e=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(this._pathPointGeometry,this._pathPointMaterial);e.position.copy(s[t]),e.position.y+=.2,this._pathMarker.add(e)}return this._pathMarker.visible=!0,this}setPlayerPosition(t){return this._playerMarker.position.copy(t),this._playerMarker.visible=!0,this}setTargetPosition(t){return this._targetMarker.position.copy(t),this._targetMarker.visible=!0,this}setNodePosition(t){return this._nodeMarker.position.copy(t),this._nodeMarker.visible=!0,this}setStepPosition(t){return this._stepMarker.position.copy(t),this._stepMarker.visible=!0,this}reset(){for(;this._pathMarker.children.length;)this._pathMarker.children[0].visible=!1,this._pathMarker.remove(this._pathMarker.children[0]);return this._markers.forEach(t=>{t.visible=!1}),this}}
//# sourceMappingURL=three-pathfinding.module.js.map


/***/ }),

/***/ "./src/pathfinding/nav-agent.js":
/*!**************************************!*\
  !*** ./src/pathfinding/nav-agent.js ***!
  \**************************************/
/***/ (() => {

AFRAME.registerComponent('nav-agent', {
  schema: {
    destination: {type: 'vec3'},
    active: {default: false},
    speed: {default: 2}
  },
  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    this.system.addAgent(this);
    this.group = null;
    this.path = [];
    this.raycaster = new THREE.Raycaster();
  },
  remove: function () {
    this.system.removeAgent(this);
  },
  update: function () {
    this.path.length = 0;
  },
  updateNavLocation: function () {
    this.group = null;
    this.path = [];
  },
  tick: (function () {
    const vDest = new THREE.Vector3();
    const vDelta = new THREE.Vector3();
    const vNext = new THREE.Vector3();

    return function (t, dt) {
      const el = this.el;
      const data = this.data;
      const raycaster = this.raycaster;
      const speed = data.speed * dt / 1000;

      if (!data.active) return;

      // Use PatrolJS pathfinding system to get shortest path to target.
      if (!this.path.length) {
        const position = this.el.object3D.position;
        this.group = this.group || this.system.getGroup(position);
        this.path = this.system.getPath(position, vDest.copy(data.destination), this.group) || [];
        el.emit('navigation-start');
      }

      // If no path is found, exit.
      if (!this.path.length) {
        console.warn('[nav] Unable to find path to %o.', data.destination);
        this.el.setAttribute('nav-agent', {active: false});
        el.emit('navigation-end');
        return;
      }

      // Current segment is a vector from current position to next waypoint.
      const vCurrent = el.object3D.position;
      const vWaypoint = this.path[0];
      vDelta.subVectors(vWaypoint, vCurrent);

      const distance = vDelta.length();
      let gazeTarget;

      if (distance < speed) {
        // If <1 step from current waypoint, discard it and move toward next.
        this.path.shift();

        // After discarding the last waypoint, exit pathfinding.
        if (!this.path.length) {
          this.el.setAttribute('nav-agent', {active: false});
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
      raycaster.ray.direction = {x:0, y:-1, z:0};
      const intersections = raycaster.intersectObject(this.system.getNavMesh());

      if (!intersections.length) {
        // Raycasting failed. Step toward the waypoint and hope for the best.
        vCurrent.copy(vNext);
      } else {
        // Re-project next position onto nav mesh.
        vDelta.subVectors(intersections[0].point, vCurrent);
        vCurrent.add(vDelta.setLength(speed));
      }

    };
  }())
});


/***/ }),

/***/ "./src/pathfinding/nav-mesh.js":
/*!*************************************!*\
  !*** ./src/pathfinding/nav-mesh.js ***!
  \*************************************/
/***/ (() => {

/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */
AFRAME.registerComponent('nav-mesh', {
  schema: {
    nodeName: {type: 'string'}
  },

  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    this.hasLoadedNavMesh = false;
    this.nodeName = this.data.nodeName;
    this.el.addEventListener('object3dset', this.loadNavMesh.bind(this));
  },

  play: function () {
    if (!this.hasLoadedNavMesh) this.loadNavMesh();
  },

  loadNavMesh: function () {
    var self = this;
    const object = this.el.getObject3D('mesh');
    const scene = this.el.sceneEl.object3D;

    if (!object) return;

    let navMesh;
    object.traverse((node) => {
      if (node.isMesh &&
          (!self.nodeName || node.name === self.nodeName)) navMesh = node;
    });

    if (!navMesh) return;

    const navMeshGeometry = navMesh.geometry.clone();
    navMesh.updateWorldMatrix(true, false);
    navMeshGeometry.applyMatrix4(navMesh.matrixWorld);
    this.system.setNavMeshGeometry(navMeshGeometry);
    this.hasLoadedNavMesh = true;
  }
});


/***/ }),

/***/ "./src/pathfinding/system.js":
/*!***********************************!*\
  !*** ./src/pathfinding/system.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three_pathfinding__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three-pathfinding */ "./node_modules/three-pathfinding/dist/three-pathfinding.module.js");


const pathfinder = new three_pathfinding__WEBPACK_IMPORTED_MODULE_0__.Pathfinding();
const ZONE = 'level';

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
AFRAME.registerSystem('nav', {
  init: function () {
    this.navMesh = null;
    this.agents = new Set();
  },

  /**
   * @param {THREE.Geometry} geometry
   */
  setNavMeshGeometry: function (geometry) {
    this.navMesh = new THREE.Mesh(geometry);
    pathfinder.setZoneData(ZONE, three_pathfinding__WEBPACK_IMPORTED_MODULE_0__.Pathfinding.createZone(geometry));
    Array.from(this.agents).forEach((agent) => agent.updateNavLocation());
  },

  /**
   * @return {THREE.Mesh}
   */
  getNavMesh: function () {
    return this.navMesh;
  },

  /**
   * @param {NavAgent} ctrl
   */
  addAgent: function (ctrl) {
    this.agents.add(ctrl);
  },

  /**
   * @param {NavAgent} ctrl
   */
  removeAgent: function (ctrl) {
    this.agents.delete(ctrl);
  },

  /**
   * @param  {THREE.Vector3} start
   * @param  {THREE.Vector3} end
   * @param  {number} groupID
   * @return {Array<THREE.Vector3>}
   */
  getPath: function (start, end, groupID) {
    return this.navMesh
      ? pathfinder.findPath(start, end, ZONE, groupID)
      : null;
  },

  /**
   * @param {THREE.Vector3} position
   * @return {number}
   */
  getGroup: function (position) {
    return this.navMesh
      ? pathfinder.getGroup(ZONE, position)
      : null;
  },

  /**
   * @param  {THREE.Vector3} position
   * @param  {number} groupID
   * @return {Node}
   */
  getNode: function (position, groupID) {
    return this.navMesh
      ? pathfinder.getClosestNode(position, ZONE, groupID, true)
      : null;
  },

  /**
   * @param  {THREE.Vector3} start Starting position.
   * @param  {THREE.Vector3} end Desired ending position.
   * @param  {number} groupID
   * @param  {Node} node
   * @param  {THREE.Vector3} endTarget (Output) Adjusted step end position.
   * @return {Node} Current node, after step is taken.
   */
  clampStep: function (start, end, groupID, node, endTarget) {
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


/***/ }),

/***/ "three":
/*!************************!*\
  !*** external "THREE" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_three__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!**********************************!*\
  !*** ./src/pathfinding/index.js ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nav_mesh_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./nav-mesh.js */ "./src/pathfinding/nav-mesh.js");
/* harmony import */ var _nav_mesh_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_nav_mesh_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nav_agent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./nav-agent.js */ "./src/pathfinding/nav-agent.js");
/* harmony import */ var _nav_agent_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_nav_agent_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _system_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./system.js */ "./src/pathfinding/system.js");




})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=aframe-extras.pathfinding.js.map