import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Observable, of } from 'rxjs';
import { MatSelect } from '@angular/material';
import { Subject } from 'rxjs';
import { take, takeUntil, delay } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-grouping',
  templateUrl: './msf-grouping.component.html',
  styleUrls: ['./msf-grouping.component.css']
})
export class MsfGroupingComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 
  groupingList: any[] = [
                {id: 'YEAR', columnLabel: 'Year', columnNamecolumnLabel:'Year'},
                {id: 'MONTH', columnLabel: 'Month', columnName:'Month'},
                {id: 'DAY', columnLabel: 'Date' ,columnName:'Date'},
                {id: 'HOUR', columnLabel: 'Hour', columnName: 'Hour'},
                {id: 'EQUIPMENTTYPESPECIFIC', columnLabel: 'Specific Equipment Type',columnName:'EspecificEquipmentType'},
                {id: 'EQUIPMENTTYPEGENERAL', columnLabel: 'General Equipment Type',columnName:'GeneralEquipmentType'},
                {id: 'OPERATINGAIRLINE', columnLabel: 'Operating Airline',columnName:'OperatingAirline'},                          
                {id: 'ORIGINAIRPORT', columnLabel: 'Origin Airport',columnName:'Origin'},
                {id: 'DESTINATIONAIRPORT', columnLabel: 'Destination Airport',columnName:'Destination'},
                {id: 'FLIGHTNUMBER', columnLabel: 'Flight Number',columnName:'FlightNumber'},
                {id: 'MARKETINGAIRLINE', columnLabel: 'Marketing Airline',columnName:'Marketing_Carrier'},
                {id: 'ROUTE', columnLabel: 'Route',columnName:'Route'}
  ];
  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() { 
    if(this.argument.required){
      this.argument.value1 = [  {id: 'YEAR', columnLabel: 'Year', columnName:'Year'},
                                  {id: 'MONTH', columnLabel: 'Month', columnName:'Month'},
                                    {id: 'DAY', columnLabel: 'Date' ,columnName:'Date'}];
    }
  }

}
