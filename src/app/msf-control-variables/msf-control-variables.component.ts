import { Component, OnInit, Input } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ComponentType } from '../commons/ComponentType';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-control-variables',
  templateUrl: './msf-control-variables.component.html'
})
export class MsfControlVariablesComponent implements OnInit {

  open: boolean = false;

  @Input()
  currentOptionCategories: any;

  @Input()
  currentOptionId: number;

  argsBefore: any;
  iconBefore: any;

  constructor(public globals: Globals) { }

  ngOnInit() {
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

    this.globals.currentArgs = argsContainer;
    this.iconBefore = icon;
    this.argsBefore = argsContainer;
  }

  isAirportRoute(argument: Arguments){
    return ComponentType.airportRoute == argument.type;
  }

  isAirport(argument: Arguments){
    return ComponentType.airport == argument.type;
  }

  isTimeRange(argument: Arguments){
    return ComponentType.timeRange == argument.type;
  }

  isDateRange(argument: Arguments){
    return ComponentType.dateRange == argument.type;
  }

  isCeiling(argument: Arguments){
    return ComponentType.ceiling == argument.type;
  }

  isWindSpeed(argument: Arguments){
    return ComponentType.windSpeed == argument.type;
  }

  isTemperature(argument: Arguments){
    return ComponentType.temperature == argument.type;
  }

  isWindDirection(argument: Arguments){
    return ComponentType.windDirection == argument.type;
  }

  isAirline(argument: Arguments){
    return ComponentType.airline == argument.type;
  }

  isSingleAirline(argument: Arguments){
    return ComponentType.singleairline == argument.type;
  }

  isTailNumber(argument: Arguments){
    return ComponentType.tailnumber == argument.type;
  }

  isAircraftType(argument: Arguments){
    return ComponentType.aircraftType == argument.type;
  }

  isFlightNumberType(argument: Arguments){
    return ComponentType.flightNumber == argument.type;
  }

  isGrouping(argument: Arguments){
    return ComponentType.grouping == argument.type;
  }

  isRounding(argument: Arguments){
    return ComponentType.rounding == argument.type;
  }

  isDate(argument: Arguments){
    return ComponentType.date == argument.type;
  }

  isCancelled(argument: Arguments){
    return ComponentType.cancelled == argument.type;
  }

  isUserList(argument: Arguments){
    return ComponentType.userList == argument.type;
  }

  isOptionList(argument: Arguments){
    return ComponentType.optionList == argument.type;
  }

  isMsFreeTextInput(argument: Arguments){
    return ComponentType.freeTextInput == argument.type;
  }

  isSelectBoxSingleOption(argument: Arguments){
    return ComponentType.selectBoxSingleOption == argument.type;
  }

