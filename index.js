'use strict';

var moment = require('moment');
var workwork = require('workwork');
var util = require('util');

function Calculation(hoursWorked, hoursPerWeek) {
  this.hoursWorked = hoursWorked || 0;
  this.hoursPerWeek = hoursPerWeek || 40;
  // Can't make this easily configurable because workwork and liberty both
  // assume Monday to Friday to be working days and Saturday and Sunday to be
  // non-working days
  this.daysPerWeek = 5;
  this.regions = null;
  this.vacationDaysTotal = 0;
  this.vacationDaysTaken = 0;
}

Calculation.prototype.getHoursWorked = function() {
  return this.hoursWorked;
};

Calculation.prototype.setHoursWorked = function(hoursWorked) {
  return this.hoursWorked = hoursWorked;
};

Calculation.prototype.getHoursPerWeek = function() {
  return this.hoursPerWeek;
};

Calculation.prototype.setHoursPerWeek = function(hoursPerWeek) {
  this.hoursPerWeek = hoursPerWeek;
};

Calculation.prototype.getHoursPerDay = function() {
  return this.hoursPerWeek / this.daysPerWeek;
};

Calculation.prototype.getDaysWorked = function() {
  return this.hoursWorked / this.getHoursPerDay();
};

Calculation.prototype.getRegions = function() {
  return this.regions;
};

Calculation.prototype.setRegions = function(regions) {
  if (util.isArray(regions)) {
    this.regions = regions;
  } else {
    this.regions = Array.prototype.slice.call(arguments);
  }
};

Calculation.prototype.getWorkingDaysBetween = function(from, until) {
  if (!this.regions) {
    throw new Error('This calculation requires that you set one or several ' +
        'regions with setRegions() before.');
  }
  return workwork(this.regions).between(from, until).length;
};

Calculation.prototype.getWorkingDaysUntil = function(until) {
  var startOfYear = moment(until).startOf('year');
  return this.getWorkingDaysBetween(startOfYear, until);
};

Calculation.prototype.getWorkingHoursBetween = function(from, until) {
  return this.getWorkingDaysBetween(from, until) * this.getHoursPerDay();
};

Calculation.prototype.getWorkingHoursUntil = function(until) {
  return this.getWorkingDaysUntil(until) * this.getHoursPerDay();
};

Calculation.prototype.getWorkingHoursYearTotal = function(year) {
  year = year || moment().year(); // default: current year
  var startOfYear = moment({ year: year }).startOf('year');
  var endOfYear = moment({ year: year }).endOf('year');
  return this.getWorkingHoursBetween(startOfYear, endOfYear);
};

/*
 * working hours from start of year until given date divided by working hours in
 * the whole year (the year is always taken from the given date.
 */
Calculation.prototype.getWorkingHoursFractionUntil = function(until) {
  var year = moment(until).year();
  return this.getWorkingHoursUntil(until) / this.getWorkingHoursYearTotal(year);
};

/*
 * working hours between the given dates  divided by working hours in the whole
 * year (the year is always taken from the given from date).
 */
Calculation.prototype.getWorkingHoursFractionBetween = function(from, until) {
  var year = moment(from).year();
  return this.getWorkingHoursBetween(from, until) /
    this.getWorkingHoursYearTotal(year);
};

Calculation.prototype.getVacationDaysTotal = function() {
  return this.vacationDaysTotal;
};

Calculation.prototype.setVacationDaysTotal = function(vacationDaysTotal) {
  this.vacationDaysTotal = vacationDaysTotal;
};

Calculation.prototype.getVacationHoursTotal = function() {
  return this.vacationDaysTotal * this.getHoursPerDay();
};

Calculation.prototype.getVacationDaysTaken = function() {
  return this.vacationDaysTaken;
};

Calculation.prototype.setVacationDaysTaken = function(vacationDaysTaken) {
  this.vacationDaysTaken = vacationDaysTaken;
};

Calculation.prototype.getVacationHoursTaken = function() {
  return this.vacationDaysTaken * this.getHoursPerDay();
};

/*
 * The number of vacation days from 01.01. until the given date if one would
 * evenly distributed vacations days across the year.
 */
Calculation.prototype.getVacationDaysDistributedUntil = function(until) {
  if (!this.getVacationDaysTotal()) {
    throw new Error('This calculation requires that you set the vaction days ' +
        'total with setVacationDaysTotal() before.');
  }
  return this.getVacationDaysTotal() * this.getWorkingHoursFractionUntil(until);
};

/*
 * The number of vacation hours from 01.01. until the given date if one would
 * evenly distributed vacations days across the year.
 */
Calculation.prototype.getVacationHoursDistributedUntil = function(until) {
  return this.getVacationDaysDistributedUntil(until) * this.getHoursPerDay();
};

/*
 * The number of vacation days between the given dates if one would
 * evenly distributed vacations days across the year.
 */
Calculation.prototype.getVacationDaysDistributedBetween =
function(from, until) {
  if (!this.getVacationDaysTotal()) {
    throw new Error('This calculation requires that you set the vaction days ' +
        'total with setVacationDaysTotal() before.');
  }
  return this.getVacationDaysTotal() *
    this.getWorkingHoursFractionBetween(from, until);
};

/*
 * The number of vacation hours between the given dates if one would
 * evenly distributed vacations days across the year.
 */
Calculation.prototype.getVacationHoursDistributedBetween =
function(from, until) {
  return this.getVacationDaysDistributedBetween(from, until) *
    this.getHoursPerDay();
};

module.exports = Calculation;
