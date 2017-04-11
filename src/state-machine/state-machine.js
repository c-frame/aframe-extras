const Component = AFRAME.registerComponent('state-machine', {
  schema: {
    initial: {default: ''}
  },
  init: function () {
    this.state = this.data.initial;
  },
  remove: function () {
    this.el.removeState(this.state);
    this.state = '';
  },
  getState: function () {
    return this.state;
  },
  setState: function (state) {
    this.el.removeState(this.state);
    this.state = state;
    this.el.addState(this.state);
  },
  getStateEl: function () {
    if (!this.state) return null;
    return this.el.querySelector('a-state[name=' + this.state + ']');
  }
});

const System = AFRAME.registerSystem('state-machine', {
  getStateMachine: function (component) {
    return component.el.parentElement.components['state-machine'];
  }
});

module.exports = {
  Component: Component,
  System: System
};
