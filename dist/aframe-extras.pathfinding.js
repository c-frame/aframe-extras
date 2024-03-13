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
/* harmony export */   Pathfinding: () => (/* binding */ v),
/* harmony export */   PathfindingHelper: () => (/* binding */ w)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
class p{static roundNumber(t,e){const r=Math.pow(10,e);return Math.round(t*r)/r}static sample(t){return t[Math.floor(Math.random()*t.length)]}static distanceToSquared(t,e){var r=t.x-e.x,s=t.y-e.y,n=t.z-e.z;return r*r+s*s+n*n}static isPointInPoly(t,e){for(var r=!1,s=-1,n=t.length,o=n-1;++s<n;o=s)(t[s].z<=e.z&&e.z<t[o].z||t[o].z<=e.z&&e.z<t[s].z)&&e.x<(t[o].x-t[s].x)*(e.z-t[s].z)/(t[o].z-t[s].z)+t[s].x&&(r=!r);return r}static isVectorInPolygon(t,e,r){var s=1e5,n=-1e5,o=[];return e.vertexIds.forEach(t=>{s=Math.min(r[t].y,s),n=Math.max(r[t].y,n),o.push(r[t])}),!!(t.y<n+.5&&t.y>s-.5&&this.isPointInPoly(o,t))}static triarea2(t,e,r){return(r.x-t.x)*(e.z-t.z)-(e.x-t.x)*(r.z-t.z)}static vequal(t,e){return this.distanceToSquared(t,e)<1e-5}static mergeVertices(r,s=1e-4){s=Math.max(s,Number.EPSILON);for(var n={},o=r.getIndex(),i=r.getAttribute("position"),h=o?o.count:i.count,c=0,a=[],u=[],l=Math.log10(1/s),d=Math.pow(10,l),p=0;p<h;p++){var g=o?o.getX(p):p,f="";f+=~~(i.getX(g)*d)+",",f+=~~(i.getY(g)*d)+",",(f+=~~(i.getZ(g)*d)+",")in n?a.push(n[f]):(u.push(i.getX(g)),u.push(i.getY(g)),u.push(i.getZ(g)),n[f]=c,a.push(c),c++)}const v=new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(u),i.itemSize,i.normalized),b=new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry;return b.setAttribute("position",v),b.setIndex(a),b}}class g{constructor(t){this.content=[],this.scoreFunction=t}push(t){this.content.push(t),this.sinkDown(this.content.length-1)}pop(){const t=this.content[0],e=this.content.pop();return this.content.length>0&&(this.content[0]=e,this.bubbleUp(0)),t}remove(t){const e=this.content.indexOf(t),r=this.content.pop();e!==this.content.length-1&&(this.content[e]=r,this.scoreFunction(r)<this.scoreFunction(t)?this.sinkDown(e):this.bubbleUp(e))}size(){return this.content.length}rescoreElement(t){this.sinkDown(this.content.indexOf(t))}sinkDown(t){const e=this.content[t];for(;t>0;){const r=(t+1>>1)-1,s=this.content[r];if(!(this.scoreFunction(e)<this.scoreFunction(s)))break;this.content[r]=e,this.content[t]=s,t=r}}bubbleUp(t){const e=this.content.length,r=this.content[t],s=this.scoreFunction(r);for(;;){const n=t+1<<1,o=n-1;let i,h=null;if(o<e&&(i=this.scoreFunction(this.content[o]),i<s&&(h=o)),n<e&&this.scoreFunction(this.content[n])<(null===h?s:i)&&(h=n),null===h)break;this.content[t]=this.content[h],this.content[h]=r,t=h}}}class f{constructor(){this.portals=[]}push(t,e){void 0===e&&(e=t),this.portals.push({left:t,right:e})}stringPull(){const t=this.portals,e=[];let r,s,n,o=0,i=0,h=0;r=t[0].left,s=t[0].left,n=t[0].right,e.push(r);for(let c=1;c<t.length;c++){const a=t[c].left,u=t[c].right;if(p.triarea2(r,n,u)<=0){if(!(p.vequal(r,n)||p.triarea2(r,s,u)>0)){e.push(s),r=s,o=i,s=r,n=r,i=o,h=o,c=o;continue}n=u,h=c}if(p.triarea2(r,s,a)>=0){if(!(p.vequal(r,s)||p.triarea2(r,n,a)<0)){e.push(n),r=n,o=h,s=r,n=r,i=o,h=o,c=o;continue}s=a,i=c}}return 0!==e.length&&p.vequal(e[e.length-1],t[t.length-1].left)||e.push(t[t.length-1].left),this.path=e,e}}class v{constructor(){this.zones={}}static createZone(t,e=1e-4){return class{static buildZone(t,e){const s=this._buildNavigationMesh(t,e),n={};s.vertices.forEach(t=>{t.x=p.roundNumber(t.x,2),t.y=p.roundNumber(t.y,2),t.z=p.roundNumber(t.z,2)}),n.vertices=s.vertices;const o=this._buildPolygonGroups(s);return n.groups=new Array(o.length),o.forEach((t,e)=>{const s=new Map;t.forEach((t,e)=>{s.set(t,e)});const o=new Array(t.length);t.forEach((t,e)=>{const i=[];t.neighbours.forEach(t=>i.push(s.get(t)));const h=[];t.neighbours.forEach(e=>h.push(this._getSharedVerticesInOrder(t,e)));const c=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(0,0,0);c.add(n.vertices[t.vertexIds[0]]),c.add(n.vertices[t.vertexIds[1]]),c.add(n.vertices[t.vertexIds[2]]),c.divideScalar(3),c.x=p.roundNumber(c.x,2),c.y=p.roundNumber(c.y,2),c.z=p.roundNumber(c.z,2),o[e]={id:e,neighbours:i,vertexIds:t.vertexIds,centroid:c,portals:h}}),n.groups[e]=o}),n}static _buildNavigationMesh(t,e){return t=p.mergeVertices(t,e),this._buildPolygonsFromGeometry(t)}static _spreadGroupId(t){let e=new Set([t]);for(;e.size>0;){const r=e;e=new Set,r.forEach(r=>{r.group=t.group,r.neighbours.forEach(t=>{void 0===t.group&&e.add(t)})})}}static _buildPolygonGroups(t){const e=[];return t.polygons.forEach(t=>{void 0!==t.group?e[t.group].push(t):(t.group=e.length,this._spreadGroupId(t),e.push([t]))}),e}static _buildPolygonNeighbours(t,e){const r=new Set,s=e[t.vertexIds[1]],n=e[t.vertexIds[2]];return e[t.vertexIds[0]].forEach(e=>{e!==t&&(s.includes(e)||n.includes(e))&&r.add(e)}),s.forEach(e=>{e!==t&&n.includes(e)&&r.add(e)}),r}static _buildPolygonsFromGeometry(t){const e=[],s=[],n=t.attributes.position,o=t.index,i=[];for(let t=0;t<n.count;t++)s.push((new three__WEBPACK_IMPORTED_MODULE_0__.Vector3).fromBufferAttribute(n,t)),i[t]=[];for(let r=0;r<t.index.count;r+=3){const t=o.getX(r),s=o.getX(r+1),n=o.getX(r+2),h={vertexIds:[t,s,n],neighbours:null};e.push(h),i[t].push(h),i[s].push(h),i[n].push(h)}return e.forEach(t=>{t.neighbours=this._buildPolygonNeighbours(t,i)}),{polygons:e,vertices:s}}static _getSharedVerticesInOrder(t,e){const r=t.vertexIds,s=r[0],n=r[1],o=r[2],i=e.vertexIds,h=i.includes(s),c=i.includes(n),a=i.includes(o);return h&&c&&a?Array.from(r):h&&c?[s,n]:c&&a?[n,o]:h&&a?[o,s]:(console.warn("Error processing navigation mesh neighbors; neighbors with <2 shared vertices found."),[])}}.buildZone(t,e)}setZoneData(t,e){this.zones[t]=e}getRandomNode(t,e,s,n){if(!this.zones[t])return new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;s=s||null,n=n||0;const o=[];return this.zones[t].groups[e].forEach(t=>{s&&n?p.distanceToSquared(s,t.centroid)<n*n&&o.push(t.centroid):o.push(t.centroid)}),p.sample(o)||new three__WEBPACK_IMPORTED_MODULE_0__.Vector3}getClosestNode(t,e,r,s=!1){const n=this.zones[e].vertices;let o=null,i=Infinity;return this.zones[e].groups[r].forEach(e=>{const r=p.distanceToSquared(e.centroid,t);r<i&&(!s||p.isVectorInPolygon(t,e,n))&&(o=e,i=r)}),o}findPath(t,e,s,n){const o=this.zones[s].groups[n],i=this.zones[s].vertices,h=this.getClosestNode(t,s,n,!0),c=this.getClosestNode(e,s,n,!0);if(!h||!c)return null;const a=class{static init(t){for(let e=0;e<t.length;e++){const r=t[e];r.f=0,r.g=0,r.h=0,r.cost=1,r.visited=!1,r.closed=!1,r.parent=null}}static cleanUp(t){for(let e=0;e<t.length;e++){const r=t[e];delete r.f,delete r.g,delete r.h,delete r.cost,delete r.visited,delete r.closed,delete r.parent}}static heap(){return new g(function(t){return t.f})}static search(t,e,r){this.init(t);const s=this.heap();for(s.push(e);s.size()>0;){const e=s.pop();if(e===r){let t=e;const r=[];for(;t.parent;)r.push(t),t=t.parent;return this.cleanUp(r),r.reverse()}e.closed=!0;const n=this.neighbours(t,e);for(let t=0,o=n.length;t<o;t++){const o=n[t];if(o.closed)continue;const i=e.g+o.cost,h=o.visited;if(!h||i<o.g){if(o.visited=!0,o.parent=e,!o.centroid||!r.centroid)throw new Error("Unexpected state");o.h=o.h||this.heuristic(o.centroid,r.centroid),o.g=i,o.f=o.g+o.h,h?s.rescoreElement(o):s.push(o)}}}return[]}static heuristic(t,e){return p.distanceToSquared(t,e)}static neighbours(t,e){const r=[];for(let s=0;s<e.neighbours.length;s++)r.push(t[e.neighbours[s]]);return r}}.search(o,h,c),u=function(t,e){for(var r=0;r<t.neighbours.length;r++)if(t.neighbours[r]===e.id)return t.portals[r]},l=new f;l.push(t);for(let t=0;t<a.length;t++){const e=a[t],r=a[t+1];if(r){const t=u(e,r);l.push(i[t[0]],i[t[1]])}}l.push(e),l.stringPull();const d=l.path.map(t=>new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(t.x,t.y,t.z));return d.shift(),d}}v.prototype.getGroup=function(){const t=new three__WEBPACK_IMPORTED_MODULE_0__.Plane;return function(e,r,s=!1){if(!this.zones[e])return null;let n=null,o=Math.pow(50,2);const i=this.zones[e];for(let e=0;e<i.groups.length;e++){const h=i.groups[e];for(const c of h){if(s&&(t.setFromCoplanarPoints(i.vertices[c.vertexIds[0]],i.vertices[c.vertexIds[1]],i.vertices[c.vertexIds[2]]),Math.abs(t.distanceToPoint(r))<.01)&&p.isPointInPoly([i.vertices[c.vertexIds[0]],i.vertices[c.vertexIds[1]],i.vertices[c.vertexIds[2]]],r))return e;const h=p.distanceToSquared(c.centroid,r);h<o&&(n=e,o=h)}}return n}}(),v.prototype.clampStep=function(){const t=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3,e=new three__WEBPACK_IMPORTED_MODULE_0__.Plane,o=new three__WEBPACK_IMPORTED_MODULE_0__.Triangle,i=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;let h,c,a=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;return function(r,s,n,u,l,d){const p=this.zones[u].vertices,g=this.zones[u].groups[l],f=[n],v={};v[n.id]=0,h=void 0,a.set(0,0,0),c=Infinity,e.setFromCoplanarPoints(p[n.vertexIds[0]],p[n.vertexIds[1]],p[n.vertexIds[2]]),e.projectPoint(s,t),i.copy(t);for(let e=f.pop();e;e=f.pop()){o.set(p[e.vertexIds[0]],p[e.vertexIds[1]],p[e.vertexIds[2]]),o.closestPointToPoint(i,t),t.distanceToSquared(i)<c&&(h=e,a.copy(t),c=t.distanceToSquared(i));const r=v[e.id];if(!(r>2))for(let t=0;t<e.neighbours.length;t++){const s=g[e.neighbours[t]];s.id in v||(f.push(s),v[s.id]=r+1)}}return d.copy(a),h}}();const b={PLAYER:new three__WEBPACK_IMPORTED_MODULE_0__.Color(15631215).convertSRGBToLinear().getHex(),TARGET:new three__WEBPACK_IMPORTED_MODULE_0__.Color(14469912).convertSRGBToLinear().getHex(),PATH:new three__WEBPACK_IMPORTED_MODULE_0__.Color(41903).convertSRGBToLinear().getHex(),WAYPOINT:new three__WEBPACK_IMPORTED_MODULE_0__.Color(41903).convertSRGBToLinear().getHex(),CLAMPED_STEP:new three__WEBPACK_IMPORTED_MODULE_0__.Color(14472114).convertSRGBToLinear().getHex(),CLOSEST_NODE:new three__WEBPACK_IMPORTED_MODULE_0__.Color(4417387).convertSRGBToLinear().getHex()};class w extends three__WEBPACK_IMPORTED_MODULE_0__.Object3D{constructor(){super(),this._playerMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.SphereGeometry(.25,32,32),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:b.PLAYER})),this._targetMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(.3,.3,.3),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:b.TARGET})),this._nodeMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(.1,.8,.1),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:b.CLOSEST_NODE})),this._stepMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(.1,1,.1),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:b.CLAMPED_STEP})),this._pathMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Object3D,this._pathLineMaterial=new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial({color:b.PATH,linewidth:2}),this._pathPointMaterial=new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:b.WAYPOINT}),this._pathPointGeometry=new three__WEBPACK_IMPORTED_MODULE_0__.SphereGeometry(.08),this._markers=[this._playerMarker,this._targetMarker,this._nodeMarker,this._stepMarker,this._pathMarker],this._markers.forEach(t=>{t.visible=!1,this.add(t)})}setPath(r){for(;this._pathMarker.children.length;)this._pathMarker.children[0].visible=!1,this._pathMarker.remove(this._pathMarker.children[0]);r=[this._playerMarker.position].concat(r);const s=new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry;s.setAttribute("position",new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(3*r.length),3));for(let t=0;t<r.length;t++)s.attributes.position.setXYZ(t,r[t].x,r[t].y+.2,r[t].z);this._pathMarker.add(new three__WEBPACK_IMPORTED_MODULE_0__.Line(s,this._pathLineMaterial));for(let t=0;t<r.length-1;t++){const e=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(this._pathPointGeometry,this._pathPointMaterial);e.position.copy(r[t]),e.position.y+=.2,this._pathMarker.add(e)}return this._pathMarker.visible=!0,this}setPlayerPosition(t){return this._playerMarker.position.copy(t),this._playerMarker.visible=!0,this}setTargetPosition(t){return this._targetMarker.position.copy(t),this._targetMarker.visible=!0,this}setNodePosition(t){return this._nodeMarker.position.copy(t),this._nodeMarker.visible=!0,this}setStepPosition(t){return this._stepMarker.position.copy(t),this._stepMarker.visible=!0,this}reset(){for(;this._pathMarker.children.length;)this._pathMarker.children[0].visible=!1,this._pathMarker.remove(this._pathMarker.children[0]);return this._markers.forEach(t=>{t.visible=!1}),this}}
//# sourceMappingURL=three-pathfinding.module.js.map


