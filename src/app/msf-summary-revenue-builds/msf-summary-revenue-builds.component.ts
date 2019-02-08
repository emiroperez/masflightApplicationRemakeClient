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
                {id: 'YEAR', name: 'Year', column:'Year'},
                {id: 'MONTH', name: 'Month', column:'Month'},
                {id: 'DAY', name: 'Day' ,column:'Day'},
                {id: 'DESTINATION', name: 'Destination', column: 'Destination'},
                {id: 'AIRCRAFT', name: 'Aircraft Type',column:'Aircraft Type'},
                {id: 'AIRLINE', name: 'Airline',column:'Airline'},
                {id: 'ORIGIN', name: 'Origin',column:'Origin'}
  ];
  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() { 
    this.argument.value1 = [
      {id: 'YEAR', name: 'Year', column:'Year'},
      {id: 'MONTH', name: 'Month', column:'Month'},
      {id: 'AIRCRAFT', name: 'Aircraft Type',column:'Aircraft Type'}];
  }
}
