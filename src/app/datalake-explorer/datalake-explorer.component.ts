import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ReplaySubject, Subject } from 'rxjs';

import { DatalakeTableCardValues } from '../datalake-table-card/datalake-table-card-values';
import { DatalakeService } from '../services/datalake.service';
import { Globals } from '../globals/Globals';
import { DatalakeCreateTableComponent } from '../datalake-create-table/datalake-create-table.component';

@Component({
  selector: 'app-datalake-explorer',
  templateUrl: './datalake-explorer.component.html'
})
export class DatalakeExplorerComponent implements OnInit {
  filter: string;
  filteredTableCards: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy = new Subject<void> ();

  tableCards: DatalakeTableCardValues[] = [];
  currentScreen: number = 0;

  constructor(public globals: Globals, private dialog: MatDialog,
    private service: DatalakeService) { }

  ngOnInit()
  {
    this.goToScreen (0);
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
          result.descr, result.bucketName, result.schemaName, result.longName));
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
        return index === self.indexOf(elem);
      })
    );
  }

  createTable(): void
  {
    let dialogRef = this.dialog.open (DatalakeCreateTableComponent, {
      panelClass: 'datalake-create-table-dialog',
      data: { }
    });
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
}
