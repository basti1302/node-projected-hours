'use strict';

var test = require('tape');
var Calculation = require('..');

var calc;

function init() {
  calc = new Calculation();
}

test('default values', function (t) {
  init();
  t.equal(calc.getHoursWorked(), 0);
  t.equal(calc.getHoursPerWeek(), 40);
  t.equal(calc.getDaysPerWeek(), 5);
  t.equal(calc.getHoursPerDay(), 8);
  t.end();
});

test('non default values', function (t) {
  init();
  calc.setHoursWorked(200);
  calc.setHoursPerWeek(42);
  calc.setDaysPerWeek(6);
  t.equal(calc.getHoursWorked(), 200);
  t.equal(calc.getHoursPerWeek(), 42);
  t.equal(calc.getDaysPerWeek(), 6);
  t.end();
});

test('configure by constructor', function (t) {
  init();
  calc = new Calculation(42, 34, 4);
  t.equal(calc.getHoursWorked(), 42);
  t.equal(calc.getHoursPerWeek(), 34);
  t.equal(calc.getDaysPerWeek(), 4);
  t.end();
});

test('hours per day', function(t) {
  calc = new Calculation(42, 34, 4);
  t.equal(calc.getHoursPerDay(), 8.5);
  t.end();
});

test('hours per day/default values', function (t) {
  init();
  t.equal(calc.getHoursPerDay(), 8);
  t.end();
});

test('days worked', function(t) {
  init();
  calc.setHoursWorked(204);
  t.equal(calc.getDaysWorked(), 25.5);
  t.end();
});

test('days worked/default values', function (t) {
  init();
  t.equal(calc.getDaysWorked(), 0);
  t.end();
});
