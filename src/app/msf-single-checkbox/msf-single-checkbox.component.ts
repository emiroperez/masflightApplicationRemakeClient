import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-single-checkbox',
  templateUrl: './msf-single-checkbox.component.html',
  styleUrls: ['./msf-single-checkbox.component.css']
})
export class MsfSingleCheckboxComponent implements OnInit {


  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  constructor() { }

  ngOnInit() {
    if(this.argument.value1==null || this.argument.value1== undefined){
      if(this.argument.required==1){
        this.argument.value1 = true;
      }else{
        this.argument.value1 = false;
      }
  }
  }

}
