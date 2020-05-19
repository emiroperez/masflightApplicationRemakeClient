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
  setDynTableLoading = new EventEmitter ();

  @Input("nameAirlines")
  nameAirlines: any[] = null;

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
    let airlineIataList = [];

    if (!_this.isLoading)
      return;

    _this.dataAdapter = data;
    _this.yAxisColSpan = 1;

    for (let i = 0; i < _this.dataAdapter.headers.length; i++)
    {
      let header = _this.dataAdapter.headers[i];
      header.topOffset = topOffsetValue;

      for (let j = 0; j < header.values.length; j++)
      {
        let value = header.values[j];

        if (_this.dataAdapter.types[i] === "Airline")
          airlineIataList.push (value.value);

        if (!i && j != header.values.length - 1)
          _this.yAxisColSpan += value.colSpan;
      }

      topOffsetValue += 35;
    }

    for (let item of _this.dataAdapter.body)
    {
      if (item[0].type === "Airline")
        airlineIataList.push (item[0].value);
    }

    if (airlineIataList.length)
    {
      let iataAirline = airlineIataList.join ();
      _this.service.getAirlinesRecords (_this, iataAirline, _this.airlineIataSuccess, _this.handlerError);
    }
    else
      _this.setDynTableLoading.emit (false);
  }

  airlineIataSuccess(_this, result)
  {
    _this.nameAirlines = result;
    _this.setDynTableLoading.emit (false);
  }

  handlerError(_this, result)
  {
    console.log (result);
    _this.nameAirlines = null;
    _this.setDynTableLoading.emit (false);
  }

  cancelLoading()
  {
    this.setDynTableLoading.emit (false);
  }

  getNameAirline(iata)
  {
    if (this.nameAirlines == null)
      return iata;

    const index: number = this.nameAirlines.findIndex (d => d.iata === iata);

    if (index != -1)
      return this.nameAirlines[index].name;
    else
      return iata;
  }
}
