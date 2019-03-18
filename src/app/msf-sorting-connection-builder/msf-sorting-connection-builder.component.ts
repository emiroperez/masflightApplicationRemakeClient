import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-sorting-connection-builder',
  templateUrl: './msf-sorting-connection-builder.component.html',
  styleUrls: ['./msf-sorting-connection-builder.component.css']
})
export class MsfSortingConnectionBuilderComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 
  data: any[] = [
                {id: 'NUMBERSTOPS', name: 'Number of Stops'},
                {id: 'DEPARTURETIME', name: 'Departure Time'},
                {id: 'ARRIVALTIME', name: 'Arrival Time'},
                {id: 'TOTALDISTANCE', name: 'Total Distance'},
                {id: 'TOTALTIME', name: 'Total Time'},
  ];
  constructor() { }


  ngOnInit() { 
    if(!this.argument.value1){
      this.argument.value1 =   {id: 'NUMBERSTOPS', name: 'Number of Stops'};
    }
  }
}
