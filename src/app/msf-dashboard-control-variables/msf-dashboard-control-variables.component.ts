import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ComponentType } from '../commons/ComponentType';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-control-variables',
  templateUrl: './msf-dashboard-control-variables.component.html'
})
export class MsfDashboardControlVariablesComponent {
  open: boolean = false;

  argsBefore: any;
  iconBefore: any;

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardControlVariablesComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

    onNoClick(): void
    {
      this.dialogRef.close ();
    }

    closeDialog(): void
    {
      this.dialogRef.close ();
    }

    componentClickHandler(argsContainer, icon): void
    {
      if (this.argsBefore)
      {
        this.argsBefore.open = false;
        this.iconBefore.innerText ="expand_more";
      }    
      if (!this.open || (this.open && (this.argsBefore !== argsContainer)))
      {
        argsContainer.open = true;
        icon.innerText ="expand_less";
        this.open = true;
      }
      else
      {
        argsContainer.open = false;
        icon.innerText ="expand_more";
        this.open = false;
      }

      this.globals.currentAgts = argsContainer;
      this.iconBefore = icon;
      this.argsBefore = argsContainer;
    }
    
    isAirportRoute(argument: Arguments) : boolean
    {
      return ComponentType.airportRoute == argument.type;
    }
    
    isAirport(argument: Arguments) : boolean
    {
      return ComponentType.airport == argument.type;
    }
    
    isTimeRange(argument: Arguments) : boolean
    {
      return ComponentType.timeRange == argument.type;
    }
    
    isDateRange(argument: Arguments) : boolean
    {
      return ComponentType.dateRange == argument.type;
    }
    
    isCeiling(argument: Arguments) : boolean
    {
      return ComponentType.ceiling == argument.type;
    }

    isWindSpeed(argument: Arguments) : boolean
    {
      return ComponentType.windSpeed == argument.type;
    }

    isTemperature(argument: Arguments) : boolean
    {
      return ComponentType.temperature == argument.type;
    }

    isWindDirection(argument: Arguments) : boolean
    {
      return ComponentType.windDirection == argument.type;
    }

    isAirline(argument: Arguments) : boolean
    {
      return ComponentType.airline == argument.type;
    }

    isSingleAirline(argument: Arguments) : boolean
    {
      return ComponentType.singleairline == argument.type;
    }

    isTailNumber(argument: Arguments) : boolean
    {
      return ComponentType.tailnumber == argument.type;
    }

    isAircraftType(argument: Arguments) : boolean
    {
      return ComponentType.aircraftType == argument.type;
    }

    isFlightNumberType(argument: Arguments) : boolean
    {
      return ComponentType.flightNumber == argument.type;
    }

    isGrouping(argument: Arguments) : boolean
    {
      return ComponentType.grouping == argument.type;
    }

    isRounding(argument: Arguments) : boolean
    {
      return ComponentType.rounding == argument.type;
    }

    isDate(argument: Arguments) : boolean
    {
      return ComponentType.date == argument.type;
    }

    isCancelled(argument: Arguments) : boolean
    {
      return ComponentType.cancelled == argument.type;
    }

    isUserList(argument: Arguments) : boolean
    {
      return ComponentType.userList == argument.type;
    }

    isOptionList(argument: Arguments) : boolean
    {
      return ComponentType.optionList == argument.type;
    }

    isMsFreeTextInput(argument: Arguments) : boolean
    {
      return ComponentType.freeTextInput == argument.type;
    }

    isSelectBoxSingleOption(argument: Arguments) : boolean
    {
      return ComponentType.selectBoxSingleOption == argument.type;
    }

    isSelectBoxMultipleOption(argument: Arguments) : boolean
    {
      return ComponentType.selectBoxMultipleOption == argument.type;
    }

    isDatePicker(argument: Arguments) : boolean
    {
      return ComponentType.datePicker == argument.type;
    }

    isTimePicker(argument: Arguments) : boolean
    {
      return ComponentType.timePicker == argument.type;
    }

    isDateTimePicker(argument: Arguments) : boolean
    {
      return ComponentType.dateTimePicker == argument.type;
    }

    isCheckBox(argument: Arguments) : boolean
    {
      return ComponentType.checkBox == argument.type;
    }

    isCancelsCheckBox(argument: Arguments) : boolean
    {
      return ComponentType.cancelsCheckBox == argument.type;
    }

    isDiversionsCheckBox(argument: Arguments) : boolean
    {
      return ComponentType.diversionsCheckbox == argument.type;
    }

    isFlightDelaysCheckBox(argument: Arguments) : boolean
    {
      return ComponentType.flightDelaysCheckbox == argument.type;
    }

    isCausesFlightDelaysCheckBox(argument: Arguments) : boolean
    {
      return ComponentType.causesFlightDelaysCheckbox == argument.type;
    }

    isTaxiTimes(argument: Arguments) : boolean
    {
      return ComponentType.taxiTimes == argument.type;
    }

