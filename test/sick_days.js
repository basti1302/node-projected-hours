'use strict';

var test = require('tape');
var moment = require('moment');
var Hours = require('..');

var isApprox = require('./util/is_approximately');

test('estimated sick days total', function(t) {
  var hours = new Hours();
  hours.setEstimatedSickDaysTotal(5);
  t.equal(hours.getEstimatedSickDaysTotal(), 5);
  t.equal(hours.getEstimatedSickHoursTotal(), 40);
  t.end();
});

test('sick days', function(t) {
  var hours = new Hours();
  addSickDays(hours);
  t.equal(hours.getSickDays('2015-02-13'), 5);
  t.equal(hours.getSickHours('2015-02-13'), 40);
  t.equal(hours.getSickDays('2015-12-31'), 7);
  t.equal(hours.getSickHours('2015-12-31'), 56);
  t.end();
});

test('estimated sick days left without estimated sick days left throws exception',
    function(t) {
  var hours = new Hours();
  t.throws(function() {
    hours.getEstimatedSickDaysLeft('2015-07-06');
  }, /Error/);
  t.throws(function() {
    hours.getEstimatedSickHoursLeft('2015-07-06');
  }, /Error/);
  t.end();
});

test('estimated sick days left', function(t) {
  var hours = new Hours();
  hours.setEstimatedSickDaysTotal(5);
  addSickDays(hours);
  t.equal(hours.getEstimatedSickDaysLeft('2015-02-08'), 5);
  t.equal(hours.getEstimatedSickHoursLeft('2015-02-08'), 40);
  t.equal(hours.getEstimatedSickDaysLeft('2015-02-09'), 4);
  t.equal(hours.getEstimatedSickDaysLeft('2015-02-10'), 3);
  t.equal(hours.getEstimatedSickDaysLeft('2015-02-11'), 2);
  t.equal(hours.getEstimatedSickDaysLeft('2015-02-12'), 1);
  t.equal(hours.getEstimatedSickHoursLeft('2015-02-12'), 8);
  t.equal(hours.getEstimatedSickDaysLeft('2015-02-13'), 0);
  t.equal(hours.getEstimatedSickHoursLeft('2015-02-13'), 0);
  t.equal(hours.getEstimatedSickDaysLeft('2015-02-14'), 0);
  t.equal(hours.getEstimatedSickDaysLeft('2015-04-20'), 0);
  t.equal(hours.getEstimatedSickDaysLeft('2015-04-21'), 0);
  t.equal(hours.getEstimatedSickDaysLeft('2015-04-22'), 0);
  t.end();
});

function addSickDays(hours) {
  // three days added for 2014, should never be taken into account for 2015
  hours.addSickDay('2014-12-29');
  hours.addSickDay('2014-12-30');
  hours.addSickDay('2014-12-31');
  // 5 sick days in February 2015
  hours.addSickDay('2015-02-09');
  hours.addSickDay('2015-02-10');
  hours.addSickDay('2015-02-11');
  hours.addSickDay('2015-02-12');
  hours.addSickDay('2015-02-13');
  // 2 more sick days in April 2015
  hours.addSickDay('2015-04-20');
  hours.addSickDay('2015-04-21');
}
