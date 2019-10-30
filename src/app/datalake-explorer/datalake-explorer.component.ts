import { Component, OnInit, Input, SimpleChanges, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ReplaySubject, Subject } from 'rxjs';

import { DatalakeTableCardValues } from '../datalake-table-card/datalake-table-card-values';
import { DatalakeService } from '../services/datalake.service';
import { Globals } from '../globals/Globals';
import { DatalakeCreateTableComponent } from '../datalake-create-table/datalake-create-table.component';
import { DatalakeTableCardComponent } from '../datalake-table-card/datalake-table-card.component';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';

@Component({
  selector: 'app-datalake-explorer',
  templateUrl: './datalake-explorer.component.html'
})
export class DatalakeExplorerComponent implements OnInit {
  // @Input("currentOption")
  // currentOption: number;

  @Output('setCurrentOptionSelected')
  setCurrentOptionSelected = new EventEmitter ();
  
  filter: string;
  filteredTableCards: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy = new Subject<void> ();

  @ViewChildren(DatalakeTableCardComponent)
  tableCardComponents: QueryList<DatalakeTableCardComponent>; 

  tableCards: DatalakeTableCardValues[] = [];
  currentScreen: number;

  constructor(public globals: Globals, private dialog: MatDialog,
    private service: DatalakeService) { }

  ngOnInit()
  {
    this.setCurrentScreen ();
  }

  // ngOnChanges(changes: SimpleChanges): void
  // {
  //   if (changes['currentOption'])
  //     this.setCurrentScreen ();
  // }

  setCurrentScreen(): void
  {
    // if (this.currentOption == 3)
    if (this.globals.optionDatalakeSelected === 3)
      this.goToScreen (1);
    else
      this.goToScreen (0);
  }

  goToScreen(index: number): void
  {
    this.currentScreen = index;

    switch (this.currentScreen)
    {
      case 0:
        this.globals.isLoading = true;
        this.service.getDatalakeTables (this, this.handlerSuccess, this.handlerError);
        this.filter = "";
        break;
    }
  }

  handlerSuccess(_this, data): void
  {
    if (!data)
    {
      _this.globals.isLoading = false;
      return;
    }

    _this.tableCards = [];

    if (data.sources)
    {
      for (let result of data.sources)
      {
        _this.tableCards.push (new DatalakeTableCardValues (result.tableName,
          result.descr, result.bucketName, result.schemaName, result.longName,
          result.lastHDI, result.lastDDI,result.nRows, result.lastUpdate, result.mb));
      }
    }

    _this.filteredTableCards.next (_this.tableCards.slice ());
    _this.globals.isLoading = false;
  }

  handlerError(_this, results): void
  {
    _this.globals.isLoading = false;
    console.error (results);
  }

  ngOnDestroy(): void
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  filterTableCards(): void
  {
    let search, filteredResults;

    if (!this.tableCards.length)
      return;

    // get the search keyword
    search = this.filter;
    if (!search)
    {
      this.filteredTableCards.next (this.tableCards.slice ());
      return;
    }

    search = search.toLowerCase ();
    filteredResults = this.tableCards.filter (a => (a.longName.toLowerCase ().indexOf (search) > -1
      || a.tableName.toLowerCase ().indexOf (search) > -1));

    this.filteredTableCards.next (
      filteredResults.filter (function (elem, index, self)
      {
        return index === self.indexOf (elem);
      })
    );
  }

  createTable(): void
  {
   let dialogRef =  this.dialog.open (DatalakeCreateTableComponent, {
      panelClass: 'datalake-create-table-dialog',
      data: {index: 0}
    });

    dialogRef.afterClosed().subscribe(() => {
      // if (request) {
        // this.tableCards.push(new DatalakeTableCardValues (request.tableName,
        //   request.tableDesc, request.s3TableLocation, request.schemaName, request.longName,"0.0000","0.0000",null,null,null));          
        // this.filterTableCards ();
        this.service.getDatalakeTables (this, this.handlerSuccess, this.handlerError);
      // }
    });
  }

  viewTableInformation(): void
  {
    this.tableCardComponents.forEach ((tableCard) => {
      tableCard.viewTableInformation ();
    });
  }

  viewTableStats(): void
  {
    this.tableCardComponents.forEach ((tableCard) => {
      tableCard.viewTableStats ();
    });
  }

  setOption(option: any): void
  {    
    // this.globals.optionDatalakeSelected = option.option;
    this.setCurrentOptionSelected.emit(option);
  }

  goToQueryEngine(){
    let value = {
      option: 3
    }
    this.globals.optionDatalakeSelected = 3;
    // this.setCurrentOptionSelected.emit(value) ;
    this.setCurrentScreen();
  }
}
