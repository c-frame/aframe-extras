module.exports = AFRAME.registerComponent('state-added', {
  schema: {
    set: {default: ''},
    to: {default: ''}
  },
  init: function () {
    this.system = this.el.sceneEl.systems['state-machine'];
    this.eventType = 'stateadded';
    this.fire = this.fire.bind(this);
    this.onStateChanged = this.onStateChanged.bind(this);
  },
  play: function () {
    const stateMachine = this.system.getStateMachine(this);
    stateMachine.el.addEventListener(this.eventType, this.onStateChanged);
  },
  pause: function () {
    const stateMachine = this.system.getStateMachine(this);
    stateMachine.el.removeEventListener(this.eventType, this.onStateChanged);
  },
  onStateChanged: function (e) {
    const state = typeof e.detail === 'string' ? e.detail : e.detail.state;
    if (state === this.el.getAttribute('name')) {
      this.fire(e);
    }
  },
  fire: function (e) {
    const stateMachine = this.system.getStateMachine(this);
    const data = this.data;
    let property = data.set;
    let value = data.to;
    let component;
    if (value.indexOf('.') >= 0) {
      const eventValue = value.split('.');
      value = e.detail[eventValue[1]];
    }
    if (property.indexOf('.') >= 0) {
      const componentProperty = property.split('.');
      component = componentProperty[0];
      property = componentProperty[1];
      stateMachine.el.setAttribute(component, property, value);
    } else {
      stateMachine.el.setAttribute(property, value);
    }
  },
});
