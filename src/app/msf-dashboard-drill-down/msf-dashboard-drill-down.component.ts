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

  chartForm: FormGroup;
  currentValue: MsfDashboardPanelValues;
  lastValue: MsfDashboardPanelValues;
  currentIndex: number = -1;

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
  public tableFilterCtrl: FormControl = new FormControl ();

  private convertValues: any[] = [];

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
    { name: 'Table', flags: ChartFlags.TABLE }
  ];

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardDrillDownComponent>,
    public globals: Globals,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.data.childChart.types = this.chartTypes;

    // prepare the drill down form combo box
    this.optionSearchChange (this.dataFormFilterCtrl);

    // set initial values
    this.chartForm = this.formBuilder.group ({
      chartCtrl: new FormControl ({ value: '', disabled: true }),
      variableCtrl: new FormControl ({ value: '', disabled: true }),
      xaxisCtrl: new FormControl ({ value: '', disabled: true }),
      valueCtrl: new FormControl ({ value: '', disabled: true }),
      functionCtrl: new FormControl ({ value: '', disabled: true }),
      panelNameCtrl: new FormControl ({ value: '', disabled: true }),
      tableCtrl: new FormControl ({ value: '', disabled: true })
    });

    // configure child panels in order to be able to configure the drill down settings
    this.globals.popupLoading = true;
    this.service.getChildPanels (this, data.parentPanelId, this.setChildPanels, this.handlerError);
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

  goToColorPicker(): void
  {
    let dialogRef, dialogHeight, numColors;

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

    dialogRef = this.dialog.open (MsfDashboardColorPickerComponent, {
      height: dialogHeight,
      width: '400px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      autoFocus: false,
      data: {
        title: this.currentValue.chartName,
        colors: this.currentValue.paletteColors,
        numColors: numColors
      }
    });

    dialogRef.afterClosed ().subscribe (
      () => {
        this.checkIfPanelIsConfigured ();
      }
    );
  }

  loadChartFilterValues(component): void
  {
    this.currentIndex = this.data.drillDownOptions.indexOf (component);
    this.currentValue = this.data.childPanelValues[this.currentIndex];
    this.lastValue = JSON.parse (JSON.stringify (this.currentValue));
    this.globals.popupLoading = true;
    this.getChartFilterValues (component.childrenOptionId.id, this.addChartFilterValues);
  }

  getChartFilterValues(id, handlerSuccess): void
  {
    this.service.getChartFilterValues (this, id, handlerSuccess, this.handlerError);
  }

  addChartFilterValues(_this, data): void
  {
    let i, option;

    _this.currentValue.chartColumnOptions = [];
    for (let columnConfig of data)
      _this.currentValue.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );

    // load the initial filter variables list
    _this.filteredVariables.next (_this.currentValue.chartColumnOptions.slice ());

    _this.searchChange (_this.variableFilterCtrl);
    _this.searchChange (_this.xaxisFilterCtrl);
    _this.searchChange (_this.valueFilterCtrl);
    _this.searchChange (_this.tableFilterCtrl);

    // enable the combo box that allows to select the values for the chart
    _this.chartForm.get ('chartCtrl').enable ();
    _this.chartForm.get ('variableCtrl').enable ();
    _this.chartForm.get ('panelNameCtrl').enable ();

    if (_this.currentValue.currentChartType.flags & ChartFlags.XYCHART)
      _this.chartForm.get ('xaxisCtrl').enable ();
    else
      _this.chartForm.get ('xaxisCtrl').disable ();

    _this.chartForm.get ('valueCtrl').enable ();
    _this.chartForm.get ('functionCtrl').enable ();

    // convert values if loaded from the database
    if (_this.convertValues[_this.currentIndex])
    {
      _this.convertValues[_this.currentIndex] = false;

      _this.lastValue.currentChartType = _this.chartTypes[_this.lastValue.currentChartType];
      _this.lastValue.variable = _this.currentValue.chartColumnOptions[_this.lastValue.variable];
      _this.lastValue.xaxis = _this.currentValue.chartColumnOptions[_this.lastValue.xaxis];
      _this.lastValue.valueColumn = _this.currentValue.chartColumnOptions[_this.lastValue.valueColumn];
      _this.lastValue.function = _this.data.functions[_this.lastValue.function];

      _this.currentValue.currentChartType = _this.chartTypes[_this.currentValue.currentChartType];
      _this.currentValue.variable = _this.currentValue.chartColumnOptions[_this.currentValue.variable];
      _this.currentValue.xaxis = _this.currentValue.chartColumnOptions[_this.currentValue.xaxis];
      _this.currentValue.valueColumn = _this.currentValue.chartColumnOptions[_this.currentValue.valueColumn];
      _this.currentValue.function = _this.data.functions[_this.currentValue.function];

      if (_this.currentValue.currentChartType.flags & ChartFlags.TABLE)
      {
        for (i = 0; i < _this.currentValue.lastestResponse.length; i++)
        {
          let tableColumn = _this.currentValue.lastestResponse[i];
  
          for (let j = 0; j < _this.currentValue.chartColumnOptions.length; j++)
          {
            let curVariable = _this.currentValue.chartColumnOptions[j];
  
            if (curVariable.item.id == tableColumn.id)
            {
              _this.lastValue.tableVariables.push (curVariable);
              _this.currentValue.tableVariables.push (curVariable);
              break;
            }
          }
        }
      }
    }

    // set combo box values if necessary
    if (_this.currentValue.currentChartType != null && _this.currentValue.currentChartType != -1)
    {
      for (i = 0; i < _this.chartTypes.length; i++)
      {
        option = _this.chartTypes[i];

        if (option.name == _this.currentValue.currentChartType.name)
        {
          _this.chartForm.get ('chartCtrl').setValue (option);
          _this.checkChartType (option);
          break;
        }
      }
    }
    else
      _this.chartForm.get ('chartCtrl').setValue ('');

    if (_this.currentValue.variable != null && _this.currentValue.variable != -1)
    {
      for (i = 0; i < _this.currentValue.chartColumnOptions.length; i++)
      {
        option = _this.currentValue.chartColumnOptions[i];

        if (option.id == _this.currentValue.variable.id)
        {
          _this.currentValue.variable = option;
          _this.chartForm.get ('variableCtrl').setValue (option);
          break;
        }
      }
    }

    if (_this.currentValue.xaxis != null && _this.currentValue.xaxis != -1)
    {
      for (i = 0; i < _this.currentValue.chartColumnOptions.length; i++)
      {
        option = _this.currentValue.chartColumnOptions[i];

        if (option.id == _this.currentValue.xaxis.id)
        {
          _this.currentValue.xaxis = option;
          _this.chartForm.get ('xaxisCtrl').setValue (option);
          break;
        }
      }
    }

    if (_this.currentValue.valueColumn != null && _this.currentValue.valueColumn != -1)
    {
      for (i = 0; i < _this.currentValue.chartColumnOptions.length; i++)
      {
        option = _this.currentValue.chartColumnOptions[i];

        if (option.id == _this.currentValue.valueColumn.id)
        {
          _this.currentValue.valueColumn = option;
          _this.chartForm.get ('valueCtrl').setValue (option);
          break;
        }
      }
    }

    if (_this.currentValue.function != null && _this.currentValue.function != -1)
    {
      for (i = 0; i < _this.data.functions.length; i++)
      {
        option = _this.data.functions[i];

        if (option.id == _this.currentValue.function.id)
        {
          _this.currentValue.function = option;
          _this.chartForm.get ('functionCtrl').setValue (option);
          break;
        }
      }
    }
    else
      _this.chartForm.get ('functionCtrl').setValue ('');

    _this.chartForm.get ('panelNameCtrl').setValue (_this.currentValue.chartName);

    _this.globals.popupLoading = false;
  }

  setChildPanels(_this, data)
  {
    if (data.length)
    {
      for (let i = 0; i < _this.data.drillDownOptions.length; i++)
      {
        _this.data.childPanelsConfigured.push (false);

        for (let j = 0; j < data.length; j++)
        {
          if (data[j].option.id == _this.data.drillDownOptions[i].childrenOptionId.id)
          {
            let panel = data[j];

            _this.data.childPanelValues.push (new MsfDashboardPanelValues (panel.id,
              panel.title, panel.id, null, null, panel.option, null,
              panel.analysis, panel.xaxis, panel.values, panel.function,
              panel.chartType, null, panel.lastestResponse, panel.paletteColors));

            _this.convertValues.push (true);
            break;
          }
          else if (j == data.length - 1)
          {
            _this.data.childPanelValues.push (new MsfDashboardPanelValues (_this.data.drillDownOptions,
              "New Child Panel", -1, null, null, _this.data.drillDownOptions[i].childrenOptionId));

            _this.data.childPanelValues[i].currentChartType = _this.chartTypes[0];
            _this.convertValues.push (false);
          }
        }
      }
    }
    else
    {
      for (let i = 0; i < _this.data.drillDownOptions.length; i++)
      {
        _this.data.childPanelsConfigured.push (false);

        _this.data.childPanelValues.push (new MsfDashboardPanelValues (_this.data.drillDownOptions,
          "New Child Panel", -1, null, null, _this.data.drillDownOptions[i].childrenOptionId));

        _this.data.childPanelValues[i].currentChartType = _this.chartTypes[0];
        _this.convertValues.push (false);
      }
    }

    _this.globals.popupLoading = false;
  }

  handlerError(_this, result): void
  {
    console.log (result);
    _this.globals.popupLoading = false;  
  }

  checkPaletteColors(): boolean
  {
    let different: boolean;

    different = false;

    for (let i = 0; i < this.currentValue.paletteColors.length; i++)
    {
      if (this.currentValue.paletteColors[i] != this.lastValue.paletteColors[i])
      {
        different = true;
        break;
      }
    }

    return different;
  }

  checkIfPanelIsConfigured(): void
  {
    // make sure that every value is not null
    if (this.currentValue.currentChartType == null
      || this.currentValue.chartName == null)
      return;

    if (!(this.currentValue.currentChartType.flags & ChartFlags.TABLE)
      && (this.currentValue.variable == null
      || this.currentValue.valueColumn == null
      || this.currentValue.function == null))
      return;

    if (this.currentValue.currentChartType.flags & ChartFlags.XYCHART
      && this.currentValue.xaxis == null)
      return;

    // at least one value must be changed
    if (this.currentValue.currentChartType == this.lastValue.currentChartType
      && (!(this.currentValue.currentChartType.flags & ChartFlags.TABLE)
        && this.currentValue.variable == this.lastValue.variable)
      && (!(this.currentValue.currentChartType.flags & ChartFlags.TABLE)
        && this.currentValue.valueColumn == this.lastValue.valueColumn)
      && (!(this.currentValue.currentChartType.flags & ChartFlags.TABLE)
        && this.currentValue.function == this.lastValue.function)
      && this.currentValue.chartName == this.lastValue.chartName
      && (this.currentValue.currentChartType.flags & ChartFlags.XYCHART
        && this.currentValue.xaxis == this.lastValue.xaxis)
      && !this.checkPaletteColors ())
      return;

    this.data.childPanelsConfigured[this.currentIndex] = true;
  }

  checkPanelName(): void
  {
    this.currentValue.chartName = this.chartForm.get ('panelNameCtrl').value;
    this.checkIfPanelIsConfigured ();
  }

  checkChartType(value): void
  {
    this.currentValue.currentChartType = value;

    if (this.currentValue.currentChartType.flags & ChartFlags.TABLE)
    {
      this.currentValue.xaxis = null;
      this.chartForm.get ('xaxisCtrl').reset ();

      this.currentValue.valueColumn = null;
      this.chartForm.get ('valueCtrl').reset ();

      this.currentValue.variable = null;
      this.chartForm.get ('variableCtrl').reset ();
    }
    else if (!(this.currentValue.currentChartType.flags & ChartFlags.XYCHART))
    {
      this.currentValue.xaxis = null;
      this.chartForm.get ('xaxisCtrl').reset ();
      this.chartForm.get ('xaxisCtrl').disable ();

      this.currentValue.tableVariables = [];
      this.chartForm.get ('tableCtrl').reset ();
    }
    else
    {
      this.currentValue.tableVariables = [];
      this.chartForm.get ('xaxisCtrl').enable ();
      this.chartForm.get ('tableCtrl').reset ();
    }

    this.chartForm.get ('variableCtrl').enable ();
    this.chartForm.get ('valueCtrl').enable ();
    this.chartForm.get ('tableCtrl').enable ();

    this.checkIfPanelIsConfigured ();
  }

  checkVariable(value): void
  {
    this.currentValue.variable = value;
    this.checkIfPanelIsConfigured ();
  }

  checkXAxis(value): void
  {
    this.currentValue.xaxis = value;
    this.checkIfPanelIsConfigured ();
  }

  checkValue(value): void
  {
    this.currentValue.valueColumn = value;
    this.checkIfPanelIsConfigured ();
  }

  checkFunction(value): void
  {
    this.currentValue.function = value;
    this.checkIfPanelIsConfigured ();
  }

  isTablePanel(): boolean
  {
    return !((this.currentValue != null && !(this.currentValue.currentChartType.flags & ChartFlags.TABLE))
      || this.currentValue == null);
  }

  isTableVariableValid(): boolean
  {
    return this.chartForm.get ('tableCtrl').value;
  }

  addTableVariable(): void
  {
    this.currentValue.tableVariables.push (this.chartForm.get ('tableCtrl').value);
    this.chartForm.get ('tableCtrl').reset ();
  }

  deleteColumnFromTable(index): void
  {
    this.currentValue.tableVariables.splice (index, 1);
  }
}
