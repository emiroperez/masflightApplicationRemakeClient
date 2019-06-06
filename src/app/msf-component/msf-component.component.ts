import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-component',
  templateUrl: './msf-component.component.html'
})
export class MsfComponentComponent implements OnInit {

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

  orderOptionArgumentsBy(prop: string)
  {
    return this.globals.currentOption.menuOptionArguments.sort ((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }
}
