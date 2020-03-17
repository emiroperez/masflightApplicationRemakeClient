import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-partial-summaries',
  templateUrl: './msf-partial-summaries.component.html'
})
export class MsfPartialSummariesComponent {
  colBreakers: any[] = [];
  colAggregators: any[] = [];

  countAlias: string = "";
  countRecords: boolean = false;

  functions: any[] = [
    { id: 'avg', name: 'Average' },
    { id: 'sum', name: 'Sum' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' },
    { id: 'count', name: 'Count' }
  ];

  constructor(public globals: Globals, @Inject(MAT_DIALOG_DATA) public data) { }

  addColumnBreaker(): void
  {
    this.colBreakers.push ({
      column: null,
      summary: false
    });
  }

  removeColumnBreaker(pos: number): void
  {
    this.colBreakers.splice (pos, 1);
  }

  addColumnAggregator(): void
  {
    this.colAggregators.push ({
      column: null,
      function: 'avg',
      alias: ""
    });
  }

  removeColumnAggregator(pos: number): void
  {
    this.colAggregators.splice (pos, 1);
  }
}
