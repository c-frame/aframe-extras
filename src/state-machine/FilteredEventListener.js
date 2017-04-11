const expr = require('expression-eval');

/**
 * Class for filtering events based on arbitrary expressions. For example, to
 * only return 'keypress' events that match a particular key, or 'statechange'
 * events that result in a particular state.
 *
 * Syntax: "<type> | <expression>"
 *
 * Example: "statechanged | detail.state === 'active'"
 *
 * Usage:
 *
 * ```
 * var listener = new FilteredEventListener('keypress | key === "A"');
 * var callback = (e) => { ... };
 * listener.listen(el, callback);
 * listener.unlisten(el, callback);
 * ```
 *
 * @param {string} input
 */
class FilteredEventListener {
  constructor (input) {
    this.input = input;

    const parts = input.match(/^([^|]+)(?: \|(.*))?$/);
    this.type = parts[1];
    this.expression = parts[2];

    if (!this.type) {
      throw new Error('[filtered-event] Could not parse: "' + input + '"');
    }

    if (this.expression) {
      this.evaluator = expr.compile(this.expression);
    } else {
      this.evaluator = () => true;
    }

    this.nodeMap = new WeakMap();
    this.nodeCounter = 0;

    this.callbackMap = new WeakMap();
    this.callbackCounter = 0;

    this.listenerMap = new Map();
  }

  /**
   * Binds the instance's event and criteria to the given element and callback
   * function. Duplicate bindings will result in duplicate calls.
   *
   * @param {Element} el
   * @param {Function} callback
   */
  listen (el, callback) {
    const listeners = this.getListeners(el, callback);
    const listener = (e) => {
      if (this.evaluator(e)) callback(e);
    };
    el.addEventListener(this.type, listener);
    listeners.push(listener);
  }

  /**
   * Unbinds all listeners on the given element and callback.
   *
   * @param {Element} el
   * @param {Function} callback
   */
  unlisten (el, callback) {
    const listeners = this.getListeners(el, callback);
    listeners.forEach((listener) => el.removeEventListener(this.type, listener));
    listeners.length = 0;
  }

  /**
   * Returns all current listeners for the given element and callback.
   *
   * @param {Element} el
   * @param {Function} callback
   * @return {Array<Function>}
   */
  getListeners (el, callback) {
    const nodeID = String(this.nodeMap.get(el) || ++this.nodeCounter);
    this.nodeMap.set(el, nodeID);

    const callbackID = String(this.callbackMap.get(callback) || ++this.callbackCounter);
    this.callbackMap.set(callback, callbackID);

    const listenerID = nodeID + ':' + callbackID;

    if (!this.listenerMap.has(listenerID)) {
      this.listenerMap.set(listenerID, []);
    }

    return this.listenerMap.get(listenerID);
  }
}

/**
 * Default (no-op) listener, which never invokes callbacks.
 * @type {FilteredEventListener}
 */
FilteredEventListener.DEFAULT_LISTENER = {
  listen: function () {},
  unlisten: function () {},
  input: ''
};

module.exports = FilteredEventListener;