  isSelectBoxMultipleOption(argument: Arguments){
    return ComponentType.selectBoxMultipleOption == argument.type;
  }
  isDatePicker(argument: Arguments){
    return ComponentType.datePicker == argument.type;
  }
  isTimePicker(argument: Arguments){
    return ComponentType.timePicker == argument.type;
  }
  isDateTimePicker(argument: Arguments){
    return ComponentType.dateTimePicker == argument.type;
  }
  isCheckBox(argument: Arguments){
    return ComponentType.checkBox == argument.type;
  }
  isCancelsCheckBox(argument: Arguments){
    return ComponentType.cancelsCheckBox == argument.type;
  }
  isDiversionsCheckBox(argument: Arguments){
    return ComponentType.diversionsCheckbox == argument.type;
  }
  isFlightDelaysCheckBox(argument: Arguments){
    return ComponentType.flightDelaysCheckbox == argument.type;
  }
  isCausesFlightDelaysCheckBox(argument: Arguments){
    return ComponentType.causesFlightDelaysCheckbox == argument.type;
  }
  isTaxiTimes(argument: Arguments){
    return ComponentType.taxiTimes == argument.type;
  }
  isTaxiTimesCheckbox(argument: Arguments){
    return ComponentType.taxiTimesCheckbox == argument.type;
  }
  isTaxiTimesCheckboxes(argument: Arguments){
    return ComponentType.taxiTimesCheckboxes == argument.type;
  }
  isDatePeriod(argument: Arguments){
    return ComponentType.datePeriod == argument.type;
  }
  isRegion(argument: Arguments){
    return ComponentType.region == argument.type;
  }
  isDatePeriodYear(argument: Arguments){
    return ComponentType.datePeriodYear == argument.type;
  }
  isDatePeriodYearMonth(argument: Arguments){
    return ComponentType.datePeriodYearMonth == argument.type;
  }
  isSortingCheckboxes(argument: Arguments){
    return ComponentType.sortingCheckboxes == argument.type;
  }
  isGroupingAthena(argument: Arguments){
    return ComponentType.groupingAthena == argument.type;
  }
  isFlightDistance(argument: Arguments){
    return ComponentType.flightDistance == argument.type;
  }
  isFareTypes(argument: Arguments){
    return ComponentType.fareTypes == argument.type;
  }
  isServiceClasses(argument: Arguments){
    return ComponentType.serviceClasses == argument.type;
  }
  isSummary(argument: Arguments){
    return ComponentType.summary == argument.type;
  }
  isResultsLess(argument: Arguments){
    return ComponentType.resultsLess == argument.type;
  }
  isGeography(argument: Arguments){
    return ComponentType.geography == argument.type;
  }
  isExcludeFollowing(argument: Arguments){
    return ComponentType.excludeFollowing == argument.type;
  }
  isSIngleCheckbox(argument: Arguments){
    return ComponentType.singleCheckbox == argument.type;
  }
  isExcludeItineraries(argument: Arguments){
    return ComponentType.excludeItineraries == argument.type;
  }
  isFilterAirlineType(argument: Arguments){
    return ComponentType.filterAirlineType == argument.type;
  }
  isFareIncrements(argument: Arguments){
    return ComponentType.fareIncrements == argument.type;
  }
  isFareIncrementMiddle(argument: Arguments){
    return ComponentType.fareIncrementMiddle == argument.type;
  }
  isFareIncrementMax(argument: Arguments){
    return ComponentType.fareIncrementMax == argument.type;
  }
  isArgumentTitle(argument: Arguments){
    return ComponentType.title == argument.type;
  }
  isAirportsRoutes(argument: Arguments){
    return ComponentType.airportsRoutes == argument.type;
  }
  isFaresLower(argument: Arguments){
    return ComponentType.fareLower == argument.type;
  }
  isPercentIncrement(argument: Arguments){
    return ComponentType.percentIncrement == argument.type;
  }
  isGroupingDailyStatics(argument: Arguments){
    return ComponentType.groupingDailyStatics == argument.type;
  }
  isQuarterHour(argument: Arguments){
    return ComponentType.quarterHour == argument.type;
  }
  isFunctions(argument: Arguments){
    return ComponentType.functions == argument.type;
  }
  isGroupingOperationsSummary(argument: Arguments){
    return ComponentType.groupingOperationsSummary == argument.type;
  }
  isGroupingHubSummaries(argument: Arguments){
    return ComponentType.groupingHubSummaries == argument.type;
  }
  isRegionSchedule(argument: Arguments){
    return ComponentType.regionSchedule == argument.type;
  }
  isAircraftTypeCheckboxes(argument: Arguments){
    return ComponentType.aircraftTypeCheckboxes == argument.type;
  }
  isSeats(argument: Arguments){
    return ComponentType.seats == argument.type;
  }
  isSortingNonstop(argument: Arguments){
    return ComponentType.sortingNostop == argument.type;
  }
  isSortingConnectionBuilder(argument: Arguments){
    return ComponentType.sortingConnectionBuilder == argument.type;
  }
  isConnectionTime(argument: Arguments){
    return ComponentType.connectionTime == argument.type;
  }
  isStops(argument: Arguments){
    return ComponentType.stops == argument.type;
  }
  isCircuityType(argument: Arguments){
    return ComponentType.circuityType == argument.type;
  }
  isCircuity(argument: Arguments){
    return ComponentType.circuity == argument.type;
  }
  isSingleAirport(argument: Arguments){
    return ComponentType.singleAirport == argument.type;
  }
  isSummaryRevenueBuilds(argument: Arguments){
    return ComponentType.summaryRevenueBuilds == argument.type;
  }
  isDatePeriodRevenue(argument: Arguments){
    return ComponentType.datePeriodRevenue == argument.type;
  }
  isFareIncrementsMarketHistograms(argument: Arguments){
    return ComponentType.fareIncrementsMarketHistograms == argument.type;
  }
  isTopNumber(argument: Arguments){
    return ComponentType.topNumber == argument.type;
  }
  isSeatClass(argument: Arguments){
    return ComponentType.seatClass == argument.type;
  }
  isGroupingMariaDB(argument: Arguments){
    return ComponentType.groupingMariaDB == argument.type;
  }
}
