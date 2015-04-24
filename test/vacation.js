'use strict';

var test = require('tape');
var moment = require('moment');
var Calculation = require('..');

var isApprox = require('./util/is_approximately');

test('vacation days total', function(t) {
  var calc = new Calculation();
  calc.setVacationDaysTotal(30);
  t.equal(calc.getVacationDaysTotal(), 30);
  t.equal(calc.getVacationHoursTotal(), 240);
  t.end();
});

test('vacation taken', function(t) {
  var calc = new Calculation();
  addVacationDays(calc);
  t.equal(calc.getVacationDaysTaken('2015-12-31'), 10);
  t.equal(calc.getVacationHoursTaken('2015-12-31'), 80);
  t.equal(calc.getVacationDaysTaken('2015-02-13'), 5);
  t.equal(calc.getVacationHoursTaken('2015-02-13'), 40);
  t.end();
});

test('vacation available without vacation total throws exception',
    function(t) {
  var calc = new Calculation();
  t.throws(function() {
    calc.getVacationDaysAvailable('2015-07-06');
  }, /Error/);
  t.throws(function() {
    calc.getVacationHoursAvailable('2015-07-06');
  }, /Error/);
  t.end();
});

test('vacation days available', function(t) {
  var calc = new Calculation();
  calc.setVacationDaysTotal(30);
  addVacationDays(calc);
  t.equal(calc.getVacationDaysAvailable('2015-02-08'), 30);
  t.equal(calc.getVacationHoursAvailable('2015-02-08'), 240);
  t.equal(calc.getVacationDaysAvailable('2015-02-09'), 29); // 09.02.: vacation
  t.equal(calc.getVacationDaysAvailable('2015-02-10'), 28); // 10.02.: vacation
  t.equal(calc.getVacationDaysAvailable('2015-02-11'), 27); // 11.02.: vacation
  t.equal(calc.getVacationDaysAvailable('2015-02-12'), 26); // 12.02.: vacation
  t.equal(calc.getVacationDaysAvailable('2015-02-13'), 25); // 13.02.: vacation
  t.equal(calc.getVacationHoursAvailable('2015-02-13'), 200);
  t.equal(calc.getVacationDaysAvailable('2015-02-14'), 25);
  t.equal(calc.getVacationDaysAvailable('2015-04-19'), 25);
  t.equal(calc.getVacationDaysAvailable('2015-04-20'), 24); // 20.04.: vacation
  t.equal(calc.getVacationDaysAvailable('2015-04-21'), 23); // 21.04.: vacation
  t.equal(calc.getVacationDaysAvailable('2015-04-22'), 22); // 22.04.: vacation
  t.equal(calc.getVacationDaysAvailable('2015-04-23'), 21); // 23.04.: vacation
  t.equal(calc.getVacationDaysAvailable('2015-04-24'), 20); // 24.04.: vacation
  t.equal(calc.getVacationHoursAvailable('2015-04-24'), 160);
  t.equal(calc.getVacationDaysAvailable('2015-04-27'), 20);
  t.equal(calc.getVacationHoursAvailable('2015-04-27'), 160);
  t.end();
});

test('vacation distributed until without vacation total throws exception',
    function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  t.throws(function() {
    calc.getVacationDaysDistributedUntil('2015-07-06');
  }, /Error/);
  t.end();
});

test('vacation distributed until', function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  calc.setVacationDaysTotal(30);
  var days = calc.getVacationDaysDistributedUntil('2015-06-30');
  isApprox(t, days, 14.4664);
  var hours = calc.getVacationHoursDistributedUntil('2015-06-30')
  isApprox(t, hours, 115.7312);
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
  isApprox(t, days, 1.06719);
  var hours = calc.getVacationHoursDistributedBetween('2015-04-27',
    '2015-05-08');
  isApprox(t, hours, 8.5375);
  t.end();
});

test('vacation debt throws error if no regions', function(t) {
  var calc = new Calculation();
  calc.setVacationDaysTotal(30);
  calc.addVacationDay('2015-01-02');
  t.throws(function() {
    calc.getVacationDebtHours('2015-04-30');
  }, /Error/);
  t.end();
});

test('vacation debt throws error if no vacation total', function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  calc.addVacationDay('2015-01-02');
  t.throws(function() {
    calc.getVacationDebtHours('2015-04-30');
  }, /Error/);
  t.end();
});

test('vacation debt as hours', function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  calc.setVacationDaysTotal(30);
  addVacationDays(calc);

  // there are 31 working days from 01.01. to 13.02.
  isApprox(t, calc.getVacationDebtHours('2015-02-13'), -10.592885375, 'debt as hours');
  isApprox(t, calc.getVacationDebtDays('2015-02-13'), -1.32411, 'debt as days');
  // there are 41 working days from 01.01. to 28.02.
  isApprox(t, calc.getVacationDebtHours('2015-02-28'), -1.106719368, 'debt as hours');
  // there are 80 working days from 01.01. to 27.04.
  isApprox(t, calc.getVacationDebtHours('2015-04-27'), -4.110671937, 'debt as hours');
  // there are 83 working days from 01.01. to 30.04.
  isApprox(t, calc.getVacationDebtHours('2015-04-30'), -1.264822134, 'debt as hours');
  t.end();
});

function addVacationDays(calc) {
  // three days added for 2014, should never be taken into account for 2015
  calc.addVacationDay('2014-12-29');
  calc.addVacationDay('2014-12-30');
  calc.addVacationDay('2014-12-31');
  // 5 days in February 2015
  calc.addVacationDay('2015-02-09');
  calc.addVacationDay('2015-02-10');
  calc.addVacationDay('2015-02-11');
  calc.addVacationDay('2015-02-12');
  calc.addVacationDay('2015-02-13');
  // 5 days in April 2015
  calc.addVacationDay('2015-04-20');
  calc.addVacationDay('2015-04-21');
  calc.addVacationDay('2015-04-22');
  calc.addVacationDay('2015-04-23');
  calc.addVacationDay('2015-04-24');
}
