'use strict';

var test = require('tape');
var moment = require('moment');
var Hours = require('..');

test('working days without regions throws error', function(t) {
  var hours = new Hours();
  t.throws(function() {
    hours.getWorkingDaysBetween(moment(), moment());
  }, /Error/);
  t.end();
});

test('working days from date to date', function(t) {
  var hours = new Hours();
  hours.setRegions(['de', 'de_nw']);
  t.equal(hours.getWorkingDaysBetween('2015-01-01', '2015-12-31'), 253);
  t.end();
});

test('working days until without regions throws error', function(t) {
  var hours = new Hours();
  t.throws(function() { hours.getWorkingDaysUntil(moment()); }, /Error/);
  t.end();
});

test('working days until date (from start of year)', function(t) {
  var hours = new Hours();
  hours.setRegions(['de', 'de_nw']);
  t.equal(hours.getWorkingDaysUntil('2014-06-30'), 122);
  t.end();
});

test('working hours without regions throws error', function(t) {
  var hours = new Hours();
  t.throws(function() {
    hours.getWorkingHoursBetween(moment(), moment());
  }, /Error/);
  t.end();
});

test('working hours from date to date', function(t) {
  var hours = new Hours();
  hours.setRegions(['de', 'de_nw']);
  t.equal(hours.getWorkingHoursBetween('2015-01-01', '2015-12-31'), 2024);
  t.end();
});

test('working hours year total', function(t) {
  var hours = new Hours();
  hours.setRegions(['de', 'de_nw']);
  t.equal(hours.getWorkingHoursYearTotal(2015), 2024);
  t.end();
});

test('working hours until without regions throws error', function(t) {
  var hours = new Hours();
  t.throws(function() { hours.getWorkingHoursUntil(moment()); }, /Error/);
  t.end();
});

test('working hours until date (from start of year)', function(t) {
  var hours = new Hours();
  hours.setRegions('de', 'de_nw');
  t.equal(hours.getWorkingHoursUntil('2014-06-30'), 976);
  t.end();
});

test('working hours fraction until', function(t) {
  var hours = new Hours();
  hours.setRegions('de', 'de_nw');
  var fraction = hours.getWorkingHoursFractionUntil('2015-06-30');
  t.ok(fraction > 0.4822 && fraction < 0.4823);
  t.end();
});

test('working hours fraction between', function(t) {
  var hours = new Hours();
  hours.setRegions(['de', 'de_nw']);
  var fraction =
    hours.getWorkingHoursFractionBetween('2015-04-27', '2015-05-08');
  t.ok(fraction > 0.0355);
  t.ok(fraction < 0.0356);
  t.end();
});
