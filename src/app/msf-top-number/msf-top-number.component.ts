import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-top-number',
  templateUrl: './msf-top-number.component.html',
  styleUrls: ['./msf-top-number.component.css']
})
export class MsfTopNumberComponent implements OnInit {


  @Input("argument") public argument: Arguments;
  constructor() { }

  ngOnInit() {
    this.argument.value1=10;
  }

}
