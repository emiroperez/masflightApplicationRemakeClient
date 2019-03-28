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

  private convertValues: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<MsfDashboardDrillDownComponent>,
    public globals: Globals,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    // set initial values
    this.chartForm = this.formBuilder.group ({
      chartCtrl: new FormControl ({ value: '', disabled: true }),
      variableCtrl: new FormControl ({ value: '', disabled: true }),
      xaxisCtrl: new FormControl ({ value: '', disabled: true }),
      valueCtrl: new FormControl ({ value: '', disabled: true }),
      functionCtrl: new FormControl ({ value: '', disabled: true })
    });

    // configure child panels in order to be able to configure the drill down settings
    this.globals.popupLoading = true;
    service.getDrillDown (this, this.data.optionId, this.setDrillDownList, this.handlerError);
  }

  ngOnDestroy()
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  onNoClick(): void
  {
    this.dialogRef.close (false);
  }

  closeDialog(): void
  {
    this.dialogRef.close (false);
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

    // enable the combo box that allows to select the values for the chart
    _this.chartForm.get ('chartCtrl').enable ();
    _this.chartForm.get ('variableCtrl').enable ();

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

      _this.lastValue.currentChartType = _this.data.chartTypes[_this.lastValue.currentChartType];
      _this.lastValue.variable = _this.currentValue.chartColumnOptions[_this.lastValue.variable];
      _this.lastValue.xaxis = _this.currentValue.chartColumnOptions[_this.lastValue.xaxis];
      _this.lastValue.valueColumn = _this.currentValue.chartColumnOptions[_this.lastValue.valueColumn];
      _this.lastValue.function = _this.data.functions[_this.lastValue.function];

      _this.currentValue.currentChartType = _this.data.chartTypes[_this.currentValue.currentChartType];
      _this.currentValue.variable = _this.currentValue.chartColumnOptions[_this.currentValue.variable];
      _this.currentValue.xaxis = _this.currentValue.chartColumnOptions[_this.currentValue.xaxis];
      _this.currentValue.valueColumn = _this.currentValue.chartColumnOptions[_this.currentValue.valueColumn];
      _this.currentValue.function = _this.data.functions[_this.currentValue.function];
    }

    // set combo box values if necessary
    if (_this.currentValue.currentChartType != null && _this.currentValue.currentChartType != -1)
    {
      for (i = 0; i < _this.data.chartTypes.length; i++)
      {
        option = _this.data.chartTypes[i];

        if (option.name == _this.currentValue.currentChartType.name)
        {
          _this.chartForm.get ('chartCtrl').setValue (option);
          _this.checkChartType (option);
          break;
        }
      }
    }

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

    _this.globals.popupLoading = false;
  }

  setDrillDownList(_this, data)
  {
    if (!data.length)
    {
      _this.globals.popupLoading = false;
      _this.dialogRef.close (true);
      return;
    }

    for (let i = 0; i < data.length; i++)
      _this.data.drillDownOptions.push (data[i]);

    // prepare the drill down form combo box
    _this.optionSearchChange (_this.dataFormFilterCtrl);

    _this.service.getChildPanels (_this, _this.data.parentPanelId, _this.setChildPanels, _this.handlerError);
  }

  setChildPanels(_this, data)
  {
    if (data.length)
    {
      for (let i = 0, j = 0; i < _this.data.drillDownOptions.length; i++)
      {
        _this.data.childPanelsConfigured.push (false);

        if (j != data.length && data[j].option.id == _this.data.drillDownOptions[i].childrenOptionId.id)
        {
          let panel = data[j];

          _this.data.childPanelValues.push (new MsfDashboardPanelValues (panel.id,
            panel.title, panel.id, null, null, panel.option, null,
            panel.analysis, panel.xaxis, panel.values, panel.function,
            panel.chartType, null, null, panel.paletteColors));

          _this.convertValues.push (true);
          j++;
        }
        else
        {
          _this.data.childPanelValues.push (new MsfDashboardPanelValues (_this.data.drillDownOptions,
            _this.data.drillDownOptions[i].title, -1, null, null, _this.data.drillDownOptions[i]));

          _this.data.childPanelValues[i].currentChartType = _this.data.chartTypes[0];
          _this.convertValues.push (false);
        }
      }
    }
    else
    {
      for (let i = 0; i < _this.data.drillDownOptions.length; i++)
      {
        _this.data.childPanelsConfigured.push (false);

        _this.data.childPanelValues.push (new MsfDashboardPanelValues (_this.data.drillDownOptions,
          _this.data.drillDownOptions[i].title, -1, null, null));

        _this.data.childPanelValues[i].currentChartType = _this.data.chartTypes[0];
      }
    }

    _this.globals.popupLoading = false;
  }

  handlerError(_this, result): void
  {
    console.log (result);
    _this.globals.popupLoading = false;  
  }

  checkIfPanelIsConfigured(): void
  {
    // make sure that every value is not null
    if (this.currentValue.currentChartType == null
      || this.currentValue.variable == null
      || this.currentValue.xaxis == null
      || this.currentValue.valueColumn == null
      || this.currentValue.function == null)
      return;

    // al least one value must be changed
    if (this.currentValue.currentChartType == this.lastValue.currentChartType
      && this.currentValue.variable == this.lastValue.variable
      && this.currentValue.xaxis == this.lastValue.xaxis
      && this.currentValue.valueColumn == this.lastValue.valueColumn
      && this.currentValue.function == this.lastValue.function)
      return;

    this.data.childPanelsConfigured[this.currentIndex] = true;
  }

  checkChartType(value): void
  {
    this.currentValue.currentChartType = value;

    if (!(this.currentValue.currentChartType.flags & ChartFlags.XYCHART))
    {
      this.currentValue.xaxis = null;
      this.chartForm.get ('xaxisCtrl').reset ();
      this.chartForm.get ('xaxisCtrl').disable ();
    }
    else
      this.chartForm.get ('xaxisCtrl').enable ();

    this.chartForm.get ('variableCtrl').enable ();
    this.chartForm.get ('valueCtrl').enable ();

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
}
