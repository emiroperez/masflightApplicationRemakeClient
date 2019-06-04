import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-msf-check-box',
  templateUrl: './msf-check-box.component.html',
  styleUrls: ['./msf-check-box.component.css']
})
export class MsfCheckBoxComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  data: Observable<any[]>;

  selected: any[] = [];

  all = {"checked":false};

  loading = false;
  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() { 
    this.getRecords(null, this.handlerSuccess);
  }

  getRecords(search, handlerSuccess){
    if(this.data == null || this.getRecords.length == 0){
      let url = this.globals.baseUrl + this.argument.url + "?search="+ (search != null?search:'');
      this.http.get(this,url,handlerSuccess,this.handlerError, null);  
    }
          
  }

  handlerSuccess(_this,data, tab){   
    _this.data = of(data).pipe(delay(500));;        
  }
  
  handlerError(_this,result){
    console.log (result);
  }

  checkBoxChange(checkBox){
    if(checkBox.checked){
      if(!this.inList(this.selected,"id",checkBox.id)){
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
  

}
