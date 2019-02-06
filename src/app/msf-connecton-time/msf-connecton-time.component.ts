import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-connecton-time',
  templateUrl: './msf-connecton-time.component.html',
  styleUrls: ['./msf-connecton-time.component.css']
})
export class MsfConnectonTimeComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  constructor() { }

  ngOnInit() {
    this.argument.value1 = 20;
    this.argument.value2 = 120;
  }


}
