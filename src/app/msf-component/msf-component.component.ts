import { Component, OnInit, Input } from '@angular/core';
import {Option} from '../model/Option';
import { Globals } from '../globals/Globals';
import { ComponentType } from '../commons/ComponentType';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-component',
  templateUrl: './msf-component.component.html',
  styleUrls: ['./msf-component.component.css']
})
export class MsfComponentComponent implements OnInit {

  open: boolean = false;

  argsBefore: any;
  iconBefore: any;

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

  componentClickHandler(argsContainer, icon){
    if(this.argsBefore){
      this.argsBefore.open = false;
      this.iconBefore.innerText ="expand_more";
    }    
    if(!this.open || (this.open && (this.argsBefore !==argsContainer))){
      argsContainer.open = true;
      icon.innerText ="expand_less";
      this.open = true;
    }else{
      argsContainer.open = false;
      icon.innerText ="expand_more";
      this.open = false;
    }    
    this.globals.currentAgts = argsContainer;
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


}
