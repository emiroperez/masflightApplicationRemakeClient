import { Component, OnInit, Input } from '@angular/core';

import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-query-engine-schema',
  templateUrl: './datalake-query-engine-schema.component.html'
})
export class DatalakeQueryEngineSchemaComponent {

  schemasLoaded: boolean = false;

  @Input("querySchema")
  querySchema: any;

  constructor(public globals: Globals, private service: ApplicationService) { }

  toggleSchema(querySchema: any): void
  {
    querySchema.open = !querySchema.open;

    if (querySchema.open && !this.schemasLoaded)
    {
      this.globals.isLoading = true;
      this.service.getDatalakeSchemaTables (this, querySchema.schemaName, this.setSchemaTables, this.handlerError);
    }
  }

  filterSchema(querySchema: any): void
  {
    let search, filteredResults;

    if (!querySchema.tables.length)
      return;

    // get the search keyword
    search = querySchema.filter;
    if (!search)
    {
      querySchema.filteredTables.next (querySchema.tables.slice ());
      return;
    }

    search = search.toLowerCase ();
    filteredResults = querySchema.tables.filter (a => (a.toLowerCase ().indexOf (search) > -1));

    querySchema.filteredTables.next (
      filteredResults.filter (function (elem, index, self)
      {
        return index === self.indexOf(elem);
      })
    );
  }

  setSchemaTables(_this, data): void
  {
    if (!data.Tables.length)
    {
      _this.globals.isLoading = false;
      return;
    }

    for (let tableName of data.Tables)
      _this.querySchema.tables.push (tableName);

    _this.querySchema.filteredTables.next (_this.querySchema.tables.slice ());
    _this.globals.isLoading = false;
    _this.schemasLoaded = true;
  }

  handlerError(_this, result): void
  {
    // TODO: Show dialog
    console.log (result);
    _this.globals.isLoading = false;
    _this.querySchema.open = false;
  }
}
