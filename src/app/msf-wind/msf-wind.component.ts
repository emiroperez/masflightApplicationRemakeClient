import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-wind',
  templateUrl: './msf-wind.component.html',
  styleUrls: ['./msf-wind.component.css']
})
export class MsfWindComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor() { }

  ngOnInit() {
    this.argument.value1 = 0;
    this.argument.value2 = 200;
    this.argument.value3 = 'kts';
  }

}
