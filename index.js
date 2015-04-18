'use strict';

function Calculation(hoursWorked, hoursPerWeek, daysPerWeek) {
  this.hoursWorked = hoursWorked || 0;
  this.hoursPerWeek = hoursPerWeek || 40;
  this.daysPerWeek = daysPerWeek || 5;
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

Calculation.prototype.getDaysPerWeek = function() {
  return this.daysPerWeek;
};

Calculation.prototype.setDaysPerWeek = function(daysPerWeek) {
  this.daysPerWeek = daysPerWeek;
};

Calculation.prototype.getHoursPerDay = function() {
  return this.hoursPerWeek / this.daysPerWeek;
};

Calculation.prototype.getDaysWorked = function() {
  return this.hoursWorked / this.getHoursPerDay();
};

module.exports = Calculation;
