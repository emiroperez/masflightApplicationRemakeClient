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
 

  // public groupingCtrl: FormControl = new FormControl();

  // public groupingFilterCtrl: FormControl = new FormControl();

  groupingList: any[] = [
                          {id: 'YEAR', name: 'Year', column:'Year'},
                          {id: 'MONTH', name: 'Month', column:'Month'},
                          {id: 'DAY', name: 'Day' ,column:'Day'},
                          {id: 'HOUR', name: 'Hour', column: 'Hour'},
                          {id: 'EQUIPMENTTYPESPECIFIC', name: 'Specific Equipment Type',column:'EspecificEquipmentType'},
                          {id: 'EQUIPMENTTYPEGENERAL', name: 'General Equipment Type',column:'GeneralEquipmentType'},
                          {id: 'OPERATINGAIRLINE', name: 'Operating Airline',column:'OperatingAirline'},                          
                          {id: 'ORIGINAIRPORT', name: 'Origin Airport',column:'Origin'},
                          {id: 'DESTINATIONAIRPORT', name: 'Destination Airport',column:'Destination'},
                          {id: 'FLIGHTNUMBER', name: 'Flight Number',column:'FlightNumber'},
                          {id: 'MARKETINGAIRLINE', name: 'Marketing Airline',column:'Marketing_Carrier'},
                          // {id: 'STATUSCODE', name: 'Status Code',column:'StatusCode'},
                          {id: 'ROUTE', name: 'Route',column:'Route'}
                        ];
  // private _onDestroy = new Subject<void>();

  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() { 
  }

 

}
