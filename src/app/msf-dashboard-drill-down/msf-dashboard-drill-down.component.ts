import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelect } from '@angular/material';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Globals } from '../globals/Globals';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';

@Component({
  selector: 'app-msf-dashboard-drill-down',
  templateUrl: './msf-dashboard-drill-down.component.html'
})
export class MsfDashboardDrillDownComponent {

  chartTypes:any[] = [
    { name: 'Bars', flags: ChartFlags.XYCHART },
    { name: 'Horizontal Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED },
    { name: 'Simple Bars', flags: ChartFlags.NONE },
    { name: 'Simple Horizontal Bars', flags: ChartFlags.ROTATED },
    { name: 'Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.STACKED },
    { name: 'Horizontal Stacked Bars', flags: ChartFlags.XYCHART | ChartFlags.ROTATED | ChartFlags.STACKED },
    { name: 'Funnel', flags: ChartFlags.FUNNELCHART },
    { name: 'Lines', flags: ChartFlags.XYCHART | ChartFlags.LINECHART },
    { name: 'Area', flags: ChartFlags.XYCHART | ChartFlags.AREACHART },
    { name: 'Stacked Area', flags: ChartFlags.XYCHART | ChartFlags.STACKED | ChartFlags.AREACHART },
    { name: 'Pie', flags: ChartFlags.PIECHART },
    { name: 'Donut', flags: ChartFlags.DONUTCHART },
    { name: 'Information', flags: ChartFlags.INFO }
  ];

  functions:any[] = [
    { id: 'avg', name: 'Average' },
    { id: 'sum', name: 'Sum' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' },
    { id: 'count', name: 'Count' }
  ];

  chartForm: FormGroup;
  values: MsfDashboardPanelValues;

  @ViewChild('variableSelect') variableSelect: MatSelect;
  @ViewChild('xaxisSelect') xaxisSelect: MatSelect;
  @ViewChild('valueSelect') valueSelect: MatSelect;

  private _onDestroy = new Subject<void> ();

  public filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public variableFilterCtrl: FormControl = new FormControl ();
  public xaxisFilterCtrl: FormControl = new FormControl ();

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardDrillDownComponent>,
    public globals: Globals,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.chartForm = this.formBuilder.group ({
      variableCtrl: new FormControl ({ value: '' }),
      xaxisCtrl: new FormControl ({ value: '', disabled: false })
    });

    this.filteredVariables.next (data.chartColumnOptions.slice ());

    this.searchChange (this.variableFilterCtrl);
    this.searchChange (this.xaxisFilterCtrl);
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  private filterVariables(filterCtrl): void
  {
    if (!this.data.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredVariables.next (this.data.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredVariables.next (
      this.data.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
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
}
