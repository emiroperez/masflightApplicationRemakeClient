import { Component, OnInit, Input } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-fare-types',
  templateUrl: './msf-fare-types.component.html',
  styleUrls: ['./msf-fare-types.component.css']
})
export class MsfFareTypesComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  selected: any[] = [];

  all = {"checked":false};

  data =  [
      {"id":"A",
      "name":"A - First Class",
      "value":"A - First Class",
      "checked":false},
      {"id":"C",
      "name":"C - Coach",
      "value":"C - Coach",
      "checked":false},
      {"id":"E",
      "name":"C - Mixed First Class and Coach",
      "value":"C - Mixed First Class and Coach",
      "checked":false},
      {"id":"F",
      "name":"F - Passenger/Cargo",
      "value":"F - Passenger/Cargo",
      "checked":false},
      {"id":"G",
      "name":"G - All Cargo",
      "value":"G - All Cargo",
      "checked":false},
      {"id":"H",
      "name":"H - Humane Reason Unschedule",
      "value":"H - Humane Reason Unschedule",
      "checked":false},
      {"id":"K",
      "name":"K - Schedule Service (F+G)",
      "value":"K - Schedule Service (F+G)",
      "checked":false},
      {"id":"L",
      "name":"L - NS Civilian",
      "value":"L - NS Civilian",
      "checked":false},
      {"id":"N",
      "name":"N - NS Military",
      "value":" N - NS Military",
      "checked":false},
      {"id":"P",
      "name":"P - NS All Cargo",
      "value":"P - NS All Cargo",
      "checked":false},
      {"id":"Q",
      "name":"Q - NS Service",
      "value":"Q - NS Service",
      "checked":false},
      {"id":"R",
      "name":"R - NS Military All Cargo",
      "value":"R - NS Military All Cargo",
      "checked":false},
      {"id":"V",
      "name":"V - NS service (L+N+P+R)",
      "value":" V - NS service (L+N+P+R)",
      "checked":false},
      {"id":"Z",
      "name":"Z - All Service (K+V)",
      "value":"Z - All Service (K+V)",
      "checked":false}
  ];

  loading = false;
  constructor(public globals: Globals) { }

  ngOnInit() { 
    this.all.checked = true;
    this.checkBoxAllChange();
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
    if(this.selected.length==this.data.length){
      this.all.checked=true;
    }else{
      this.all.checked=false;
    }
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
  }

  checkBoxAllChange(){
    if(this.all.checked){
      this.changeAllSelected(true);
    }else{
      this.changeAllSelected(false);
    }
  }
}
