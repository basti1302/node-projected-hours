'use strict';

var moment = require('moment');
var workwork = require('workwork');
var util = require('util');

/**
 * Creates a new calculation object.
 *
 * Monday to Friday are assumed to be working days and Saturday and Sunday are
 * assumed to be non-working days. Note that his currently can not be configured
 * as some libraries that Hours depends on for calculation of public holidays do
 * not allow this to be configured.
 *
 * Working hours per week default to 40, thus working hours per day thus default to 5.
 *
 * Total vacation days per year are initialized to 0.
 * Estimated sick days per year are initialized to 0.
 *
 * The region(s) required to calculate public holidays (and thus, working days)
 * are not initialized.
 */
function Hours() {
  this.hoursPerWeek = 40;
  // Can't make this easily configurable because workwork and liberty both
  // assume Monday to Friday to be working days and Saturday and Sunday to be
  // non-working days
  this.daysPerWeek = 5;
  this.regions = null;
  this.vacationDaysTotal = 0;
  this.vacationDays = [];
  this.estimatedSickDaysTotal = 0;
  this.sickDays = [];

  // TODO setting hoursWorked as a simple number is in contrast to vacation days
  // and sick days for which we add the actual, individual days and can
  // calculate the number of vacation days/sick days depending on the date.
  // To have the same for hours/days worked we would need to add the worked
  // hours for each day individually. Maybe allow both?
  this.hoursWorked =  0;
}

/**
 * Returns the hours the employee is ought to work per week.
 */
Hours.prototype.getHoursPerWeek = function() {
  return this.hoursPerWeek;
};

/**
 * Sets the hours the employee is ought to work per week and implicitly the
 * number of hours the employee is ought to work per day (hoursPerWeek / 5).
 */
Hours.prototype.setHoursPerWeek = function(hoursPerWeek) {
  this.hoursPerWeek = hoursPerWeek;
};

/**
 * Returns the hours the employee is ought to work per day, which is implicitly
 * given by the number of hours per week divided by 5.
 */
Hours.prototype.getHoursPerDay = function() {
  return this.hoursPerWeek / this.daysPerWeek;
};

/**
 * Returns the hours the employee has already worked this year.
 */
Hours.prototype.getHoursWorked = function() {
  return this.hoursWorked;
};

/**
 * Sets the hours the employee has already worked this year.
 */
Hours.prototype.setHoursWorked = function(hoursWorked) {
  return this.hoursWorked = hoursWorked;
};

/**
 * Returns the days the employee has already worked this year.
 */
Hours.prototype.getDaysWorked = function() {
  return this.hoursWorked / this.getHoursPerDay();
};


/**
 * Returns the regions used to calculate public holidays and working days..
 */
Hours.prototype.getRegions = function() {
  return this.regions;
};

/**
 * Sets the regions used to calculate public holidays and working days. Use
 * region strings that are understood by wombleton/workwork and
 * wombleton/liberty. If your region(s) is not supported by those libraries,
 * consider adding rules for your region to wombleton/liberty via pull request.
 *
 * Note that in often you need to pass in two regions, the country's region (for
 * the national holidays) and the subregion (for regional holidays that are not
 * valid for the entire country). For example, if you live in the federal state
 * of NRW (region 'de_nw') in Germany (region 'de'), you need to pass in ['de',
 * 'de_nw').
 */
Hours.prototype.setRegions = function(regions) {
  if (util.isArray(regions)) {
    this.regions = regions;
  } else {
    this.regions = Array.prototype.slice.call(arguments);
  }
};

/**
 * Calculates the working days between two dates, including both dates.
 *
 * You need to set regions via setRegions before calling this method.
 */
Hours.prototype.getWorkingDaysBetween = function(from, until) {
  if (!this.regions) {
    throw new Error('This calculation requires that you set one or several ' +
        'regions with setRegions() before.');
  }
  return workwork(this.regions).between(from, until).length;
};

/**
 * Calculates the working hours between two dates, including both dates.
 *
 * You need to set regions via setRegions before calling this method.
 */
Hours.prototype.getWorkingHoursBetween = function(from, until) {
  return this.getWorkingDaysBetween(from, until) * this.getHoursPerDay();
};

/**
 * Calculates the working days from the start of the year until the given date,
 * including it.
 *
 * You need to set regions via setRegions before calling this method.
 */
Hours.prototype.getWorkingDaysUntil = function(until) {
  var startOfYear = moment(until).startOf('year');
  return this.getWorkingDaysBetween(startOfYear, until);
};

/**
 * Calculates the working hours from the start of the year until the given date,
 * including it.
 *
 * You need to set regions via setRegions before calling this method.
 */
Hours.prototype.getWorkingHoursUntil = function(until) {
  return this.getWorkingDaysUntil(until) * this.getHoursPerDay();
};

