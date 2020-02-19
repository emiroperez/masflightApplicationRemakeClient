import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-sorting-nonstop-capacity',
  templateUrl: './msf-sorting-nonstop-capacity.component.html',
  styleUrls: ['./msf-sorting-nonstop-capacity.component.css']
})
export class MsfSortingNonstopCapacityComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  data: any[] = [
                {id: 'DEPARTURETIME', name: 'Departure Time', column:'Departure Time'},
                {id: 'ARRIVALTIME', name: 'Arrival Time', column:'Arrival Time'},
                {id: 'TOTALDISTANCE', name: 'Total Distance' ,column:'Total Distance'},
                {id: 'TOTALTIME', name: 'Total Time', column: 'Total Time'}
  ];
  constructor() { }


  ngOnInit() { 
    if(!this.argument.value1){
      this.argument.value1 =   {id: 'DEPARTURETIME', name: 'Departure Time', column:'Departure Time'};
    }
  }
}
