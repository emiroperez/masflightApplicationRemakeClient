import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { Globals } from '../globals/Globals';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-msf-partial-summaries',
  templateUrl: './msf-partial-summaries.component.html',
  styleUrls: ['./msf-partial-summaries.component.css']
})
export class MsfPartialSummariesComponent {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  colBreakers: any[] = [];
  colAggregators: any[] = [];

  countAlias: string = "";
  countRecords: boolean = false;
  isMobile: boolean = false;

  functions: any[] = [
    { id: 'avg', name: 'Average' },
    { id: 'sum', name: 'Summary' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' }
  ];

  constructor(public globals: Globals, private media: MediaMatcher, private changeDetectorRef: ChangeDetectorRef, public dialogRef: MatDialogRef<MsfPartialSummariesComponent>,
    @Inject(MAT_DIALOG_DATA) public data)
  {
    this.mobileQuery = media.matchMedia ('(max-width: 480px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges ();
    this.mobileQuery.addListener (this._mobileQueryListener);

    if (this.data.partialSummaryValues == null)
      return;

    for (let colBreaker of this.data.partialSummaryValues.columnBreakers)
    {
      let temp = this.data.metadata[0];

      for (let column of this.data.metadata)
      {
        if (column.id == colBreaker.column.id)
        {
          temp = column;
          break;
        }
      }

      this.colBreakers.push ({
        column: temp,
        summary: colBreaker.summary,
        mouseover: false
      });
    }

    for (let colAggregator of this.data.partialSummaryValues.columnBreakers[0].aggregators)
    {
      let temp = this.data.metadata[0];

      for (let column of this.data.metadata)
      {
        if (column.id == colAggregator.column.id)
        {
          temp = column;
          break;
        }
      }

      this.colAggregators.push ({
        column: temp,
        function: colAggregator.function,
        alias: colAggregator.alias,
        mouseover: false
      });
    }

    this.countRecords = this.data.partialSummaryValues.countRecords;
    this.countAlias = this.data.partialSummaryValues.countAlias;
  }

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
