import { Component, Inject, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelect } from '@angular/material';
import { Airport } from '../model/Airport';
import { ReplaySubject, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { take, takeUntil } from 'rxjs/operators';
import { Utils } from '../commons/utils';
import { Globals } from '../globals/Globals';

export interface DialogData {
  metadata: string[];
}

@Component({
  selector: 'app-msf-dynamic-table-variables',
  templateUrl: './msf-dynamic-table-variables.component.html',
  styleUrls: ['./msf-dynamic-table-variables.component.css']
})
export class MsfDynamicTableVariablesComponent {

  metadata;  

  columns:any[] = []; 

  utils: Utils;

  @Output() dynamicTableOpen = new EventEmitter();

  public variableFilterCtrl: FormControl = new FormControl();
  public filteredVariables: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('variableSelect') variableSelect: MatSelect;

 /** control for the MatSelect filter keyword */
 public valueFilterCtrl: FormControl = new FormControl();


  /** list of variable filtered by search keyword */
  public filteredValues: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('valueSelect') valueSelect: MatSelect;
  
 /** Subject that emits when the component has been destroyed. */
 private _onDestroy = new Subject<void>();

  constructor(public dialogRef: MatDialogRef<MsfDynamicTableVariablesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public globals: Globals) {

      this.metadata = data.metadata;
      this.utils = new Utils();
      
    }

  onNoClick(): void {
    this.globals.values = [];
    this.globals.variables = [];
    this.dialogRef.close(false);
  }

  ngOnInit() {

    this.setColumns();

    this.globals.variables = [];

    this.filteredVariables.next(this.columns.slice());
    this.variableFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterVariables();
      });

    this.globals.values = [];

    this.filteredValues.next(this.columns.slice());
    this.valueFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterValues();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  private setInitialValue() {
    this.filteredVariables
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.variableSelect.compareWith = (a: Airport, b: Airport) => (a.id === b.id);
        this.valueSelect.compareWith = (a: Airport, b: Airport) => (a.id === b.id);
      });
  }

  private filterVariables() {
    if (!this.columns) {
      return;
    }
    let search = this.variableFilterCtrl.value;
    if (!search) {
      this.filteredVariables.next(this.columns.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredVariables.next(
      this.columns.filter(variable => variable.name.toLowerCase().indexOf(search) > -1)
    );
  }

  private filterValues() {
    if (!this.columns) {
      return;
    }
    let search = this.valueFilterCtrl.value;
    if (!search) {
      this.filteredValues.next(this.columns.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredValues.next(
      this.columns.filter(value => value.name.toLowerCase().indexOf(search) > -1)
    );
  }


  setColumns(){
    for(let columnConfig of this.metadata){
      this.columns.push({id: columnConfig.columnName, name: columnConfig.columnLabel});
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
    this.dynamicTableOpen.emit ();
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
    let hasHorizontalVariables, hasVerticalVariables: boolean;

    if (!this.globals.variables || this.globals.values.variables < 1)
      return false;

    hasHorizontalVariables = false;
    hasVerticalVariables = false;

    for (let value of this.globals.variables)
    {
      if (value.direction === "vertical")
        hasVerticalVariables = true;
      else
        hasHorizontalVariables = true;
    }

    if (!hasVerticalVariables || !hasHorizontalVariables)
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
        && !value.count && !value.mean && !value.mean)
        return false;
    }

    return true;
  }



}
