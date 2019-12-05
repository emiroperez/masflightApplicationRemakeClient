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

  @Output('setCurrentOptionSelected')
  setCurrentOptionSelected = new EventEmitter ();
  
  filter: string;
  filteredTableCards: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy = new Subject<void> ();

  @ViewChildren(DatalakeTableCardComponent)
  tableCardComponents: QueryList<DatalakeTableCardComponent>; 

  tableCards: DatalakeTableCardValues[] = [];
  querymouseover: boolean = false;

  constructor(public globals: Globals, private dialog: MatDialog,
    private service: DatalakeService) { }

  ngOnInit()
  {
    this.getDatalakeTables ();
  }

  getDatalakeTables(): void
  {
    if (this.globals.optionDatalakeSelected !== 2)
      return;

    this.globals.isLoading = true;
    this.service.getDatalakeTables (this, this.handlerSuccess, this.handlerError);
    this.filter = "";
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
      this.service.getDatalakeTables (this, this.handlerSuccess, this.handlerError);
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
    this.setCurrentOptionSelected.emit(option);
  }

  changeOption(option): void
  {
    this.globals.optionDatalakeSelected = option;
    this.getDatalakeTables ();
  }

  getQueryImage(): string
  {
    if (this.querymouseover)
      return "../../assets/images/dark-theme-datalake-query.png";

    return "../../assets/images/" + this.globals.theme + "-datalake-query.png";
  }

  
  getQueryImageAcces(): string
  {
    return "../../assets/images/" + this.globals.theme + "-requestAccess.png";
  }
  
  OptionDisable(option: any) {
    let index = this.globals.optionsDatalake.findIndex(od => od.action.option === option);
    if (index != -1) {
      return false;
    } else {
      return true;
    }
}

actionDisable(option: any) {
  let index = this.globals.optionsDatalake.findIndex(od => od.action.name === option);
  if (index != -1) {
    return false;
  } else {
    return true;
  }
}


}
