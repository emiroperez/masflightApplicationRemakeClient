import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-msf-dynamic-table',
  templateUrl: './msf-dynamic-table.component.html',
  styleUrls: ['./msf-dynamic-table.component.css']
})
export class MsfDynamicTableComponent implements OnInit {
  dataAdapter: any;

  @Input("isLoading")
  isLoading: boolean = false;

  @Input("isPreview")
  isPreview: boolean = false;

  @Output("setDynTableLoading")
  setDynTableLoading = new EventEmitter();

  yAxisColSpan: number;

  constructor(private http: ApiClient, public globals: Globals, private service: ApplicationService)
  { 
  }

  ngOnInit()
  {
  }

  isArray(item): boolean
  {
    return Array.isArray (item);
  }

  loadData(xaxis, yaxis, values, dashboardPanel?)
  {  
    this.service.loadDynamicTableData (this, xaxis, yaxis, values, this.handlerSuccess, this.handlerError, null, dashboardPanel);
  }

  loadDataWithFilter(xaxis, yaxis, values, filterConfig)
  {  
    this.service.loadDynamicTableData (this, xaxis, yaxis, values, this.handlerSuccess, this.handlerError, filterConfig);
  }

  handlerSuccess(_this,data)
  {
    let topOffsetValue = 0;

    if (!_this.isLoading)
      return;

    _this.dataAdapter = data;
    _this.yAxisColSpan = 1;

    for (let i = 0; i < _this.dataAdapter.headers.length; i++)
    {
      let header = _this.dataAdapter.headers[i];
      header.topOffset = topOffsetValue;

      if (!i)
      {
        for (let j = 0; j < header.values.length - 1; j++)
        {
          let value = header.values[j];

          _this.yAxisColSpan += value.colSpan;
        }
      }

      topOffsetValue += 35;
    }

    _this.setDynTableLoading.emit (false);
  }

  handlerError(_this, result)
  {
    console.log (result);
    _this.setDynTableLoading.emit (false);
  }

  cancelLoading()
  {
    this.setDynTableLoading.emit (false);
  }
}
