import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-fare-increments',
  templateUrl: './msf-fare-increments.component.html',
  styleUrls: ['./msf-fare-increments.component.css']
})
export class MsfFareIncrementsComponent implements OnInit {
  
  @Input("argument") public argument: Arguments;
 
  increments: any[] = [
                {id: '0.01', name: '$0.01'},
                {id: '0.05', name: '$0.05'},
                {id: '0.10', name: '$0.10' },
                {id: '0.25', name: '$0.25'},
                {id: '0.33', name: '$0.33'},
                {id: '0.50', name: '$0.50'}
  ];
  constructor(private globals: Globals) { }


  ngOnInit() { 
    this.argument.value1 = {id: '0.05', name: '$0.05'};
  }

}
