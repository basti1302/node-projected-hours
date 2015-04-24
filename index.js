'use strict';

var moment = require('moment');
var workwork = require('workwork');
var util = require('util');

function Calculation() {
  this.hoursPerWeek = 40;
  // Can't make this easily configurable because workwork and liberty both
  // assume Monday to Friday to be working days and Saturday and Sunday to be
  // non-working days
  this.daysPerWeek = 5;
  this.regions = null;
  this.vacationDaysTotal = 0;
  this.vacationDays = [];
  // TODO this is in contrast to vacation days etc. for which we can
  // calculate a number depending on the date.
  this.hoursWorked =  0;
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

Calculation.prototype.addVacationDay = function(date) {
  this.vacationDays.push(moment(date));
};

Calculation.prototype.getVacationDaysTaken = function(until) {
  until = moment(until);
  var startOfYear = moment(until).startOf('year');
  var days = 0;
  for (var i = 0; i < this.vacationDays.length; i++) {
    var day = this.vacationDays[i];
    if (day.isSame(startOfYear, 'days') ||
        day.isBetween(startOfYear, until, 'days') ||
        day.isSame(until, 'days')) {
      days++;
    }
  }
  return days;
};

Calculation.prototype.getVacationHoursTaken = function(until) {
  return this.getVacationDaysTaken(until) * this.getHoursPerDay();
};

Calculation.prototype.getVacationDaysAvailable = function(from) {
  if (!this.getVacationDaysTotal()) {
    throw new Error('This calculation requires that you set the vaction days ' +
        'total with setVacationDaysTotal() before.');
  }
  return this.getVacationDaysTotal() - this.getVacationDaysTaken(from);
};

Calculation.prototype.getVacationHoursAvailable = function(from) {
  return this.getVacationDaysAvailable(from) * this.getHoursPerDay();
};

/*
 * The number of vacation days from 01.01. until the given date if one would
 * evenly distribute vacations days across the year.
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
 * evenly distribute vacations across the year.
 */
Calculation.prototype.getVacationHoursDistributedUntil = function(until) {
  return this.getVacationDaysDistributedUntil(until) * this.getHoursPerDay();
};

/*
 * The number of vacation days between the given dates if one would
 * evenly distribute vacations days across the year.
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
 * evenly distribute vacations across the year.
 */
Calculation.prototype.getVacationHoursDistributedBetween =
function(from, until) {
  return this.getVacationDaysDistributedBetween(from, until) *
    this.getHoursPerDay();
};

/**
 * The difference between the vacation already taken and the perfectly
 * distributed vacation, that is, the number of hours of vacation that has been
 * "taken too early" or "not yet taken though they should have been taken
 * already".
 *
 * This method only takes into account vacation taken until the given date.
 *
 * getVacationDebtHours(until) =
 * = getVacationHoursDistributedUntil(until) - getVacationHoursTaken(until)
 *
 * See getVacationDebtDays for an example.
 */
Calculation.prototype.getVacationDebtHours = function(until) {
  return this.getVacationHoursDistributedUntil(until) -
    this.getVacationHoursTaken(until);
};

/**
 * The difference between the vacation already taken and the perfectly
 * distributed vacation, that is, the number of days of vacation that has been
 * "taken too early" or "not yet taken though they should have been taken
 * already".
 *
 * This method only takes into account vacation days taken until the given date.
 *
 * getVacationDebtDays(until) =
 * = getVacationDaysDistributedUntil(until) - getVacationDaysTaken(until)
 *
 * Example: vacationTotal = 30, getVacationDaysTaken('2016-01-07') = 20
 *
 * getVacationDebtDays('2016-01-07')
 * = getVacationDaysDistributedUntil('2015-01-07') - getVacationDaysTaken('2016-01-07')
 * = 15 - 20
 * = -5
 *
 * In this example, the employee is 5 vacation days in debt, that is, they have
 * already taken 5 days more vacation than they would have if they had
 * distributed vacation days perfectly throughout the year. On the other hand
 * this means that the will take 5 days less vacation between the given date and
 * the end of the year, so this has actually a positive effect on the projected
 * number of days worked by the end of the year (see below).
*/
Calculation.prototype.getVacationDebtDays = function(until) {
  return this.getVacationDebtHours(until) / this.getHoursPerDay();
};

/**
 * Calculates the number of hours the employee will have worked at the end of
 * year, based on the following data:
 * - The number of hours the employee has worked until the given date (including
 *   it) has been set via `setHoursWorked`,
 * - the total number of vacation days for the year has been set via
 *   `setVacationDaysTotal`,
 * - vacation days already used by the employee until `date` have been set
 *   via `addVacationDay`,
 * - the country/regions/locales that are required to correctly calculate public
 *   holidays (and thus, working days) have been set via `setRegions`.
 *
 * The calculation makes the following assumptions:
 * - by the end of the year, the employee will have used up all vacation days,
 * - on each working day, the employee will, on average, work exactly the
 *   required hours, not more, not less. The required hours per day can be set
 *   implicitly by `setHoursPerWeek`. This defaults to 40, so hours per day
 *   default to 8.
 *
 * TODO: In particular, this calculation does not yet take sick days into
 * account. If the employee has been sick on any given day before the given
 * date, the hours from this day will be simply missing from the calculation.
 */
Calculation.prototype.getProjectedHours = function(date) {
  var nextDay = moment(date).add(1, 'day');
  var endOfYear = moment(date).endOf('year');
  return this.getHoursWorked() +
         this.getWorkingHoursBetween(nextDay, endOfYear) -
         this.getVacationHoursAvailable(date);
};

Calculation.prototype.getProjectedDays = function(date) {
  return this.getProjectedHours(date) / this.getHoursPerDay();
};

/**
 * The number of hours an employee is ought to work in the given year, based on
 * the total working hours in this year minus vacation.
 */
Calculation.prototype.getTargetHours = function(year) {
  return this.getWorkingHoursYearTotal(year) - this.getVacationHoursTotal();
};

Calculation.prototype.getProjectedOvertimeHours = function(date) {
  return this.getProjectedHours(date) -
    this.getTargetHours(moment(date).year());
};

Calculation.prototype.getProjectedOvertimeDays = function(date) {
  return this.getProjectedOvertimeHours(date) / this.getHoursPerDay();
};

module.exports = Calculation;
