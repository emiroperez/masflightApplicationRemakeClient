import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-exclude-itineraries-checkbox',
  templateUrl: './msf-exclude-itineraries-checkbox.component.html',
  styleUrls: ['./msf-exclude-itineraries-checkbox.component.css']
})
export class MsfExcludeItinerariesCheckboxComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  selected: any[] = [];
  all = {"checked":false};
  

  data =  [
      {"id":1,
      "name":"Exclude Connecting Itineraries"}
  ];

  constructor(public globals: Globals) { }

  ngOnInit() { 
    
  }
}
