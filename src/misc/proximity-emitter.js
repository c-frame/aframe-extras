module.exports = AFRAME.registerComponent('proximity-emitter', {
  schema: {
    filter: {default: ''},
    distance: {default: 0, min: 0},
    event: {default: ''}
  },
  init: function () {
    this.nearSet = new Set();
  },
  tick: function () {
    const el = this.el;
    const data = this.data;
    const nearSet = this.nearSet;
    const els = [].slice.call(el.sceneEl.querySelectorAll(data.filter));

    const position = el.object3D.getWorldPosition();
    els.forEach((otherEl) => {
      const otherPosition = otherEl.object3D.getWorldPosition();
      const distance = position.distanceTo(otherPosition);
      const isNear = distance <= data.distance;
      if (isNear && !nearSet.has(otherEl)) {
        nearSet.add(otherEl);
        el.emit(data.event + 'start', {el: otherEl, distance: distance});
        otherEl.emit(data.event + 'start', {el: el, distance: distance});
      } else if (!isNear && nearSet.has(otherEl)) {
        nearSet.delete(otherEl);
        el.emit(data.event + 'end', {el: otherEl, distance: distance});
        otherEl.emit(data.event + 'end', {el: el, distance: distance});
      }
    });
  }
});
