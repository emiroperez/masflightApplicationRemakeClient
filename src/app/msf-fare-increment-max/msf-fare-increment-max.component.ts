import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-fare-increment-max',
  templateUrl: './msf-fare-increment-max.component.html',
  styleUrls: ['./msf-fare-increment-max.component.css']
})
export class MsfFareIncrementMaxComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 
  data: any[] = [
                {id: '0.01', name: '$0.01'},
                {id: '0.05', name: '$0.05'},
                {id: '0.10', name: '$0.10' },
                {id: '0.25', name: '$0.25'},
                {id: '0.33', name: '$0.33'},
                {id: '0.50', name: '$0.50'}
  ];
  constructor() { }


  ngOnInit() { 
    this.argument.value1 = {id: '0.25', name: '$0.25'};
  }

}
