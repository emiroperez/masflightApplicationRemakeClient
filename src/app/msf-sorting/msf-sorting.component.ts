import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-msf-sorting',
  templateUrl: './msf-sorting.component.html',
  styleUrls: ['./msf-sorting.component.css']
})
export class MsfSortingComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  sortingList: any[] = [
    {id: 'YEAR', name: 'Year', column:'Year'},
    {id: 'MONTH', name: 'Month', column:'Month'},
    {id: 'DAY', name: 'Day' ,column:'Date'},
    {id: 'HOUR', name: 'Hour', column: 'Hour'},
    {id: 'EQUIPMENTTYPESPECIFIC', name: 'Specific Equipment Type',column:'EspecificEquipmentType'},
    {id: 'EQUIPMENTTYPEGENERAL', name: 'General Equipment Type',column:'GeneralEquipmentType'},
    {id: 'OPERATINGAIRLINE', name: 'Operating Airline',column:'OperatingAirline'},                          
    {id: 'ORIGINAIRPORT', name: 'Origin Airport',column:'Origin'},
    {id: 'DESTINATIONAIRPORT', name: 'Destination Airport',column:'Destination'},
    {id: 'FLIGHTNUMBER', name: 'Flight Number',column:'FlightNumber'},
    {id: 'MARKETINGAIRLINE', name: 'Marketing Airline',column:'Marketing_Carrier'},
    {id: 'ROUTE', name: 'Route',column:'Route'},

    {id: 'Tracked', name: 'Tracked',column:'Route'},
    {id: 'Comp', name: 'Comp',column:'Comp'},
    {id: 'Cxld', name: 'Cxld',column:'Cxld'},
    {id: 'Other', name: 'Other',column:'Other'},
    {id: 'CF_pct', name: 'CF(%)',column:'CF_pct'},
    {id: 'D0_pct', name: 'DO(%)',column:'D0_pct'},
    {id: 'D15_pct', name: 'D15(%)',column:'D15_pct'},
    {id: 'B0_pct', name: 'B0(%)',column:'B0_pct'},
    {id: 'STA14_pct', name: 'A14(%)',column:'STA14_pct'},
    {id: 'STA_pct', name: 'A(%)',column:'STA_pct'},
  ];

  constructor(private http: ApiClient, public globals: Globals) { }

  ngOnInit() { 
  }

  }