/***/ }),

/***/ "./src/pathfinding/nav-agent.js":
/*!**************************************!*\
  !*** ./src/pathfinding/nav-agent.js ***!
  \**************************************/
/***/ ((module) => {

module.exports = AFRAME.registerComponent('nav-agent', {
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
/***/ ((module) => {

/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */
module.exports = AFRAME.registerComponent('nav-mesh', {
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
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { Pathfinding } = __webpack_require__(/*! three-pathfinding */ "./node_modules/three-pathfinding/dist/three-pathfinding.module.js");

const pathfinder = new Pathfinding();
const ZONE = 'level';

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
module.exports = AFRAME.registerSystem('nav', {
  init: function () {
    this.navMesh = null;
    this.agents = new Set();
  },

  /**
   * @param {THREE.Geometry} geometry
   */
  setNavMeshGeometry: function (geometry) {
    this.navMesh = new THREE.Mesh(geometry);
    pathfinder.setZoneData(ZONE, Pathfinding.createZone(geometry));
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
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************************!*\
  !*** ./src/pathfinding/index.js ***!
  \**********************************/
__webpack_require__(/*! ./nav-mesh */ "./src/pathfinding/nav-mesh.js");
__webpack_require__(/*! ./nav-agent */ "./src/pathfinding/nav-agent.js");
__webpack_require__(/*! ./system */ "./src/pathfinding/system.js");

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=aframe-extras.pathfinding.js.map