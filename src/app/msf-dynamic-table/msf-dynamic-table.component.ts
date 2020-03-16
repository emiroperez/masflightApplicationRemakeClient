import { Component, OnInit } from '@angular/core';
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

  constructor(private http: ApiClient, public globals: Globals, private service: ApplicationService)
  { 
  }

  ngOnInit()
  {
  }

  loadData()
  {  
    this.service.loadDynamicTableData (this, this.handlerSuccess, this.handlerError);
  }

  handlerSuccess(_this,data)
  {
    _this.dataAdapter = data;
    _this.globals.isLoading = false;
  }

  handlerError(_this,result)
  {
    _this.globals.isLoading = false;
  }

  cancelLoading()
  {
    this.globals.isLoading = false;
  }
}
