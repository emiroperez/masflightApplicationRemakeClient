import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-msf-summary-revenue-builds',
  templateUrl: './msf-summary-revenue-builds.component.html',
  styleUrls: ['./msf-summary-revenue-builds.component.css']
})
export class MsfSummaryRevenueBuildsComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 
  summaryList: any[] = [
    {id: 'YEAR', columnLabel: 'Year', columnName:'Year'},
    {id: 'MONTH', columnLabel: 'Month', columnName:'Month'},
    {id: 'DAY', columnLabel: 'Day' ,columnName:'Day'},
    {id: 'DESTINATION', columnLabel: 'Destination', columnName: 'Destination'},
    {id: 'AIRCRAFT_TYPE', columnLabel: 'Aircraft Type',columnName:'AircraftType'},
    {id: 'AIRLINE', columnLabel: 'Airline',columnName:'Carrier'},
    {id: 'ORIGIN', columnLabel: 'Origin',columnName:'Origin'}
];
  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() { 
    this.argument.value1 = [
      {id: 'YEAR', columnLabel: 'Year', columnName:'Year'},
      {id: 'MONTH', columnLabel: 'Month', columnName:'Month'},
      {id: 'AIRCRAFT_TYPE', columnLabel: 'Aircraft Type',columnName:'AircraftType'}];
  }
}
