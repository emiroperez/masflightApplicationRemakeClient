import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-stops',
  templateUrl: './msf-stops.component.html',
  styleUrls: ['./msf-stops.component.css']
})
export class MsfStopsComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  data: any[] = [
    {id: "" ,name:"Nonstops"},
    {id: "1" ,name:"1 Stop"},
    {id: "2" ,name:"2 Stops"},
    {id: "3" ,name:"3 Stops"}
];
constructor() { }


ngOnInit() { 
  if(!this.argument.value1){
  this.argument.value1  = {id: "1" ,name:"1 Stop"};
  }
}

}
