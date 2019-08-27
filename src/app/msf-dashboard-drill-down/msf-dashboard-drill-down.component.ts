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
      panelNameCtrl: new FormControl ({ value: '', disabled: true })
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
    let i, option;

    this.currentIndex = this.data.drillDownOptions.indexOf (component);
    this.currentValue = this.data.childPanelValues[this.currentIndex];
    this.lastValue = JSON.parse (JSON.stringify (this.currentValue));

    this.currentValue.chartColumnOptions = [];

    for (let columnConfig of this.currentValue.currentOption.columnOptions)
      this.currentValue.chartColumnOptions.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, item: columnConfig } );

    if (!this.currentValue.tableVariables.length)
    {
      this.currentValue.tableVariables = [];

      for (let columnConfig of this.currentValue.currentOption.columnOptions)
        this.currentValue.tableVariables.push ( { id: columnConfig.columnName, name: columnConfig.columnLabel, itemId: columnConfig.id, checked: true } );
    }

    // load the initial filter variables list
    this.filteredVariables.next (this.currentValue.chartColumnOptions.slice ());

    this.searchChange (this.variableFilterCtrl);
    this.searchChange (this.xaxisFilterCtrl);
    this.searchChange (this.valueFilterCtrl);

    // enable the combo box that allows to select the values for the chart
    this.chartForm.get ('chartCtrl').enable ();
    this.chartForm.get ('variableCtrl').enable ();
    this.chartForm.get ('panelNameCtrl').enable ();

    if (this.currentValue.currentChartType.flags & ChartFlags.XYCHART)
      this.chartForm.get ('xaxisCtrl').enable ();
    else
      this.chartForm.get ('xaxisCtrl').disable ();

    this.chartForm.get ('valueCtrl').enable ();
    this.chartForm.get ('functionCtrl').enable ();

    // convert values if loaded from the database
    if (this.convertValues[this.currentIndex])
    {
      let variableIndex = -1, xAxisIndex = -1, valueColumnIndex = -1;

      this.convertValues[this.currentIndex] = false;

      for (let i = 0; i < this.currentValue.chartColumnOptions.length; i++)
      {
        let chartColumnOption = this.currentValue.chartColumnOptions[i];

        if (this.lastValue.variable === chartColumnOption.item.id && variableIndex == -1)
          variableIndex = i;

        if (this.lastValue.xaxis === chartColumnOption.item.id && xAxisIndex == -1)
          xAxisIndex = i;

        if (this.lastValue.valueColumn === chartColumnOption.item.id && valueColumnIndex == -1)
          valueColumnIndex = i;

        if (variableIndex != -1 && xAxisIndex != -1 && valueColumnIndex != -1)
          break;
      }

      this.lastValue.currentChartType = this.chartTypes[this.lastValue.currentChartType];
      this.lastValue.variable = (variableIndex != -1 ? this.currentValue.chartColumnOptions[variableIndex] : null);
      this.lastValue.xaxis = (xAxisIndex != -1 ? this.currentValue.chartColumnOptions[xAxisIndex] : null);
      this.lastValue.valueColumn = (valueColumnIndex != -1 ? this.currentValue.chartColumnOptions[valueColumnIndex] : null);
      this.lastValue.function = this.data.functions[this.lastValue.function];

      this.currentValue.currentChartType = this.chartTypes[this.currentValue.currentChartType];
      this.currentValue.variable = (variableIndex != -1 ? this.currentValue.chartColumnOptions[variableIndex] : null);
      this.currentValue.xaxis = (xAxisIndex != -1 ? this.currentValue.chartColumnOptions[xAxisIndex] : null);
      this.currentValue.valueColumn = (valueColumnIndex != -1 ? this.currentValue.chartColumnOptions[valueColumnIndex] : null);
      this.currentValue.function = this.data.functions[this.currentValue.function];

      if (this.currentValue.currentChartType.flags & ChartFlags.TABLE)
      {
        for (i = 0; i < this.currentValue.lastestResponse.length; i++)
        {
          let tableColumn = this.currentValue.lastestResponse[i];
  
          if (tableColumn.id == null)
            continue;
    
          for (let j = 0; j < this.currentValue.tableVariables.length; j++)
          {
            let curVariable = this.currentValue.tableVariables[j];
    
            if (curVariable.itemId == tableColumn.id)
            {
              curVariable.checked = tableColumn.checked;
              break;
            }
          }
        }
  
        this.lastValue.tableVariables = JSON.parse (JSON.stringify (this.currentValue.tableVariables));
      }
    }
    else
      this.lastValue.tableVariables = JSON.parse (JSON.stringify (this.currentValue.tableVariables));

    // set combo box values if necessary
    if (this.currentValue.currentChartType != null && this.currentValue.currentChartType != -1)
    {
      for (i = 0; i < this.chartTypes.length; i++)
      {
        option = this.chartTypes[i];

        if (option.name == this.currentValue.currentChartType.name)
        {
          this.chartForm.get ('chartCtrl').setValue (option);
          this.checkChartType (option);
          break;
        }
      }
    }
    else
      this.chartForm.get ('chartCtrl').setValue ('');

    if (this.currentValue.variable != null && this.currentValue.variable != -1)
    {
      for (i = 0; i < this.currentValue.chartColumnOptions.length; i++)
      {
        option = this.currentValue.chartColumnOptions[i];

        if (option.id == this.currentValue.variable.id)
        {
          this.currentValue.variable = option;
          this.chartForm.get ('variableCtrl').setValue (option);
          break;
        }
      }
    }

    if (this.currentValue.xaxis != null && this.currentValue.xaxis != -1)
    {
      for (i = 0; i < this.currentValue.chartColumnOptions.length; i++)
      {
        option = this.currentValue.chartColumnOptions[i];

        if (option.id == this.currentValue.xaxis.id)
        {
          this.currentValue.xaxis = option;
          this.chartForm.get ('xaxisCtrl').setValue (option);
          break;
        }
      }
    }

    if (this.currentValue.valueColumn != null && this.currentValue.valueColumn != -1)
    {
      for (i = 0; i < this.currentValue.chartColumnOptions.length; i++)
      {
        option = this.currentValue.chartColumnOptions[i];

        if (option.id == this.currentValue.valueColumn.id)
        {
          this.currentValue.valueColumn = option;
          this.chartForm.get ('valueCtrl').setValue (option);
          break;
        }
      }
    }

    if (this.currentValue.function != null && this.currentValue.function != -1)
    {
      for (i = 0; i < this.data.functions.length; i++)
      {
        option = this.data.functions[i];

        if (option.id == this.currentValue.function.id)
        {
          this.currentValue.function = option;
          this.chartForm.get ('functionCtrl').setValue (option);
          break;
        }
      }
    }
    else
      this.chartForm.get ('functionCtrl').setValue ('');

    this.chartForm.get ('panelNameCtrl').setValue (this.currentValue.chartName);
  }

  getOption(dashboardPanelOption)
  {
    if (dashboardPanelOption != null)
    {
      for (let option of this.data.options)
      {
        if (option.id == dashboardPanelOption.id)
          return option;
      }
    }

    return null;
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

            _this.data.childPanelValues.push (new MsfDashboardPanelValues (_this.data.options,
              panel.title, panel.id, null, null, _this.getOption (panel.option),
              panel.analysis, panel.xaxis, panel.values, panel.function,
              panel.chartType, null, panel.lastestResponse, panel.paletteColors));

            _this.convertValues.push (true);
            break;
          }
          else if (j == data.length - 1)
          {
            _this.data.childPanelValues.push (new MsfDashboardPanelValues (_this.data.drillDownOptions,
              "New Child Panel", -1, null, null, _this.getOption (_this.data.drillDownOptions[i].childrenOptionId)));

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
          "New Child Panel", -1, null, null, _this.getOption (_this.data.drillDownOptions[i].childrenOptionId)));

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

  isTablePanel(): boolean
  {
    return !((this.currentValue != null && !(this.currentValue.currentChartType.flags & ChartFlags.TABLE))
      || this.currentValue == null);
  }

  deleteColumnFromTable(index): void
  {
    this.currentValue.tableVariables.splice (index, 1);
  }
}
