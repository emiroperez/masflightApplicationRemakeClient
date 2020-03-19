import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { Globals } from '../globals/Globals';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-msf-partial-summaries',
  templateUrl: './msf-partial-summaries.component.html',
  styleUrls: ['./msf-partial-summaries.component.css']
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
    { id: 'min', name: 'Min' }
  ];

  constructor(public globals: Globals, public dialogRef: MatDialogRef<MsfPartialSummariesComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  addColumnBreaker(): void
  {
    this.colBreakers.push ({
      column: this.data.metadata[0],
      summary: false,
      mouseover: false
    });
  }

  removeColumnBreaker(pos: number): void
  {
    this.colBreakers.splice (pos, 1);
  }

  addColumnAggregator(): void
  {
    this.colAggregators.push ({
      column: this.data.metadata[0],
      function: 'avg',
      alias: "",
      mouseover: false
    });
  }

  removeColumnAggregator(pos: number): void
  {
    this.colAggregators.splice (pos, 1);
  }

  swapColumnBreakers(event: CdkDragDrop<any[]>): void
  {
    // move items
    moveItemInArray (this.colBreakers, event.previousIndex, event.currentIndex);
  }

  swapColumnAggregator(event: CdkDragDrop<any[]>): void
  {
    // move items
    moveItemInArray (this.colAggregators, event.previousIndex, event.currentIndex);
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  generateSummary(): void
  {
    for (let colBreaker of this.colBreakers)
      colBreaker.aggregators = JSON.parse (JSON.stringify (this.colAggregators));

    this.dialogRef.close ({
      columnBreakers: this.colBreakers,
      countRecords: this.countRecords,
      countAlias: this.countAlias
    });
  }
}
