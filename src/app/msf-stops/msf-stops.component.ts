import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-stops',
  templateUrl: './msf-stops.component.html',
  styleUrls: ['./msf-stops.component.css']
})
export class MsfStopsComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  data: any[] = [
    {id: "" ,name:"Nonstops"},
    {id: "1" ,name:"1 Stop"},
    {id: "2" ,name:"2 Stops"},
    {id: "3" ,name:"3 Stops"}
];
constructor() { }


ngOnInit() { 
  this.argument.value1  = {id: "1" ,name:"1 Stop"};
}

}
