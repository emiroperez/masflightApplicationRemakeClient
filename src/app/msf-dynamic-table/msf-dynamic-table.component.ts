import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { jqxTreeGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxtreegrid';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-msf-dynamic-table',
  templateUrl: './msf-dynamic-table.component.html',
  styleUrls: ['./msf-dynamic-table.component.css']
})
export class MsfDynamicTableComponent implements OnInit {

  AVG_PREFIX    = 'avg_';
  SUM_PREFIX    = 'sum_';
  MIN_PREFIX    = 'min_';
  MAX_PREFIX    = 'max_';
  COUNT_PREFIX  = 'count_';
  MEAN_PREFIX   = 'mean_';
  STDDEVIATION_PREFIX    = 'stddeviation';

  AVG   = 'Avg';
  SUM   = 'Sum';
  MIN    = 'Min';
  MAX    = 'Max';
  COUNT  = 'Count';
  MEAN   = 'Mean';
  STDDEVIATION    = 'Std Deviation';
  
  numbers: any[]=[];

  dataAdapter: any;

  columns: any[] = [];

  @ViewChild(jqxTreeGridComponent) jqxTreeGridRef: jqxTreeGridComponent;

  constructor(private http: ApiClient, public globals: Globals, private service: ApplicationService) { 

  }

  ngOnInit() {
  }


 loadData(){  
  this.service.loadDynamicTableData(this, this.handlerSuccess, this.handlerError);
}


getWidth() : any {
  return '99%';
}

getHeight(): any {
  return '96%';
}


handlerSuccess(_this,data){
 let source: any =
    {
       dataType: 'json',
       dataFields: _this.getDataField(),
       hierarchy:
       {
           root: 'children'
       },
       id: 'id',
       localData: data
    };
    _this.dataAdapter = new jqx.dataAdapter(source);
    _this.columns = _this.getColumns();    
    _this.globals.isLoading = false; 
    
}

getColumns(){
  let columns: any[] = [{ text: 'Variables', dataField: 'variable', width: '25%' }];
  for(let value of this.globals.values){
    this.addColumnsName(value,columns);
  }
  return columns;  
}

addColumnsName(value : any,columns: any[]){
  let columnId = value.id;
  let columnName= value.name;
  if(value.average){
    columns.push({ text: this.AVG +" "+ columnName, dataField: this.AVG_PREFIX + columnId, width: '25%',cellsformat: 'D2', cellsalign: 'right',  });
  }
  if(value.summary){
    columns.push({ text: this.SUM +" "+ columnName, dataField: this.SUM_PREFIX + columnId, width: '25%',cellsformat: 'D', cellsalign: 'right'});
  }
  if(value.min){
    columns.push({ text: this.MIN +" "+ columnName, dataField: this.MIN_PREFIX + columnId, width: '25%', cellsformat: 'D', cellsalign: 'right' });
  }
  if(value.max){
    columns.push({ text: this.MAX +" "+ columnName, dataField: this.MAX_PREFIX + columnId, width: '25%',cellsformat: 'D', cellsalign: 'right' });
  }
  if(value.count){
    columns.push({ text: this.COUNT +" "+ columnName, dataField: this.COUNT_PREFIX + columnId, width: '25%',cellsformat: 'D', cellsalign: 'right' });
  }
  if(value.mean){
    columns.push({ text: this.MEAN +" "+ columnName, dataField: this.MEAN_PREFIX + columnId, width: '25%',cellsformat: 'D', cellsalign: 'right' });
  }
  if(value.stddeviation){
    columns.push({ text: this.STDDEVIATION +" "+ columnName, dataField: this.STDDEVIATION_PREFIX + columnId, width: '25%',cellsformat: 'D', cellsalign: 'right' });
  }
}

getDataField(){
  let dataField: any[] = [
                            { name: 'id', type: 'number' },
                            { name: 'variable', type: 'string' },
                            { name: 'children', type: 'array' },
                            { name: 'expanded', type: 'bool' }
                          ];
  for(let value of this.globals.values){
    this.addColumnConfigObj(value,dataField);
  }
  return dataField;
}

addColumnConfigObj(value : any,dataField: any[]){
  let columnName = value.id;
  if(value.average){
    dataField.push({ name: this.AVG_PREFIX + columnName, type: 'number' });
  }
  if(value.summary){
    dataField.push({ name: this.SUM_PREFIX + columnName, type: 'number' });
  }
  if(value.min){
    dataField.push({ name: this.MIN_PREFIX + columnName, type: 'number' });
  }
  if(value.max){
    dataField.push({ name: this.MAX_PREFIX + columnName, type: 'number' });
  }
  if(value.count){
    dataField.push({ name: this.COUNT_PREFIX + columnName, type: 'number' });
  }
  if(value.mean){
    dataField.push({ name: this.MEAN_PREFIX + columnName, type: 'number' });
  }
  if(value.stddeviation){
    dataField.push({ name: this.STDDEVIATION_PREFIX + columnName, type: 'number' });
  }
}

handlerError(_this,result){
  console.log(result);
  _this.globals.isLoading = false;  
}


}
