import { Component, PipeTransform, Pipe, Input, OnInit } from '@angular/core';

import { Globals } from '../globals/Globals';

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

  dynTableValues: any[] = [];

  constructor(public globals: Globals)
  {
  }

  ngOnInit(): void
  {
    let yAxisValues = [];
    let lastValue = null;
    let i, j;

    for (let yaxis of this.data.yaxis)
    {
      yAxisValues.push ({
        name: yaxis.name,
        values: [],
        selected: [],
        searchFilter: ""
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
        values: xAxisValues,
        selected: [],
        searchFilter: ""
      });
    }
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
}
