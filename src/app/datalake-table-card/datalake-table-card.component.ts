import { Component, OnInit } from '@angular/core';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-table-card',
  templateUrl: './datalake-table-card.component.html'
})
export class DatalakeTableCardComponent implements OnInit {

  constructor(public globals: Globals) { }

  ngOnInit() {
  }

}
