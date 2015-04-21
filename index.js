'use strict';

var moment = require('moment');
var workwork = require('workwork');

function Calculation(hoursWorked, hoursPerWeek) {
  this.hoursWorked = hoursWorked || 0;
  this.hoursPerWeek = hoursPerWeek || 40;
  // Can't make this easily configurable because workwork and liberty both
  // assume Monday to Friday to be working days and Saturday and Sunday to be
  // non-working days
  this.daysPerWeek = 5;
  this.regions = null;
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

Calculation.prototype.setRegions = function(regions) {
  this.regions = regions;
};

Calculation.prototype.getWorkingDays = function(from, until) {
  if (!this.regions) {
    throw new Error('This calculation requires that you set one or several ' +
        'regions with setRegions() before.');
  }
  return workwork(this.regions).between(from, until).length;
};

Calculation.prototype.getWorkingDaysUntil = function(until) {
  var startOfYear = moment(until).startOf('year');
  return this.getWorkingDays(startOfYear, until);
};

Calculation.prototype.getWorkingHours = function(from, until) {
  return this.getWorkingDays(from, until) * this.getHoursPerDay();
};

Calculation.prototype.getWorkingHoursUntil = function(until) {
  return this.getWorkingDaysUntil(until) * this.getHoursPerDay();
};

Calculation.prototype.getWorkingHoursYearTotal = function(year) {
  year = year || moment().year(); // default: current year
  var startOfYear = moment({ years: year }).startOf('year');
  var endOfYear = moment({ years: year }).endOf('year');
  return this.getWorkingHours(startOfYear, endOfYear);
};

/*
 * working hours from start of year until given date divided by working hours in
 * the whole year (the year is always taken from the given date.
 */
Calculation.prototype.getWorkingHoursFraction = function(until) {
  var year = moment(until).year();
  return this.getWorkingHoursUntil(until) / this.getWorkingHoursYearTotal(year);
};

module.exports = Calculation;
