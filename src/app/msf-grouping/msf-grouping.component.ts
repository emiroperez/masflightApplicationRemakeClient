import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Observable, of ,  Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
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

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  groupingList: any[] = [
                {id: 'YEAR', columnLabel: 'Year', columnName:'Year'},
                {id: 'MONTH', columnLabel: 'Month', columnName:'Month'},
                {id: 'DAY', columnLabel: 'Date' ,columnName:'Date'},
                {id: 'HOUR', columnLabel: 'Hour', columnName: 'Hour'},
                {id: 'EQUIPMENTTYPE', columnLabel: 'Equipment Type',columnName:'EquipmentType'},
                {id: 'AIRLINE', columnLabel: 'Airline',columnName:'Airline'},                          
                {id: 'ORIGIN', columnLabel: 'Origin Airport',columnName:'Origin'},
                {id: 'DESTINATION', columnLabel: 'Destination Airport',columnName:'Destination'},
                {id: 'FLIGHTNUMBER', columnLabel: 'Flight Number',columnName:'FlightNumber'},
                {id: 'TAILNUMBER', columnLabel: 'Tail Number',columnName:'TailNumber'},
  ];
  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() {
    if(!this.argument.value1){ 
    if(this.argument.required==1){
      this.argument.value1 = [  {id: 'YEAR', columnLabel: 'Year', columnName:'Year'},
                                  {id: 'MONTH', columnLabel: 'Month', columnName:'Month'},
                                    {id: 'DAY', columnLabel: 'Date' ,columnName:'Date'}];
    }
  }
  }

}
