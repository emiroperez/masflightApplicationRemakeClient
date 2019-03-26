import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelect, MatDialog } from '@angular/material';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Globals } from '../globals/Globals';
import { MsfDashboardPanelValues } from '../msf-dashboard-panel/msf-dashboard-panelvalues';
import { MsfDashboardColorPickerComponent } from '../msf-dashboard-color-picker/msf-dashboard-color-picker.component';
import { ChartFlags } from '../msf-dashboard-panel/msf-dashboard-chartflags';
import { ApplicationService } from '../services/application.service';

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
    { name: 'Donut', flags: ChartFlags.DONUTCHART }//,
    // { name: 'Information', flags: ChartFlags.INFO }
  ];

  functions:any[] = [
    { id: 'avg', name: 'Average' },
    { id: 'sum', name: 'Sum' },
    { id: 'max', name: 'Max' },
    { id: 'min', name: 'Min' },
    { id: 'count', name: 'Count' }
  ];

  chartForm: FormGroup;
  currentValue: MsfDashboardPanelValues;
  childPanelValues: MsfDashboardPanelValues[] = [];

  paletteColors: string[] = [
    "#01b0a1",
    "#9b5e8e",
    "#fa5751",
    "#fd8b5a",
    "#80cfea",
    "#ff5900",
    "#005eff",
    "#ffff00",
    "#fc636b",
    "#ff7e00",
    "#3d67ce",
    "#fffefe"
  ];

  @ViewChild('variableSelect') variableSelect: MatSelect;
  @ViewChild('xaxisSelect') xaxisSelect: MatSelect;
  @ViewChild('valueSelect') valueSelect: MatSelect;

  private _onDestroy = new Subject<void> ();

  public filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public dataFormFilterCtrl: FormControl = new FormControl ();
  public variableFilterCtrl: FormControl = new FormControl ();
  public xaxisFilterCtrl: FormControl = new FormControl ();
  public valueFilterCtrl: FormControl = new FormControl ();

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardDrillDownComponent>,
    public globals: Globals,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    // prepare the drill down form combo box
    this.optionSearchChange (this.dataFormFilterCtrl);

    // add child panels in order to be able to configure the drill down settings
    for (let i = 0; i < data.drillDownOptions.length; i++)
    {
      this.childPanelValues.push (new MsfDashboardPanelValues (data.drillDownOptions,
        data.drillDownOptions[i].title, -1, null, null));

      this.childPanelValues[i].currentChartType = this.chartTypes[0];
    }

    this.currentValue = this.childPanelValues[0];

    // set initial values
    this.chartForm = this.formBuilder.group ({
      optionCtrl: new FormControl (),
      variableCtrl: new FormControl ({ value: '', disabled: true }),
      xaxisCtrl: new FormControl ({ value: '', disabled: true }),
      valueCtrl: new FormControl ({ value: '', disabled: true })
    });

    this.chartForm.get ('optionCtrl').setValue (data.drillDownOptions[0]);
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
    if (!this.currentValue.chartColumnOptions)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredVariables.next (this.currentValue.chartColumnOptions.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredVariables.next (
      this.currentValue.chartColumnOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
    );
  }

  private filterOptions(filterCtrl): void
  {
    if (!this.currentValue.options)
      return;

    // get the search keyword
    let search = filterCtrl.value;
    if (!search)
    {
      this.filteredOptions.next (this.currentValue.options.slice ());
      return;
    }

    search = search.toLowerCase ();
    this.filteredOptions.next (
      this.currentValue.options.filter (a => a.nameSearch.toLowerCase ().indexOf (search) > -1)
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

  optionSearchChange(filterCtrl): void
  {
    // load the initial option list
    this.filteredOptions.next (this.data.drillDownOptions.slice ());
    // listen for search field value changes
    filterCtrl.valueChanges
      .pipe (takeUntil (this._onDestroy))
      .subscribe (() => {
        this.filterOptions (filterCtrl);
      });
  }

  isInformationPanel(): boolean
  {
    return (this.currentValue.currentChartType.flags & ChartFlags.INFO) ? true : false;
  }

  goToColorPicker(): void
  {
    let dialogHeight, numColors;

    if (this.currentValue.currentChartType.flags & ChartFlags.XYCHART
      || this.currentValue.currentChartType.flags & ChartFlags.PIECHART
      || this.currentValue.currentChartType.flags & ChartFlags.FUNNELCHART)
    {
      dialogHeight = '340px';
      numColors = 12;
    }
    else
    {
      dialogHeight = '178px';
      numColors = 1;
    }

    this.dialog.open (MsfDashboardColorPickerComponent, {
      height: dialogHeight,
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      autoFocus: false,
      data: {
        title: this.currentValue.chartName,
        colors: this.paletteColors,
        numColors: numColors
      }
    });
  }

  loadChartFilterValues(component): void
  {
    this.currentValue = this.childPanelValues [this.data.drillDownOptions.indexOf (component)];
    this.globals.isLoading = true;
    this.getChartFilterValues (component.childrenOptionId, this.addChartFilterValues);
  }

  getChartFilterValues(id, handlerSuccess): void
  {
    this.service.getChartFilterValues (this, id, handlerSuccess, this.handlerError);
  }

  addChartFilterValues(_this, data): void
  {
    _this.currentValue.chartColumnOptions = [];
    for (let columnConfig of data)
      _this.currentValue.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );

    // load the initial filter variables list
    _this.filteredVariables.next (_this.currentValue.chartColumnOptions.slice ());

    _this.searchChange (_this.variableFilterCtrl);
    _this.searchChange (_this.xaxisFilterCtrl);
    _this.searchChange (_this.valueFilterCtrl);

    // reset chart filter values and disable generate chart button
    _this.chartForm.get ('variableCtrl').reset ();
    _this.chartForm.get ('xaxisCtrl').reset ();
    _this.chartForm.get ('valueCtrl').reset ();
    // _this.checkChartFilters ();

    // enable the combo box that allows to select the values for the chart
    _this.chartForm.get ('variableCtrl').enable ();

    if (_this.currentValue.currentChartType.flags & ChartFlags.XYCHART)
      _this.chartForm.get ('xaxisCtrl').enable ();

    _this.chartForm.get ('valueCtrl').enable ();

    // copy the category arguments settings from the parent panel and finish loading
    _this.currentValue.categoryOptions = JSON.parse (_this.data.categoryOptions);
    _this.globals.isLoading = false;
  }

  /*setCategories(_this, data): void
  {
    _this.currentValue.currentOptionCategories = [];

    for (let optionCategory of data)
      _this.currentValue.currentOptionCategories.push (optionCategory.categoryArgumentsId);
    _this.variableCtrlBtnEnabled = true;

    _this.chartForm.get ('variableCtrl').enable ();
    _this.chartForm.get ('infoNumVarCtrl').enable ();

    if (_this.currentValue.currentValue.currentChartType.flags & ChartFlags.XYCHART)
      _this.chartForm.get ('xaxisCtrl').enable ();

    _this.chartForm.get ('valueCtrl').enable ();

    _this.globals.isLoading = false;
  }*/

  handlerError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;  
  }

  checkChartType(): void
  {
    
  }
}
