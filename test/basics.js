'use strict';

var test = require('tape');
var Calculation = require('..');

test('default values', function (t) {
  var calc = new Calculation();
  t.equal(calc.getHoursWorked(), 0);
  t.equal(calc.getHoursPerWeek(), 40);
  t.equal(calc.daysPerWeek, 5);
  t.equal(calc.getHoursPerDay(), 8);
  t.end();
});

test('non default values', function (t) {
  var calc = new Calculation();
  calc.setHoursWorked(200);
  calc.setHoursPerWeek(42);
  t.equal(calc.getHoursWorked(), 200);
  t.equal(calc.getHoursPerWeek(), 42);
  t.end();
});

test('hours per day', function(t) {
  var calc = new Calculation();
  calc.setHoursPerWeek(42);
  t.equal(calc.getHoursPerDay(), 8.4);
  t.end();
});

test('hours per day/default values', function (t) {
  var calc = new Calculation();
  t.equal(calc.getHoursPerDay(), 8);
  t.end();
});

test('days worked/default values', function (t) {
  var calc = new Calculation();
  t.equal(calc.getDaysWorked(), 0);
  t.end();
});

test('days worked', function(t) {
  var calc = new Calculation();
  calc.setHoursWorked(204);
  t.equal(calc.getDaysWorked(), 25.5);
  t.end();
});

test('days worked non-default hours per day', function(t) {
  var calc = new Calculation();
  calc.setHoursPerWeek(45);
  calc.setHoursWorked(180);
  t.equal(calc.getDaysWorked(), 20);
  t.end();
});

test('set regions as array', function(t) {
  var calc = new Calculation();
  calc.setRegions(['de', 'de_nw']);
  t.equal(calc.getRegions().length, 2);
  t.equal(calc.getRegions()[0], 'de');
  t.equal(calc.getRegions()[1], 'de_nw');
  t.end();
});

test('set regions as varargs', function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  t.equal(calc.getRegions().length, 2);
  t.equal(calc.getRegions()[0], 'de');
  t.equal(calc.getRegions()[1], 'de_nw');
  t.end();
});

test('set one region', function(t) {
  var calc = new Calculation();
  calc.setRegions('de');
  t.equal(calc.getRegions().length, 1);
  t.equal(calc.getRegions()[0], 'de');
  t.end();
});

test('set no region', function(t) {
  var calc = new Calculation();
  calc.setRegions();
  t.equal(calc.getRegions().length, 0);
  t.end();
});
