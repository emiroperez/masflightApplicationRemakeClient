import { Component, Input } from '@angular/core';

import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';
import { DatalakeService } from '../services/datalake.service';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-query-engine-schema',
  templateUrl: './datalake-query-engine-schema.component.html'
})
export class DatalakeQueryEngineSchemaComponent {

  schemasLoaded: boolean = false;
  isLoading: boolean = false;

  @Input("querySchema")
  querySchema: DatalakeQuerySchema;

  constructor(public globals: Globals, private service: DatalakeService) { }

  toggleSchema(): void
  {
    this.querySchema.open = !this.querySchema.open;

    if (this.querySchema.open && !this.schemasLoaded)
    {
      this.isLoading = true;
      this.service.getDatalakeSchemaTables (this, this.querySchema.schemaName, this.setSchemaTables, this.handlerError);
    }
    else if (!this.querySchema.open)
    {
      // clear search filter when closing
      this.querySchema.filter = "";
      this.querySchema.filteredTables.next (this.querySchema.tables.slice ());
    }
  }

  filterSchema(): void
  {
    let search, filteredResults;

    if (!this.querySchema.tables.length)
      return;

    // get the search keyword
    search = this.querySchema.filter;
    if (!search)
    {
      this.querySchema.filteredTables.next (this.querySchema.tables.slice ());
      return;
    }

    search = search.toLowerCase ();
    filteredResults = this.querySchema.tables.filter (a => (a.TableName.toLowerCase ().indexOf (search) > -1));

    this.querySchema.filteredTables.next (
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
      _this.isLoading = false;
      return;
    }

    for (let tableName of data.Tables)
      _this.querySchema.tables.push (tableName);

    _this.querySchema.filteredTables.next (_this.querySchema.tables.slice ());
    _this.isLoading = false;
    _this.schemasLoaded = true;
  }

  handlerError(_this, result): void
  {
    // TODO: Show dialog
    _this.isLoading = false;
    _this.querySchema.open = false;
  }

  copyText(val1:string, val: string){
    if(!this.actionDisable("Type Query") || !this.actionDisable("Run Query") ){
      this.globals.selectedSchema.input += " " +val1+"."+val ;
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
