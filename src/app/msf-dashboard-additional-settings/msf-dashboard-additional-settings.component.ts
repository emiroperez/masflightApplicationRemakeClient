import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-dashboard-additional-settings',
  templateUrl: './msf-dashboard-additional-settings.component.html'
})
export class MsfDashboardAdditionalSettingsComponent {
  filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  columnFilterCtrl: FormControl = new FormControl ();
  _onDestroy = new Subject<void> ();

  advSettingsOpen: number = 0;

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardAdditionalSettingsComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    if (!data.limitConfig && !data.limitAggregatorValue && data.thresholdForm)
      this.advSettingsOpen = 4; // "open" the form threshold menu
    else if (!data.limitConfig && !data.limitAggregatorValue && !data.thresholdForm)
      this.advSettingsOpen = 2; // open color picker by default if there is no limit configuration for now

    if (data.values.limitMode == null)
      data.values.limitMode = 0;

    if (data.values.limitAmount == null)
      data.values.limitAmount = 10;

    this.searchChange (this.columnFilterCtrl);
    this.filteredVariables.next (this.data.values.chartColumnOptions.slice ());
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  trackColor(index): number
  {
    return index;
  }

  addThreshold(): void
  {
    this.data.values.thresholds.push ({
      min: 0,
      max: 0,
      color: "#000000"
    });
  }

  removeThreshold(): void
  {
    if (this.data.values.thresholds.length)
      this.data.values.thresholds.pop ();
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  componentClickHandler(index: number): void
  {
    if (this.advSettingsOpen == index)
      this.advSettingsOpen = 0; // close if open
    else
      this.advSettingsOpen = index;
  }

  searchChange(filterCtrl): void
  {
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterVariables (filterCtrl);
      });
  }

  filterVariables(filterCtrl): void
  {
    if (!this.data.values.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredVariables.next (this.data.values.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredVariables.next (
      this.data.values.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }
}
