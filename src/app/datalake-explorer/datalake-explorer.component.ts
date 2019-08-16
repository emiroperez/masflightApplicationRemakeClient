import { Component, OnInit } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

import { DatalakeTableCardValues } from '../datalake-table-card/datalake-table-card-values';
import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-explorer',
  templateUrl: './datalake-explorer.component.html'
})
export class DatalakeExplorerComponent implements OnInit {
  filter: string;
  filteredTableCards: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy = new Subject<void> ();

  tableCards: DatalakeTableCardValues[] = [];

  constructor(public globals: Globals, private service: ApplicationService) { }

  ngOnInit()
  {
    this.globals.isLoading = true;
    this.service.getDatalakeTables (this, this.handlerSuccess, this.handlerError);
  }

  handlerSuccess(_this, data): void
  {
    _this.globals.isLoading = false;

    if (!data || !data.sources || !data.sources.length)
      return;

    for (let result of data.sources)
    {
      _this.tableCards.push (new DatalakeTableCardValues (result.tableName,
        result.descr, result.bucketName, result.schemaName, result.longName));
    }

    _this.filteredTableCards.next (_this.tableCards.slice ());
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

  addTableCard(): void
  {
    this.tableCards.push (new DatalakeTableCardValues ("fradar24_r",
      "Flight Radar24 Tracking table", "fradar24-r", "fr24p", "Flight Radar24 Tracking"));
    this.filteredTableCards.next (this.tableCards.slice ());
  }
}
