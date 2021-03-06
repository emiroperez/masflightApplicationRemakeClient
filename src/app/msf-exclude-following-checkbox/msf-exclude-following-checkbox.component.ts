import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-exclude-following-checkbox',
  templateUrl: './msf-exclude-following-checkbox.component.html',
  styleUrls: ['./msf-exclude-following-checkbox.component.css']
})
export class MsfExcludeFollowingCheckboxComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();
  
  selected: any[] = [];
  all = {"checked":false};
  

  data =  [
      {"id":1,
      "name":"Exclude Bulk Fares"}
  ];

  constructor(public globals: Globals) { }

  ngOnInit() { 
    this.argument.value1 = true;
  }

}
