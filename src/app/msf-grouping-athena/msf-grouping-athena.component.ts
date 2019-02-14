import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-grouping-athena',
  templateUrl: './msf-grouping-athena.component.html',
  styleUrls: ['./msf-grouping-athena.component.css']
})
export class MsfGroupingAthenaComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  groupingList: any[] = [
    {columnName: 'Year', columnLabel: 'Year',"checked":false, "order":"desc"},
    {columnName: 'Month', columnLabel: 'Month', "checked":false, "order":"desc"},
    {columnName: 'Day', columnLabel: 'Day' ,"checked":false, "order":"desc"},
    {columnName: 'Hour', columnLabel: 'Hour', "checked":false, "order":"desc"},
    {columnName: 'EspecificEquipmentType',columnLabel: 'Specific Equipment Type', "checked":false, "order":"desc"},
    {columnName: 'GeneralEquipmentType',columnLabel: 'General Equipment Type',"checked":false, "order":"desc"},
    {columnName: 'OperatingAirline', columnLabel: 'Operating Airline',"checked":false, "order":"desc"},                          
    {columnName: 'Origin', columnLabel: 'Origin Airport',"checked":false, "order":"desc"},
    {columnName: 'Destination', columnLabel: 'Destination Airport',"checked":false, "order":"desc"},
    {columnName: 'FlightNumber', columnLabel: 'Flight Number',"checked":false, "order":"desc"},
    {columnName: 'Route', columnLabel: 'Route',"checked":false, "order":"desc"},
    {columnName: 'Marketing_Carrier', columnLabel: 'Marketing Airline',"checked":false, "order":"desc"}
  ];
  
  constructor() { }


  ngOnInit() {
    if (!this.argument.value1)
      this.argument.value1 = [{columnName: 'Marketing_Carrier', columnLabel: 'Marketing Airline',"checked":false, "order":"desc"}];
  }

}
