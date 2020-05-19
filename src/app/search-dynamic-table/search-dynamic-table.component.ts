import { Component, PipeTransform, Pipe, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Globals } from '../globals/Globals';
import { MessageComponent } from '../message/message.component';


@Pipe({
  name: 'searchFilter'
})
export class ValueSearchFilter implements PipeTransform {
  public transform(values: any[], searchText: any): any
  {
    if (searchText == null || values == null)
      return values;

    return values.filter (value => value.name.toLowerCase ().indexOf (searchText.toLowerCase ()) !== -1);
  }
}

@Component({
  selector: 'app-search-dynamic-table',
  templateUrl: './search-dynamic-table.component.html'
})
export class SearchDynamicTableComponent implements OnInit {

  @Input("data")
  data: any = null;

  @Input("filterValues")
  filterValues: any = null;

  @Output("dynTableSearchWithFilter")
  dynTableSearchWithFilter = new EventEmitter ();

  @Output("removeDynTableFilter")
  removeDynTableFilter = new EventEmitter ();

  dynTableValues: any[] = [];

  constructor(public globals: Globals, private dialog: MatDialog)
  {
  }

  ngOnInit(): void
  {
    let yAxisValues = [];
    let lastValue = null;
    let i, j;

    if (this.filterValues)
    {
      this.dynTableValues = JSON.parse (JSON.stringify (this.filterValues));

      for (let dynTableValue of this.dynTableValues)
        dynTableValue.searchFilter = "";

      return;
    }

    for (let yaxis of this.data.yaxis)
    {
      yAxisValues.push ({
        name: yaxis.name,
        id: yaxis.id,
        values: [],
        selected: [],
        searchFilter: "",
        selectAll: false
      });
    }

    j = 0;

    for (let body of this.data.dataAdapter.body)
    {
      if (lastValue && !lastValue.titleOnly && body[0].titleOnly)
        j = 0;

      if (this.getIndex (yAxisValues[j].values, body[0].value) == -1)
        yAxisValues[j].values.push ({ name: body[0].value, selected: false });

      if (body[0].titleOnly)
        j++;

      lastValue = body[0];
    }

    for (let yAxisValue of yAxisValues)
      this.dynTableValues.push (yAxisValue);

    for (i = 0; i < this.data.xaxis.length; i++)
    {
      let header = this.data.dataAdapter.headers[i];
      let xaxis = this.data.xaxis[i];
      let xAxisValues = [];

      for (let item of header.values)
      {
        if (this.getIndex (xAxisValues, item.value) == -1)
          xAxisValues.push ({ name: item.value, selected: false });
      }

      this.dynTableValues.push ({
        name: xaxis.name,
        id: xaxis.id,
        values: xAxisValues,
        selected: [],
        searchFilter: "",
        valueFiltersMenu: false,
        selectAll: false
      });
    }

    for (let dynTableValue of this.dynTableValues)
      this.selectAllValues (dynTableValue);
  }

  getIndex(axisArray, value): number
  {
    for (let i = 0; i < axisArray.length; i++)
    {
      let item = axisArray[i];

      if (item.name === value)
        return i;
    }

    return -1;
  }

  selectedValueChange(dynTableValue): void
  {
    dynTableValue.selected = dynTableValue.values.filter (value => {
      return value.selected; 
    });
  }

  toggleValueFilters(dynTableValue): void
  {
    dynTableValue.valueFiltersMenu = !dynTableValue.valueFiltersMenu;
  }

  selectAllValues(dynTableValue): void
  {
    dynTableValue.selectAll = !dynTableValue.selectAll;

    for (let value of dynTableValue.values)
      value.selected = dynTableValue.selectAll;

    this.selectedValueChange (dynTableValue);
  }

  configValid(): boolean
  {
    for (let dynTableValue of this.dynTableValues)
    {
      let noColumnSelected = true;

      for (let value of dynTableValue.values)
      {
        if (value.selected)
        {
          noColumnSelected = false;
          break;
        }
      }

      if (noColumnSelected)
        return false;
    }

    return true;
  }

  startFilteredQuery(): void
  {
    if (!this.configValid())
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "You must at least select one column for each variable." }
      });

      return;
    }

    this.dynTableSearchWithFilter.emit (this.dynTableValues);
  }
}
