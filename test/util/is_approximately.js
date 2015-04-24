'use strict';

var isInRange = require('./is_in_range');

module.exports = function(t, actual, expected, name) {
  var low = expected - 0.0001;
  var high = expected + 0.0001;
  isInRange(t, actual, low, high,
      (name ? (name + ': ') : '') +
      'expected ' + low + ' <= ' + actual + ' <= ' + high);
}
