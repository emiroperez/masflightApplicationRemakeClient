import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-fare-increments',
  templateUrl: './msf-fare-increments.component.html',
  styleUrls: ['./msf-fare-increments.component.css']
})
export class MsfFareIncrementsComponent implements OnInit {
  
  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();
 
  increments: any[] = [
                {id: '0.01', name: '$0.01'},
                {id: '0.05', name: '$0.05'},
                {id: '0.10', name: '$0.10' },
                {id: '0.25', name: '$0.25'},
                {id: '0.33', name: '$0.33'},
                {id: '0.50', name: '$0.50'}
  ];
  constructor(private globals: Globals) { }


  ngOnInit()
  {
    if (!this.argument.value1)
      this.argument.value1 = { id: '0.05', name: '$0.05' };

    if (!this.argument.value2)
      this.argument.value2 =  {id: '0.10', name: '$0.10' };

    if (!this.argument.value3)
      this.argument.value3 = { id: '0.25', name: '$0.25' };
  }
}
