import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';
import { iif, of, Observable } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-msf-sorting-checkboxes',
  templateUrl: './msf-sorting-checkboxes.component.html',
  styleUrls: ['./msf-sorting-checkboxes.component.css']
})
export class MsfSortingCheckboxesComponent implements OnInit {
  @Input("argument")
  public argument: Arguments;

  @Input("currentOptionId")
  currentOptionId: number;

  @Input("show")
  show: boolean = true;

  @Input("createdMetas")
  createdMetas: any;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("setLoading")
  setLoading = new EventEmitter ();

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  selected: any[] = [];
  all = {"checked":false};

  data:any[] = [];

  // data: any[] = [
  //   {columnName: 'Year', columnLabel: 'Year',"checked":false, "order":"desc"},
  //   {columnName: 'Month', columnLabel: 'Month', "checked":false, "order":"desc"},
  //   {columnName: 'Date', columnLabel: 'Day' ,"checked":false, "order":"desc"},
  //   {columnName: 'Hour', columnLabel: 'Hour', "checked":false, "order":"desc"},
  //   {columnName: 'EspecificEquipmentType',columnLabel: 'Specific Equipment Type', "checked":false, "order":"desc"},
  //   {columnName: 'GeneralEquipmentType',columnLabel: 'General Equipment Type',"checked":false, "order":"desc"},
  //   {columnName: 'OperatingAirline', columnLabel: 'Operating Airline',"checked":false, "order":"desc"},                          
  //   {columnName: 'Origin', columnLabel: 'Origin Airport',"checked":false, "order":"desc"},
  //   {columnName: 'Destination', columnLabel: 'Destination Airport',"checked":false, "order":"desc"},
  //   {columnName: 'FlightNumber', columnLabel: 'Flight Number',"checked":false, "order":"desc"},
  //   {columnName: 'Route', columnLabel: 'Route',"checked":false, "order":"desc"}

  // ];

  constructor(public globals: Globals, private http: ApiClient) { }

  ngOnInit()
  { 
    this.getRecords (null, this.handlerSuccess);

    if(this.argument.value1 != null)
      this.selected = this.argument.value1;      
  }

  refreshData()
  {
    for (let i = 0; i < this.selected.length; i++)
    {
      const element = this.selected[i];
      var index = this.data.findIndex (aux => aux.id == element.id);

      if (index != -1)
        this.data[index] = element;
    }
  }
  
  getRecords(search, handlerSuccess)
  {
    let url;

    if (this.currentOptionId == null)
    {
      if (this.createdMetas != null)
      {
        this.data = this.createdMetas;
        this.refreshData ();
      }
  
      return;
    }

    this.setLoading.emit (true);
    url = this.globals.baseUrl + "/getMetaByOptionId?optionId="+ this.currentOptionId;
    this.http.get(this,url,handlerSuccess,this.handlerError, null);  
  }
  
  handlerSuccess(_this,data, tab){   
    _this.data = data;
    _this.refreshData();
    if (!_this.globals.appLoading)
      _this.setLoading.emit (false);

    // _this.formatData();
  }
  
  handlerError(_this,result){
    if (!_this.globals.appLoading)
      _this.setLoading.emit (false);
  }

  //   formatData(){
  //   this.data = this.data.concat(this.response);
  //   this.setLoading.emit (false);
  // }

  checkBoxChange(checkBox){
    if(checkBox.checked){
      if(!this.inList(this.selected,"columnName",checkBox.columnName)){
        this.selected.push(checkBox);
      }
    }else{
      this.selected.forEach(function (currentValue, index, array) {
        if (currentValue == checkBox) {
          array.splice(index, 1);
        }
      });
    }
    this.argument.value1 = this.selected;
    if(this.selected.length==this.data.length){
      this.all.checked=true;
    }else{
      this.all.checked=false;
    }

    this.startURLUpdate.emit ();
  }

  getIndex(checkbox: any){
    return this.selected.findIndex(check => checkbox.columnName === check.columnName) + 1;
  }

  inList(list, attr, value){
		for (var i=0;i<list.length;i++){
			var elem=list[i];
			if (elem[attr]==value){
				return true;
			}
		}
		return false;
  }
  
  changeAllSelected(value){
    for (let index = 0; index < this.data.length; index++) {
        const element = this.data[index];
        element.checked = value;
    }
    if(value){
      this.selected = this.data.slice();
    }else{
      this.selected = [];
    }
    this.argument.value1 = this.selected;
    this.startURLUpdate.emit ();
  }

  checkBoxAllChange(){
    if(this.all.checked){
      this.changeAllSelected(true);
    }else{
      this.changeAllSelected(false);
    }
  }

  checkBoxChangeOrder(checkBox){
    if(checkBox.order=='desc'){
      checkBox.order='asc';
    }else{
      checkBox.order='desc';
    }
  }

}
