'use strict';

var test = require('tape');
var Hours = require('..');

test('default values', function (t) {
  var hours = new Hours();
  t.equal(hours.getHoursWorked(), 0);
  t.equal(hours.getHoursPerWeek(), 40);
  t.equal(hours.daysPerWeek, 5);
  t.equal(hours.getHoursPerDay(), 8);
  t.end();
});

test('non default values', function (t) {
  var hours = new Hours();
  hours.setHoursWorked(200);
  hours.setHoursPerWeek(42);
  t.equal(hours.getHoursWorked(), 200);
  t.equal(hours.getHoursPerWeek(), 42);
  t.end();
});

test('hours per day', function(t) {
  var hours = new Hours();
  hours.setHoursPerWeek(42);
  t.equal(hours.getHoursPerDay(), 8.4);
  t.end();
});

test('hours per day/default values', function (t) {
  var hours = new Hours();
  t.equal(hours.getHoursPerDay(), 8);
  t.end();
});

test('days worked/default values', function (t) {
  var hours = new Hours();
  t.equal(hours.getDaysWorked(), 0);
  t.end();
});

test('days worked', function(t) {
  var hours = new Hours();
  hours.setHoursWorked(204);
  t.equal(hours.getDaysWorked(), 25.5);
  t.end();
});

test('days worked non-default hours per day', function(t) {
  var hours = new Hours();
  hours.setHoursPerWeek(45);
  hours.setHoursWorked(180);
  t.equal(hours.getDaysWorked(), 20);
  t.end();
});

test('set regions as array', function(t) {
  var hours = new Hours();
  hours.setRegions(['de', 'de_nw']);
  t.equal(hours.getRegions().length, 2);
  t.equal(hours.getRegions()[0], 'de');
  t.equal(hours.getRegions()[1], 'de_nw');
  t.end();
});

test('set regions as varargs', function(t) {
  var hours = new Hours();
  hours.setRegions('de', 'de_nw');
  t.equal(hours.getRegions().length, 2);
  t.equal(hours.getRegions()[0], 'de');
  t.equal(hours.getRegions()[1], 'de_nw');
  t.end();
});

test('set one region', function(t) {
  var hours = new Hours();
  hours.setRegions('de');
  t.equal(hours.getRegions().length, 1);
  t.equal(hours.getRegions()[0], 'de');
  t.end();
});

test('set no region', function(t) {
  var hours = new Hours();
  hours.setRegions();
  t.equal(hours.getRegions().length, 0);
  t.end();
});
