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

  @Output("setDynTableLoading")
  setDynTableLoading = new EventEmitter ();

  constructor(private http: ApiClient, public globals: Globals, private service: ApplicationService)
  { 
  }

  ngOnInit()
  {
  }

  loadData(xaxis, yaxis, values)
  {  
    this.service.loadDynamicTableData (this, xaxis, yaxis, values, this.handlerSuccess, this.handlerError);
  }

  handlerSuccess(_this,data)
  {
    if (!_this.isLoading)
      return;

    _this.dataAdapter = data;
    _this.setDynTableLoading.emit (false);
  }

  handlerError(_this,result)
  {
    _this.setDynTableLoading.emit (false);
  }

  cancelLoading()
  {
    this.setDynTableLoading.emit (false);
  }
}
