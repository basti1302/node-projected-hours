# Projected Hours

Calculates/estimates the projected hours/days worked, projected overtime, and similiar numbers.

# Calculation of Overtime

hoursPerWeek: number of hours per week the employee is ought to work (per contract)
daysPerWeek: number of days per week the employee is ought to work (per contract)

We assume that the hours are evenly distributed across the days, that is, for example 8 hours per day on 5 days per week.

hoursPerDay = hoursPerWeek / daysPerWeek

hoursWorked: number of hours worked, rounded
daysWorked: number of days worked
daysWorked = hoursWorked/hoursPerDay

## Working Hours/Days

workingDays(date): number of working days from 01.01. until date
workingDays(date1, date2): number of working days from date1 until date2
workingHours(...): same as workingDays, but hour-based

workingDays(date) = number of days - weekends - public holidays (until date) [-> workwork?]
workingHours(...) = workingDays(...) * hoursPerDay

workingDaysYearFraction: working days until today divided by working days in the whole year
workingHoursYearFraction: working hours until today divided by working hours in the whole year
workingHoursYearFraction(date) = workingHours(date) / workingHours(31.12.)
workingDaysYearFraction(date) = workingHoursYearFraction(date) * hoursPerDay

## Vacation

vacationDaysTotal: the number of days available for vacation
vacationDaysTaken: vacation days already taken
vacationHoursTotal: vacationDaysTotal * hoursPerDay
vacationHoursTaken: vacationDaysTaken * hoursPerDay

If an employee takes all vacation days in January and calculates the numbers for February they will have a very low number of hours worked. But they won't take vacation for the rest of the year.

If an employee plans to take all vacation days in December and calculates the numbers for November, they will have a very high number of hours worked. They won't work in December at all, though, so at the end of the year, there might be no overtime.

We need to distribute the number of vacation days evenly across the year (like vacationTotal / 12 per month or so).

vacationDaysDistributed(date): the number of vacation days from 01.01. to date if they would be evenly distributed across the year
Example: 30 days vacation, vacationDaysDistributed(01.07.) = 15
vacationHoursDistributed(date): same, but hour based
Example: 30 days vacation, hoursPerDay = 8, vacationDaysDistributed(01.07.) = 15 * 8

vacationHoursDistributed(date) = vacationHoursTotal * workingHoursYearFraction(date)
vacationDaysDistributed(date) = vacationHoursDistributed(date) * hoursPerDay

vacationDebt(date): difference between vacationTaken and vactionDistributed, that is, the number of days of vacation that has been "taken too early" or "not yet taken though they should have been taken already"
vacationDebt(date) =  vacationDistributed(date) - vacationTaken
Example: vacationTotal = 30, vacationTaken = 20
  vacationDebt(01.07.)
  = vacationDistributed(01.07.) - 20
  = 15 - 20
  = (-5)

In this example, the employee is 5 vacation days in debt, which has actually a positive effect on the projected number of days/hours worked by the end of the year (see below) because they won't take as much vacation until the end of the year.

# Sick days

TODO

Maybe we do not need to account for sick days at all? At the very least, accounting for sick days should be optional.

estimatedSickDaysPerYear: ...
For example, estimate 5 sick days per employee per year.

estimatedSickHoursPerYear = estimatedSickDaysPerYear * hoursPerDay

# Projected Numbers

We want to know how much the employee will have worked at the end of the year if they just keep working hoursPerDay every working day and use up all vacation until the end of the year.

projectedDays = daysWorked + workingDays(today, 31.12.) - vacationDebt
targetDays = workingDays(01.01., 31.12.)

projectedOvertime = projectedDays - targetDays
