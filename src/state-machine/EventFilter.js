const FilteredEventListener = require('./FilteredEventListener');

/**
 * Utility class for parsing and stringify-ing event-ish properties. Ideally,
 * this would be defined as an A-Frame property type, but the registerProperty
 * API is not publicly exposed. Instead, components must manually call parse()
 * on their string inputs.
 *
 * Memo-ization is applied to all parsed inputs.
 */
const EventFilter = {};

EventFilter.name = 'event';

EventFilter.defaultValue = FilteredEventListener.DEFAULT_LISTENER;

/**
 * Given a (valid) filtered-event input...
 *
 *   "statechanged | detail.state === 'active'"
 *
 * ...returns a FilteredEventListener for that string. The listener may be
 * invoked with .listen(el, fn) and .unlisten(el, fn) methods.
 *
 * @param {string} input
 * @return {FilteredEventListener}
 */
EventFilter.parse = (function () {
  const memo = {};
  return function parse (input) {
    input = (input||'').trim();

    if (!input) return FilteredEventListener.DEFAULT_LISTENER;

    if (!memo[input]) {
      memo[input] = new FilteredEventListener(input);
    }

    return memo[input];
  };
}());

/**
 * Serializes a FilteredEventListener value.
 * @param  {FilteredEventListener} listener
 * @return {string}
 */
EventFilter.stringify = function stringify (listener) {
  return listener.input;
};

module.exports = EventFilter;