/**
 * Calculates the total working days for the given year. Vacation days or sick
 * days are not subtracted, so this just counts the number of days that are
 * weekdays (not on a weekend) and not public holidays.
 *
 * You need to set regions via setRegions before calling this method.
 */
Hours.prototype.getWorkingDaysYearTotal = function(year) {
  year = year || moment().year(); // default: current year
  var startOfYear = moment({ year: year }).startOf('year');
  var endOfYear = moment({ year: year }).endOf('year');
  return this.getWorkingDaysBetween(startOfYear, endOfYear);
};

/**
 * Calculates the total working hours for the given year. Vacation days or sick
 * days are not subtracted, so this just counts the number of days that are
 * weekdays (not on a weekend) and not public holidays and multiplies them with
 * the hours per day.
 *
 * You need to set regions via setRegions before calling this method.
 */
Hours.prototype.getWorkingHoursYearTotal = function(year) {
  year = year || moment().year(); // default: current year
  var startOfYear = moment({ year: year }).startOf('year');
  var endOfYear = moment({ year: year }).endOf('year');
  return this.getWorkingHoursBetween(startOfYear, endOfYear);
};

/*
 * Calculates the working hours from start of year until given date divided by
 * working hours in the whole year (the year is always taken from the given
 * date).
 */
Hours.prototype.getWorkingHoursFractionUntil = function(until) {
  var year = moment(until).year();
  return this.getWorkingHoursUntil(until) / this.getWorkingHoursYearTotal(year);
};

/*
 * Calculates the working hours between the given dates divided by working hours
 * in the whole year (the year is always taken from the given from date).
 */
Hours.prototype.getWorkingHoursFractionBetween = function(from, until) {
  var year = moment(from).year();
  return this.getWorkingHoursBetween(from, until) /
    this.getWorkingHoursYearTotal(year);
};

Hours.prototype.getVacationDaysTotal = function() {
  return this.vacationDaysTotal;
};

/**
 * Sets the number of days the employee can use for vacation per year.
 */
Hours.prototype.setVacationDaysTotal = function(vacationDaysTotal) {
  this.vacationDaysTotal = vacationDaysTotal;
};

/**
 * Gets the number of days the employee can use for vacation per year.
 */
Hours.prototype.getVacationHoursTotal = function() {
  return this.vacationDaysTotal * this.getHoursPerDay();
};

/**
 * Marks the given day as one on which the employee did not work but had
 * vacation (will not work but will have vacation in case the date is in the
 * future).
 *
 * Use anything that Moment.js accepts as the date (this includes moment
 * objects).
 */
Hours.prototype.addVacationDay = function(date) {
  this.vacationDays.push(moment(date));
};

/**
 * Counts the number of days marked as vacation days until (including) the given
 * date.
 *
 * Use anything that Moment.js accepts as the date (this includes moment
 * objects).
 */
Hours.prototype.getVacationDaysTaken = function(until) {
  until = moment(until);
  var startOfYear = moment(until).startOf('year');
  var days = 0;
  for (var i = 0; i < this.vacationDays.length; i++) {
    var day = this.vacationDays[i];
    // check if days is in the correct year
    if (day.isSame(startOfYear, 'days') ||
        day.isBetween(startOfYear, until, 'days') ||
        day.isSame(until, 'days')) {
      days++;
    }
  }
  return days;
};

/**
 * Counts the number of hours marked as vacation until (including) the given
 * date.
 *
 * Use anything that Moment.js accepts as the date (this includes moment
 * objects).
 */
Hours.prototype.getVacationHoursTaken = function(until) {
  return this.getVacationDaysTaken(until) * this.getHoursPerDay();
};

/**
 * Calculates the number of days the employee has still left on the given date,
 * that is, total vacation days minus vacation days taken.
 *
 * Use anything that Moment.js accepts as the date (this includes moment
 * objects).
 */
Hours.prototype.getVacationDaysAvailable = function(from) {
  if (!this.getVacationDaysTotal()) {
    throw new Error('This calculation requires that you set the vaction days ' +
        'total with setVacationDaysTotal() before.');
  }
  return this.getVacationDaysTotal() - this.getVacationDaysTaken(from);
};

/**
 * Calculates the number of hours the employee has still left on the given date,
 * that is, total vacation hours minus vacation hours taken.
 *
 * Use anything that Moment.js accepts as the date (this includes moment
 * objects).
 */
Hours.prototype.getVacationHoursAvailable = function(from) {
  return this.getVacationDaysAvailable(from) * this.getHoursPerDay();
};

/*
 * The number of vacation days from 01.01. until the given date if one would
 * evenly distribute vacations days across the year.
 */
