import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-circuity',
  templateUrl: './msf-circuity.component.html',
  styleUrls: ['./msf-circuity.component.css']
})
export class MsfCircuityComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  data: any[] = [
    {id: "0.0" ,name:"Shortest Route"},
    {id: "0.05" ,name:"5%"},
    {id: "0.10" ,name:"10%"},
    {id: "0.15" ,name:"15%"},
    {id: "0.20" ,name:"20%"},
    {id: "0.25" ,name:"25%"},
    {id: "0.30" ,name:"30%"},
    {id: "0.35" ,name:"35%"},
    {id: "0.40" ,name:"40%"},
    {id: "0.45" ,name:"45%"},
    {id: "0.50" ,name:"50%"}
];
constructor() { }


ngOnInit() { 
  this.argument.value1  = {id: "0.25" ,name:"25%"};
}
}