    isTaxiTimesCheckbox(argument: Arguments) : boolean
    {
      return ComponentType.taxiTimesCheckbox == argument.type;
    }

    isTaxiTimesCheckboxes(argument: Arguments) : boolean
    {
      return ComponentType.taxiTimesCheckboxes == argument.type;
    }

    isDatePeriod(argument: Arguments) : boolean
    {
      return ComponentType.datePeriod == argument.type;
    }

    isRegion(argument: Arguments) : boolean
    {
      return ComponentType.region == argument.type;
    }

    isDatePeriodYear(argument: Arguments) : boolean
    {
      return ComponentType.datePeriodYear == argument.type;
    }

    isDatePeriodYearMonth(argument: Arguments) : boolean
    {
      return ComponentType.datePeriodYearMonth == argument.type;
    }

    isSortingCheckboxes(argument: Arguments) : boolean
    {
      return ComponentType.sortingCheckboxes == argument.type;
    }

    isGroupingAthena(argument: Arguments) : boolean
    {
      return ComponentType.groupingAthena == argument.type;
    }

    isFlightDistance(argument: Arguments) : boolean
    {
      return ComponentType.flightDistance == argument.type;
    }

    isFareTypes(argument: Arguments) : boolean
    {
      return ComponentType.fareTypes == argument.type;
    }

    isServiceClasses(argument: Arguments) : boolean
    {
      return ComponentType.serviceClasses == argument.type;
    }

    isSummary(argument: Arguments) : boolean
    {
      return ComponentType.summary == argument.type;
    }

    isResultsLess(argument: Arguments) : boolean
    {
      return ComponentType.resultsLess == argument.type;
    }

    isGeography(argument: Arguments) : boolean
    {
      return ComponentType.geography == argument.type;
    }

    isExcludeFollowing(argument: Arguments) : boolean
    {
      return ComponentType.excludeFollowing == argument.type;
    }

    isSIngleCheckbox(argument: Arguments) : boolean
    {
      return ComponentType.singleCheckbox == argument.type;
    }

    isExcludeItineraries(argument: Arguments) : boolean
    {
      return ComponentType.excludeItineraries == argument.type;
    }

    isFilterAirlineType(argument: Arguments) : boolean
    {
      return ComponentType.filterAirlineType == argument.type;
    }

    isFareIncrements(argument: Arguments) : boolean
    {
      return ComponentType.fareIncrements == argument.type;
    }

    isFareIncrementMiddle(argument: Arguments) : boolean
    {
      return ComponentType.fareIncrementMiddle == argument.type;
    }

    isFareIncrementMax(argument: Arguments) : boolean
    {
      return ComponentType.fareIncrementMax == argument.type;
    }

    isArgumentTitle(argument: Arguments) : boolean
    {
      return ComponentType.title == argument.type;
    }

    isAirportsRoutes(argument: Arguments) : boolean
    {
      return ComponentType.airportsRoutes == argument.type;
    }

    isFaresLower(argument: Arguments) : boolean
    {
      return ComponentType.fareLower == argument.type;
    }

    isPercentIncrement(argument: Arguments) : boolean
    {
      return ComponentType.percentIncrement == argument.type;
    }

    isGroupingDailyStatics(argument: Arguments) : boolean
    {
      return ComponentType.groupingDailyStatics == argument.type;
    }

    isQuarterHour(argument: Arguments) : boolean
    {
      return ComponentType.quarterHour == argument.type;
    }

    isFunctions(argument: Arguments) : boolean
    {
      return ComponentType.functions == argument.type;
    }

    isGroupingOperationsSummary(argument: Arguments) : boolean
    {
      return ComponentType.groupingOperationsSummary == argument.type;
    }

    isGroupingHubSummaries(argument: Arguments) : boolean
    {
      return ComponentType.groupingHubSummaries == argument.type;
    }

    isRegionSchedule(argument: Arguments) : boolean
    {
      return ComponentType.regionSchedule == argument.type;
    }

    isAircraftTypeCheckboxes(argument: Arguments) : boolean
    {
      return ComponentType.aircraftTypeCheckboxes == argument.type;
    }

    isSeats(argument: Arguments) : boolean
    {
      return ComponentType.seats == argument.type;
    }

    isSortingNonstop(argument: Arguments) : boolean
    {
      return ComponentType.sortingNostop == argument.type;
    }

    isSortingConnectionBuilder(argument: Arguments) : boolean
    {
      return ComponentType.sortingConnectionBuilder == argument.type;
    }

    isConnectionTime(argument: Arguments) : boolean
    {
      return ComponentType.connectionTime == argument.type;
    }

    isStops(argument: Arguments) : boolean
    {
      return ComponentType.stops == argument.type;
    }

    isCircuityType(argument: Arguments) : boolean
    {
      return ComponentType.circuityType == argument.type;
    }

    isCircuity(argument: Arguments) : boolean
    {
      return ComponentType.circuity == argument.type;
    }

    isSingleAirport(argument: Arguments) : boolean
    {
      return ComponentType.singleAirport == argument.type;
    }
}
