import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-wind-direction',
  templateUrl: './msf-wind-direction.component.html',
  styleUrls: ['./msf-wind-direction.component.css']
})
export class MsfWindDirectionComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  constructor() { }

  ngOnInit() {
    this.argument.value1 = 0;
    this.argument.value2 = 360;
  }

}
