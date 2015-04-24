'use strict';

var test = require('tape');
var moment = require('moment');
var Calculation = require('..');

var isApprox = require('./util/is_approximately');

test('projected hours', function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  calc.setVacationDaysTotal(30);
  addVacationDays(calc);

  // there are 31 working days from 01.01. to 13.02. = 248 hours
  // there are 222 working days from 14.02. to 31.12. = 1776 hours
  // empl. has worked 220 hours
  // empl. has 25 days vacation left =  200 hours
  // 220 + 1776 - 200
  calc.setHoursWorked(220);
  t.equal(calc.getProjectedHours('2015-02-13'), 1796);
  t.equal(calc.getProjectedDays('2015-02-13'), 224.5);

  // 10 working days from 13.02.2015 to 28.02.2015
  // employee has worked 80 more hours since 13.02.2015 (exactly 8 hours per day
  // on average), thus the projected hours have not changed since 13.02.2015.
  calc.setHoursWorked(300);
  t.equal(calc.getProjectedHours('2015-02-28'), 1796);
  t.equal(calc.getProjectedDays('2015-02-28'), 224.5);

  // There are 83 working days from 01.01. to 04.30. and 170 working days for
  // the rest of the year.
  // 170 days minus days vacation that is still available, that is the employee
  // has actually 150 working days left for this year, or 1200 working hours.
  // 1200 + 570 hours the employee has worked already this year makes
  // 1770 projected hours in total
  calc.setHoursWorked(570);
  t.equal(calc.getProjectedHours('2015-04-30'), 1770);
  t.equal(calc.getProjectedDays('2015-04-30'), 221.25);

  t.end();
});

test('target hours', function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  calc.setVacationDaysTotal(30);
  t.equal(calc.getTargetHours(2015), 1784);
  t.end();
});

test('projected overtime', function(t) {
  var calc = new Calculation();
  calc.setRegions('de', 'de_nw');
  calc.setVacationDaysTotal(30);
  addVacationDays(calc);
  // Target hours for 2015: 1784

  calc.setHoursWorked(220);
  t.equal(calc.getProjectedOvertimeHours('2015-02-13'), 12);
  t.equal(calc.getProjectedOvertimeDays('2015-02-13'), 1.5);
  calc.setHoursWorked(300);
  t.equal(calc.getProjectedOvertimeHours('2015-02-28'), 12);
  t.equal(calc.getProjectedOvertimeDays('2015-02-28'), 1.5);
  calc.setHoursWorked(570);
  t.equal(calc.getProjectedOvertimeHours('2015-04-30'), -14);
  t.equal(calc.getProjectedOvertimeDays('2015-04-30'), -1.75);

  t.end();
});

function addVacationDays(calc) {
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
