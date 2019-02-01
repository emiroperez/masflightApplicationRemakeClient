import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-single-checkbox',
  templateUrl: './msf-single-checkbox.component.html',
  styleUrls: ['./msf-single-checkbox.component.css']
})
export class MsfSingleCheckboxComponent implements OnInit {


  @Input("argument") public argument: Arguments;
  constructor() { }

  ngOnInit() {
    if(this.argument.required){
      this.argument.value1 = true;
    }else{
      this.argument.value1 = false;
    }

  }

}
