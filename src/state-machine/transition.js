const EventFilter = require('./EventFilter');

module.exports = AFRAME.registerComponent('transition', {
  schema: {
    on: {default: ''},
    state: {default: ''}
  },
  init: function () {
    this.system = this.el.sceneEl.systems['state-machine'];
    this.fire = this.fire.bind(this);
    this.filter = null;
  },
  update: function () {
    this.play();
  },
  remove: function () {
    this.pause();
  },
  play: function () {
    const machine = this.system.getStateMachine(this);
    const machineEl = machine.el;
    const data = this.data;

    const filter = EventFilter.parse(data.on);
    if (filter !== this.filter) {
      if (this.filter) this.filter.unlisten(machineEl, this.fire);
      if (filter) filter.listen(machineEl, this.fire);
      this.filter = filter;
    }
  },
  pause: function () {
    const machine = this.system.getStateMachine(this);
    const machineEl = machine.el;
    if (this.filter) this.filter.unlisten(machineEl, this.fire);
    this.filter = null;
  },
  fire: function () {
    const stateMachine = this.system.getStateMachine(this);
    stateMachine.setState(this.data.state);
  }
});