Hours.prototype.getVacationDaysDistributedUntil = function(until) {
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
Hours.prototype.getVacationHoursDistributedUntil = function(until) {
  return this.getVacationDaysDistributedUntil(until) * this.getHoursPerDay();
};

/*
 * The number of vacation days between the given dates if one would
 * evenly distribute vacations days across the year.
 */
Hours.prototype.getVacationDaysDistributedBetween =
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
Hours.prototype.getVacationHoursDistributedBetween =
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
Hours.prototype.getVacationDebtHours = function(until) {
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
Hours.prototype.getVacationDebtDays = function(until) {
  return this.getVacationDebtHours(until) / this.getHoursPerDay();
};

/**
 * Sets the estimated number of days per year an employee takes a sick leave.
 */
Hours.prototype.setEstimatedSickDaysTotal = function(days) {
  this.estimatedSickDaysTotal = days;
};

/**
 * Gets the estimated number of days per year an employee takes a sick leave.
 */
Hours.prototype.getEstimatedSickDaysTotal = function() {
  return this.estimatedSickDaysTotal;
};

/**
 * Gets the estimated number of hours per year an employee takes a sick leave.
 */
Hours.prototype.getEstimatedSickHoursTotal = function() {
  return this.getEstimatedSickDaysTotal() * this.getHoursPerDay();
};

/**
 * Marks the given day as one on which the employee did not work due to being
 * sick.
 *
 * Use anything that Moment.js accepts as the date (this includes moment
 * objects).
 */
Hours.prototype.addSickDay = function(date) {
  this.sickDays.push(moment(date));
};

/**
 * Counts the number of days marked as sick days until (including) the given
 * date.
 *
 * Use anything that Moment.js accepts as the date (this includes moment
 * objects).
 */
Hours.prototype.getSickDays = function(until) {
  until = moment(until);
  var startOfYear = moment(until).startOf('year');
  var days = 0;
  for (var i = 0; i < this.sickDays.length; i++) {
    var day = this.sickDays[i];
    // check if days is in the correct year
    if (day.isSame(startOfYear, 'days') ||
        day.isBetween(startOfYear, until, 'days') ||
        day.isSame(until, 'days')) {
      days++;
    }
  }
  return days;
};

/**
 * Counts the number of hours marked as sick days until (including) the given
 * date.
 *
 * Use anything that Moment.js accepts as the date (this includes moment
 * objects).
 */
Hours.prototype.getSickHours = function(until) {
  return this.getSickDays(until) * this.getHoursPerDay();
};

/**
 * Calculates the estimated number of sick days the employee has still left on the
 * given date, that is, the estimated total sick days per year minus the actual
 * sick days that happened until the given date. If the employee already had
 * more sick days than estimated, this method returns 0.
 *
 * Use anything that Moment.js accepts as the date (this includes moment
 * objects).
 */
Hours.prototype.getEstimatedSickDaysLeft = function(from) {
  if (!this.getEstimatedSickDaysTotal()) {
    throw new Error('This calculation requires that you set the vaction days ' +
        'total with setVacationDaysTotal() before.');
  }
  var estimate = this.getEstimatedSickDaysTotal() - this.getSickDays(from);
  return estimate > 0 ? estimate : 0;
};

/**
 * Calculates the estimated number of sick hours the employee has still left on
 * the given date, that is, the estimated total sick hours per year minus the
 * actualsick days that happened until the given date. If the employee already
 * had more sick hours than estimated, this method returns 0.
 *
 * Use anything that Moment.js accepts as the date (this includes moment
 * objects).
 */
Hours.prototype.getEstimatedSickHoursLeft = function(from) {
  return this.getEstimatedSickDaysLeft(from) * this.getHoursPerDay();
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
 */
Hours.prototype.getProjectedHours = function(date) {
  var nextDay = moment(date).add(1, 'day');
  var endOfYear = moment(date).endOf('year');
  return this.getHoursWorked() +
         this.getWorkingHoursBetween(nextDay, endOfYear) -
         this.getVacationHoursAvailable(date);
};

/**
 * Same as getProjectedHours(), but in days.
 */
Hours.prototype.getProjectedDays = function(date) {
  return this.getProjectedHours(date) / this.getHoursPerDay();
};

/**
 * The number of hours an employee is ought to work in the given year, based on
 * the total working hours in this year minus vacation.
 */
Hours.prototype.getTargetHours = function(year) {
  return this.getWorkingHoursYearTotal(year) - this.getVacationHoursTotal();
};

/**
 * Calculates the overtime (in hours) basically using the same input and making
 * the same assumptions as getProjectedHours. The only difference is that sick
 * days count as if the employee had worked the required hours per day.
 */
Hours.prototype.getProjectedOvertimeHours = function(date) {
  return this.getProjectedHours(date) -
    this.getTargetHours(moment(date).year()) +
    this.getSickHours(date);
};

/**
 * Same as getProjectedOvertimeHours(), but in days.
 */
Hours.prototype.getProjectedOvertimeDays = function(date) {
  return this.getProjectedOvertimeHours(date) / this.getHoursPerDay();
};

module.exports = Hours;
