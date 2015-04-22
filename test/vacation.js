'use strict';

var test = require('tape');
var moment = require('moment');
var Calculation = require('..');

test('vacation days total', function(t) {
  var calc = new Calculation();
  calc.setVacationDaysTotal(30);
  t.equal(calc.getVacationDaysTotal(), 30);
  t.equal(calc.getVacationHoursTotal(), 240);
  t.end();
});

test('vacation days taken', function(t) {
  var calc = new Calculation();
  calc.setVacationDaysTaken(10);
  t.equal(calc.getVacationDaysTaken(), 10);
  t.equal(calc.getVacationHoursTaken(), 80);
  t.end();
});

test('vacation distributed until without vacation total throws exception',
    function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  t.throws(function() { calc.getVacationDaysDistributedUntil('2015-07-06'); },
    /Error/);
  t.end();
});

test('vacation distributed until', function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  calc.setVacationDaysTotal(30);
  var days = calc.getVacationDaysDistributedUntil('2015-06-30');
  t.ok(days > 14.4664 && days < 14.4665);
  var hours = calc.getVacationHoursDistributedUntil('2015-06-30')
  t.ok(hours > 115.7312 && hours < 115.7313);
  t.end();
});

test('vacation distributed between without vacation total throws exception',
    function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  t.throws(function() {
    calc.getVacationDaysDistributedBetween('2015-02-01', '2015-02-13');
  }, /Error/);
  t.end();
});

test('vacation distributed between', function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  calc.setVacationDaysTotal(30);
  var days = calc.getVacationDaysDistributedBetween('2015-04-27', '2015-05-08');
  t.ok(days > 1.06719 && days < 1.0672);
  var hours = calc.getVacationHoursDistributedBetween('2015-04-27',
    '2015-05-08');
  t.ok(hours > 8.5375 && hours < 8.5376);
  t.end();
});
