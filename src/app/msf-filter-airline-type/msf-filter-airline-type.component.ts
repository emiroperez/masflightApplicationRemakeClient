import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-filter-airline-type',
  templateUrl: './msf-filter-airline-type.component.html',
  styleUrls: ['./msf-filter-airline-type.component.css']
})
export class MsfFilterAirlineTypeComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();
 
  data: any[] = [
                {id: 'RpCarrier', name: 'Reporting Carrier'},
                {id: 'TcCarrier', name: 'Ticked Carrier'},
                {id: 'OpCarrier', name: 'Operating Carrier' }

  ];
  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() { 
    if(!this.argument.value1){
    this.argument.value1 = {id: 'RpCarrier', name: 'Reporting Carrier'};
    }
  }

}
