import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ReplaySubject } from 'rxjs';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-search-dynamic-table',
  templateUrl: './search-dynamic-table.component.html'
})
export class SearchDynamicTableComponent {
  dynTableValues: any[] = [];

  constructor(public dialogRef: MatDialogRef<SearchDynamicTableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public globals: Globals)
  {
    let yAxisValues = [];
    let lastValue = null;
    let i, j;

    for (let yaxis of data.yaxis)
    {
      yAxisValues.push ({
        name: yaxis.name,
        values: [],
        selected: [],
        searchFilter: "",
        filteredValues: new ReplaySubject<any[]> (1)
      });
    }

    j = 0;

    for (let body of data.dataAdapter.body)
    {
      if (lastValue && !lastValue.titleOnly && body[0].titleOnly)
        j = 0;

      if (yAxisValues[j].values.indexOf (body[0].value) == -1)
        yAxisValues[j].values.push (body[0].value);

      if (body[0].titleOnly)
        j++;

      lastValue = body[0];
    }

    for (let yAxisValue of yAxisValues)
    {
      this.dynTableValues.push (yAxisValue);
      this.dynTableValues[this.dynTableValues.length - 1].filteredValues.next (yAxisValue.values.slice ());
    }

    for (i = 0; i < data.xaxis.length; i++)
    {
      let header = data.dataAdapter.headers[i];
      let xaxis = data.xaxis[i];
      let xAxisValues = [];
      let dynTableValue;

      for (let item of header.values)
      {
        if (xAxisValues.indexOf (item.value) == -1)
          xAxisValues.push (item.value);
      }

      this.dynTableValues.push ({
        name: xaxis.name,
        values: xAxisValues,
        selected: [],
        searchFilter: "",
        filteredValues: new ReplaySubject<any[]> (1)
      });

      dynTableValue = this.dynTableValues[this.dynTableValues.length - 1];
      dynTableValue.filteredValues.next (dynTableValue.values.slice ());
    }
  }

  filterValues(dynTableValue): void
  {
    let search;

    if (!dynTableValue.values)
      return;

    // get the search keyword
    search = dynTableValue.searchFilter;
    if (!search)
    {
      dynTableValue.filteredValues.next (dynTableValue.values.slice ());
      return;
    }

    search = search.toLowerCase ();
    dynTableValue.filteredValues.next (
      dynTableValue.values.filter (a => a.toLowerCase ().indexOf (search) > -1)
    );
  }
}
