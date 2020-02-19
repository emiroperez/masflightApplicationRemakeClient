import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { ComponentType } from '../commons/ComponentType';

@Component({
  selector: 'app-msf-argument',
  templateUrl: './msf-argument.component.html',
  styleUrls: ['./msf-argument.component.css']
})
export class MsfArgumentComponent implements OnInit {


  @Input()
  currentArgument: any;

  @Input()
  currentGlobalOptionId: number;

  @Input("createdMetas")
  createdMetas: any = null;

  @Output("setLoading")
  setLoading = new EventEmitter ();

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Input("anchoredArgument")
  anchoredArgument: boolean = false;

  @Input("updateURLResults")
  updateURLResults: boolean;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();
  
  constructor(public globals: Globals) { }

  ngOnInit() {
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

  isAircraftType(argument: Arguments){
    return ComponentType.aircraftType == argument.type;
  }

  isGrouping(argument: Arguments){
    return ComponentType.grouping == argument.type;
  }

  isRounding(argument: Arguments){
    return ComponentType.rounding == argument.type;
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

  isRegion(argument: Arguments){
    return ComponentType.region == argument.type;
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

  isSummaryRevenueBuilds(argument: Arguments){
    return ComponentType.summaryRevenueBuilds == argument.type;
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
  isContentType(argument: Arguments){
    return ComponentType.contentType == argument.type;
  }
  isTotalType(argument: Arguments){
    return ComponentType.totalType == argument.type;
  }
  isGroupingGenre(argument: Arguments){
    return ComponentType.groupingCompGenre == argument.type;
  }
  isGroupingTotal(argument: Arguments){
    return ComponentType.groupingCompTotal == argument.type;
  }
  isGroupingOp(argument: Arguments){
    return ComponentType.groupingOpSum == argument.type;
  }
  isGroupingOp2(argument: Arguments){
    return ComponentType.groupingOpSum2 == argument.type;
  }
  isStates(argument: Arguments){
    return ComponentType.states == argument.type;
  }
  isFlightSegments(argument: Arguments){
    return ComponentType.flightSegments == argument.type;
  }
  isGroupAAA(argument: Arguments){
    return ComponentType.AAA_Group == argument.type;
  }
}
