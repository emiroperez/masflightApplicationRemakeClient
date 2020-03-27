import { Component, Inject, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';

import { Utils } from '../commons/utils';
import { Globals } from '../globals/Globals';
import { MsfDynamicTableAliasComponent } from '../msf-dynamic-table-alias/msf-dynamic-table-alias.component';
import { MessageComponent } from '../message/message.component';
import { MsfDynamicTableComponent } from '../msf-dynamic-table/msf-dynamic-table.component';

export interface DialogData {
  metadata: any[];
  dynamicTableValues: any;
}

@Component({
  selector: 'app-msf-dynamic-table-variables',
  templateUrl: './msf-dynamic-table-variables.component.html',
  styleUrls: ['./msf-dynamic-table-variables.component.css']
})
export class MsfDynamicTableVariablesComponent {

  @ViewChild('dynamicTablePreview', { static: false })
  dynamicTablePreview: MsfDynamicTableComponent;

  xaxis: any[] = [];
  yaxis: any[] = [];
  values: any[] = [];
  columns: any[] = [];

  previewAvailable: boolean = false;
  tableLoading: boolean = false;
  selectedVariable: any = null;
  funcListPosX: number = 0;
  funcListPosY: number = 0;

  draggingColumn: boolean = false;
  xAxisMouseover: boolean = false;
  yAxisMouseover: boolean = false;
  valueMouseover: boolean = false;

  filter: string;
  utils: Utils;

  constructor(public dialogRef: MatDialogRef<MsfDynamicTableVariablesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public globals: Globals,
    public dialog: MatDialog, private changeDetectorRef: ChangeDetectorRef)
  {
    this.utils = new Utils ();
  }

  onNoClick(): void
  {
    this.dialogRef.close (false);
  }

  ngOnInit(): void
  {
    this.setColumns ();

    if (this.data.dynamicTableValues != null)
    {
      for (let variable of this.data.dynamicTableValues.xaxis)
      {
        for (let column of this.columns)
        {
          if (column.name === variable.name)
          {
            this.xaxis.push (column);
            this.columns.splice (this.columns.indexOf (column), 1);
            break;
          }
        }
      }

      for (let variable of this.data.dynamicTableValues.yaxis)
      {
        for (let column of this.columns)
        {
          if (column.name === variable.name)
          {
            this.yaxis.push (column);
            this.columns.splice (this.columns.indexOf (column), 1);
            break;
          }
        }
      }

      for (let variable of this.data.dynamicTableValues.values)
      {
        for (let column of this.columns)
        {
          if (column.name === variable.name)
          {
            this.values.push ({
              id: column.id,
              name: column.name,
              hidden: column.hidden,
              funcopen: column.funcopen,
              summary: variable.summary,
              average: variable.average,
              mean: variable.mean,
              max: variable.max,
              min: variable.min,
              stddeviation: variable.stddeviation,
              count: variable.count,
              sumAlias: variable.sumAlias,
              avgAlias: variable.avgAlias,
              meanAlias: variable.meanAlias,
              maxAlias: variable.maxAlias,
              minAlias: variable.minAlias,
              stdDevAlias: variable.stdDevAlias,
              cntAlias: variable.cntAlias,
              index: column.index
            });

            this.columns.splice (this.columns.indexOf (column), 1);
            break;
          }
        }
      }

      this.checkConfig ();
    }
  }

  filterVariables(): void
  {
    if (!this.columns)
      return;

    let search = this.filter;
    if (!search)
    {
      for (let column of this.columns)
        column.hidden = false;

      return;
    }

    search = search.toLowerCase ();

    for (let column of this.columns)
    {
      if (column.name.toLowerCase ().indexOf(search) > -1)
        column.hidden = false;
      else
        column.hidden = true;
    }
  }

  setColumns(): void
  {
    let i = 0;

    for (let columnConfig of this.data.metadata)
    {
      this.columns.push ({
        id: columnConfig.columnName,
        name: columnConfig.columnLabel,
        hidden: false,
        funcopen: false,
        summary: false,
        average: false,
        mean: false,
        max: false,
        min: false,
        stddeviation: false,
        count: false,
        sumAlias: "",
        avgAlias: "",
        meanAlias: "",
        maxAlias: "",
        minAlias: "",
        stdDevAlias: "",
        cntAlias: "",
        index: i
      });

      i++;
    }
  }

  generateTable()
  {
    this.globals.generateDynamicTable = true;
    this.globals.selectedIndex = 3;
    this.dialogRef.close ({
      xaxis: this.xaxis,
      yaxis: this.yaxis,
      values: this.values
    });
  }

  changeVariableDirection(variable)
  {
    if (variable.direction === "vertical")
      variable.direction = "horizontal";
    else
      variable.direction = "vertical";
  }

  disabled()
  {
    if (!this.variablesSet () || !this.hasFunctions ())
      return true;

    return false;
  }

  // check if there are any horizontal and vertical variables
  variablesSet(): boolean
  {
    if (!this.xaxis || this.xaxis.length < 1 || !this.yaxis || this.yaxis.length < 1
      || !this.values || this.values.length < 1)
      return false;

    return true;
  }

  hasFunctions(): boolean
  {
    if (!this.values || this.values.length < 1)
      return false;

    for (let value of this.values)
    {
      if (!value.average && !value.summary && !value.min && !value.max 
        && !value.count && !value.mean && !value.stddeviation)
        return false;
    }

    return true;
  }

  configureAlias(value, name)
  {
    let dialogRef, alias;

    switch (name)
    {
      case 'Summary':
        alias = value.sumAlias;
        break;

      case 'Average':
        alias = value.avgAlias;
        break;

      case 'Mean':
        alias = value.meanAlias;
        break;

      case 'Max':
        alias = value.maxAlias;
        break;

      case 'Min':
        alias = value.minAlias;
        break;

      case 'Std Deviation':
        alias = value.stdDevAlias;
        break;

      case 'Count':
        alias = value.cntAlias;
        break;
    }

    dialogRef = this.dialog.open (MsfDynamicTableAliasComponent, {
      height: '180px',
      width: '300px',
      panelClass: 'msf-dashboard-control-variables-dialog',
      autoFocus: false,
      data: {
        alias: alias,
        valueName: value.name,
        name: name
      }
    });

    dialogRef.afterClosed ().subscribe ((result: any) =>
    {
      if (result)
      {
        switch (name)
        {
          case 'Summary':
            value.sumAlias = result;
            break;

          case 'Average':
            value.avgAlias = result;
            break;

          case 'Mean':
            value.meanAlias = result;
            break;

          case 'Max':
            value.maxAlias = result;
            break;

          case 'Min':
            value.minAlias = result;
            break;

          case 'Std Deviation':
            value.stdDevAlias = result;
            break;

          case 'Count':
            value.cntAlias = result;
            break;
        }

        this.checkConfig ();
      }
    });
  }

  calcMarginOffset(index: number): number
  {
    return index * 10;
  }

  dragStarted(): void
  {
    this.draggingColumn = true;
  }

  dragEnded(): void
  {
    this.draggingColumn = false;
  }

  setXAxisMouseover(value: boolean): void
  {
    if (!this.draggingColumn)
      return;

    this.xAxisMouseover = value;
  }

  setYAxisMouseover(value: boolean): void
  {
    if (!this.draggingColumn)
      return;

    this.yAxisMouseover = value;
  }

  setValueMouseover(value: boolean): void
  {
    if (!this.draggingColumn)
      return;

    this.valueMouseover = value;
  }

  resetColumns(variable): void
  {
    variable.funcopen = false;
    variable.summary = false;
    variable.average = false;
    variable.mean = false;
    variable.max = false;
    variable.min = false;
    variable.stddeviation = false;
    variable.count = false;
    variable.sumAlias = "";
    variable.avgAlias = "";
    variable.meanAlias = "";
    variable.maxAlias = "";
    variable.minAlias = "";
    variable.stdDevAlias = "";
    variable.cntAlias = "";

    this.columns.push (variable);

    // Sort column order
    this.columns.sort ((a, b) => {
      if (a.index == b.index)
        return 0;

      return a.index > b.index ? 1 : -1;
    });
  }

  removeXAxis(variable): void
  {
    this.resetColumns (variable);
    this.xaxis.splice (this.xaxis.indexOf (variable), 1);

    this.checkConfig ();
  }

  removeYAxis(variable): void
  {
    this.resetColumns (variable);
    this.yaxis.splice (this.yaxis.indexOf (variable), 1);

    this.checkConfig ();
  }

  removeValue(variable): void
  {
    variable.functions = {};
    variable.funcopen = false;
    this.resetColumns (variable);
    this.values.splice (this.values.indexOf (variable), 1);

    this.checkConfig ();
  }

  dropToXAxis(event: CdkDragDrop<any[]>): void
  {
    this.draggingColumn = false;

    if (this.xAxisMouseover)
    {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, this.xaxis.length);
      this.checkConfig ();
    }

    this.xAxisMouseover = false;
  }

  dropToYAxis(event: CdkDragDrop<any[]>): void
  {
    this.draggingColumn = false;

    if (this.yAxisMouseover)
    {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, this.yaxis.length);
      this.checkConfig ();
    }

    this.yAxisMouseover = false;
  }

  dropToValues(event: CdkDragDrop<any[]>): void
  {
    this.draggingColumn = false;

    if (this.valueMouseover)
    {
      transferArrayItem (event.previousContainer.data, event.container.data, event.previousIndex, this.values.length);
      this.checkConfig ();
    }

    this.valueMouseover = false;
  }

  toggleFunctions(event, index, variable): void
  {
    event.stopPropagation ();

    variable.funcopen = !variable.funcopen;

    // close previous one if open
    if (this.selectedVariable)
      this.selectedVariable.funcopen = false;

    if (variable.funcopen)
    {
      let variableElement = document.getElementById ('value-' + index);
      let variableListElement = document.getElementById ('values-list');

      this.selectedVariable = variable;
      this.funcListPosX = variableElement.offsetLeft - variableListElement.scrollLeft + 10;
      this.funcListPosY = variableElement.offsetTop + 38;
    }
    else
    {
      this.selectedVariable = null;
      this.funcListPosX = 0;
      this.funcListPosY = 0;
    }
  }

  disableFuncMenu(): void
  {
    if (this.selectedVariable)
      this.selectedVariable.funcopen = false;

    this.selectedVariable = null;
    this.funcListPosX = 0;
    this.funcListPosY = 0;
  }

  keepFuncMenu(event): void
  {
    event.stopPropagation ();
  }

  getFuncListPosX(): number
  {
    return this.funcListPosX;
  }

  getFuncListPosY(): number
  {
    return this.funcListPosY;
  }

  @HostListener('window:resize', ['$event'])
  resetFuncListMenu(event): void
  {
    if (!this.selectedVariable.funcopen)
      return;

    let variableElement = document.getElementById ('value-' + this.values.indexOf (this.selectedVariable));
    let variableListElement = document.getElementById ('values-list');

    this.funcListPosX = variableElement.offsetLeft - variableListElement.scrollLeft + 10;
    this.funcListPosY = variableElement.offsetTop + 38;
  }

  setDynTableLoading(value): void
  {
    this.tableLoading = value;
  }

  checkConfig(): void
  {
    if (this.variablesSet () && this.hasFunctions ())
    {
      this.previewAvailable = true;
      this.tableLoading = true;
      this.changeDetectorRef.detectChanges ();
      this.dynamicTablePreview.loadData (this.xaxis, this.yaxis, this.values);
    }
    else
      this.previewAvailable = false;
  }
}
