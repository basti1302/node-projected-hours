'use strict';

module.exports = function(t, actual, low, high, msg) {
  t.ok(actual >= low && actual <= high, msg);
}
