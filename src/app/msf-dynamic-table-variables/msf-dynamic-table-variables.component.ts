import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';

import { Utils } from '../commons/utils';
import { Globals } from '../globals/Globals';
import { MsfDynamicTableAliasComponent } from '../msf-dynamic-table-alias/msf-dynamic-table-alias.component';
import { MessageComponent } from '../message/message.component';

export interface DialogData {
  metadata: any[];
}

@Component({
  selector: 'app-msf-dynamic-table-variables',
  templateUrl: './msf-dynamic-table-variables.component.html',
  styleUrls: ['./msf-dynamic-table-variables.component.css']
})
export class MsfDynamicTableVariablesComponent {

  xaxis: any[] = [];
  yaxis: any[] = [];
  values: any[] = [];
  columns: any[] = [];

  draggingColumn: boolean = false;
  xAxisMouseover: boolean = false;
  yAxisMouseover: boolean = false;
  valueMouseover: boolean = false;

  filter: string;
  utils: Utils;

  constructor(public dialogRef: MatDialogRef<MsfDynamicTableVariablesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public globals: Globals,
    public dialog: MatDialog)
  {
    this.utils = new Utils ();
  }

  onNoClick(): void
  {
    this.globals.values = [];
    this.globals.variables = [];
    this.dialogRef.close (false);
  }

  ngOnInit(): void
  {
    this.setColumns ();
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
      this.columns.push({ id: columnConfig.columnName, name: columnConfig.columnLabel, hidden: false, index: i });
      i++;
    }
  }

  deleteVariable(variable)
  {
    variable.order = null;
    this.globals.variables.splice (this.globals.variables.indexOf (variable), 1);
    this.globals.variables = JSON.parse (JSON.stringify (this.globals.variables)); // force update on the variables combo box
  }

  generateTable(){
    this.globals.generateDynamicTable = true;
    this.globals.selectedIndex = 3;
    this.dialogRef.close (true);
  }

  order=0;
  orderVariable(elements){
    if(elements){
      for(let element of elements){
        if (!element.direction)
          element.direction = "vertical";

        if(element.order == null){
          element.order = this.order;  
          this.order++;  
        }      
      }
      let elementsOrdered = elements.sort((a,b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0));
      this.globals.variables = elementsOrdered;
    }    
  }

  orderValue=0;
  orderValues(elements){
    if(elements){
      for(let element of elements){
        if(element.order == null){
          element.order = this.orderValue;  
          this.orderValue++;  
        }      
      }
      let elementsOrdered = elements.sort((a,b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0));
      this.globals.values = elementsOrdered;
    }    
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
    let hasVerticalVariables: boolean;

    if (!this.globals.variables || this.globals.variables.length < 1)
      return false;

    hasVerticalVariables = false;

    for (let value of this.globals.variables)
    {
      if (value.direction === "vertical")
      {
        hasVerticalVariables = true;
        break;
      }
    }

    if (!hasVerticalVariables)
      return false;

    return true;
  }

  hasFunctions(): boolean
  {
    if (!this.globals.values || this.globals.values.length < 1)
      return false;

    for (let value of this.globals.values)
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
      }
    });
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
    this.columns.push (variable);

    // Sort column order
    this.columns.sort ((a, b) => {
      if (a.index == b.index)
        return 0;

      return a.index > b.index ? 1 : -1;
    });
  }

  removeXAxis(): void
  {
    this.resetColumns (this.xaxis[0]);
    this.xaxis.pop ();
  }

  removeValue(value): void
  {
    this.resetColumns (value);
    this.values.splice (this.values.indexOf (value), 1);
  }

  dropToXAxis(event: CdkDragDrop<any[]>): void
  {
    this.draggingColumn = false;

    if (this.xaxis.length)
    {
      this.xAxisMouseover = false;

      this.dialog.open (MessageComponent, {
        data: { title: "Information", message: "Only one X-Axis variable is allowed." }
      });

      return;       // Only one X Axis variable will be allowed
    }

    if (this.xAxisMouseover)
      transferArrayItem (event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

    this.xAxisMouseover = false;
  }

  dropToYAxis(event: CdkDragDrop<any[]>): void
  {
    this.draggingColumn = false;

    if (this.yAxisMouseover)
      transferArrayItem (event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

    this.yAxisMouseover = false;
  }

  dropToValues(event: CdkDragDrop<any[]>): void
  {
    this.draggingColumn = false;

    if (this.valueMouseover)
      transferArrayItem (event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

    this.valueMouseover = false;
  }
}
