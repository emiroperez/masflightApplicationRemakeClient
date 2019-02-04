import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-summary',
  templateUrl: './msf-summary.component.html',
  styleUrls: ['./msf-summary.component.css']
})
export class MsfSummaryComponent implements OnInit {


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
  }

}
