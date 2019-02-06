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
    {id: "ShortestRoute" ,name:"Shortest Route"},
    {id: "5" ,name:"5%"},
    {id: "10" ,name:"10%"},
    {id: "15" ,name:"15%"},
    {id: "20" ,name:"20%"},
    {id: "25" ,name:"25%"},
    {id: "30" ,name:"30%"},
    {id: "35" ,name:"35%"},
    {id: "40" ,name:"40%"},
    {id: "45" ,name:"45%"},
    {id: "50" ,name:"50%"}
];
constructor() { }


ngOnInit() { 
  this.argument.value1  = {id: "25" ,name:"25%"};
}
}
