'use strict';

var test = require('tape');
var moment = require('moment');
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

test('configure by constructor', function (t) {
  var calc = new Calculation(42, 34);
  t.equal(calc.getHoursWorked(), 42);
  t.equal(calc.getHoursPerWeek(), 34);
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

test('working days without regions throws error', function(t) {
  var calc = new Calculation();
  t.throws(function() { calc.getWorkingDays(moment(), moment()); }, /Error/);
  t.end();
});

test('working days from date to date', function(t) {
  var calc = new Calculation();
  calc.setRegions(['de', 'de_nw']);
  t.equal(calc.getWorkingDays('2015-01-01', '2015-12-31'), 253);
  t.end();
});

test('working days until without regions throws error', function(t) {
  var calc = new Calculation();
  t.throws(function() { calc.getWorkingDaysUntil(moment()); }, /Error/);
  t.end();
});

test('working days until date (from start of year)', function(t) {
  var calc = new Calculation();
  calc.setRegions(['de', 'de_nw']);
  t.equal(calc.getWorkingDaysUntil('2014-06-30'), 122);
  t.end();
});

test('working hours without regions throws error', function(t) {
  var calc = new Calculation();
  t.throws(function() { calc.getWorkingHours(moment(), moment()); }, /Error/);
  t.end();
});

test('working hours from date to date', function(t) {
  var calc = new Calculation();
  calc.setRegions(['de', 'de_nw']);
  t.equal(calc.getWorkingHours('2015-01-01', '2015-12-31'), 2024);
  t.end();
});

test('working hours until without regions throws error', function(t) {
  var calc = new Calculation();
  t.throws(function() { calc.getWorkingHoursUntil(moment()); }, /Error/);
  t.end();
});

test('working hours until date (from start of year)', function(t) {
  var calc = new Calculation();
  calc.setRegions(['de', 'de_nw']);
  t.equal(calc.getWorkingHoursUntil('2014-06-30'), 976);
  t.end();
});

test('working hours fraction', function(t) {
  var calc = new Calculation();
  calc.setRegions(['de', 'de_nw']);
  var fraction = calc.getWorkingHoursFraction('2015-06-30');
  t.ok(fraction > 0.482);
  t.ok(fraction < 0.483);
  t.end();
});
