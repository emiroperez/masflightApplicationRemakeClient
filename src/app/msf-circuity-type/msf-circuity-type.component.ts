import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-circuity-type',
  templateUrl: './msf-circuity-type.component.html',
  styleUrls: ['./msf-circuity-type.component.css']
})
export class MsfCircuityTypeComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  data: any[] = [
    {id: "DISTANCE" ,name:"Distance"},
    {id: "TIME" ,name:"Time"}
];
constructor() { }


ngOnInit() { 
  this.argument.value1  = {id: "DISTANCE" ,name:"Distance"};
}

}
