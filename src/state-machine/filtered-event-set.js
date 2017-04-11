const EventFilter = require('./EventFilter');

module.exports = AFRAME.registerComponent('filtered-event-set', {
  schema: {
    on: {default: ''},
    property: {default: ''},
    value: {default: ''}
  },
  init: function () {
    this.system = this.el.sceneEl.systems['state-machine'];
    this.fire = this.fire.bind(this);
  },
  update: function (prevData) {
    const machine = this.system.getStateMachine(this);
    const machineEl = machine.el;
    const data = this.data;

    const filter = EventFilter.parse(data.on);
    const prevFilter = EventFilter.parse(prevData.on);

    if (filter !== prevFilter) {
      if (prevFilter) prevFilter.unlisten(machineEl, this.fire);
      if (filter) filter.listen(machineEl, this.fire);
    }
  },
  remove: function () {
    const machine = this.system.getStateMachine(this);
    const machineEl = machine.el;
    const filter = EventFilter.parse(this.data.on);
    if (filter) filter.unlisten(machineEl, this.fire);
  },
  fire: function (e) {
    const stateMachine = this.system.getStateMachine(this);
    const data = this.data;
    let component;
    let property = data.property;
    let value = data.value;
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
