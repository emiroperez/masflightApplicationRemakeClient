import { Component, OnInit, Input } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-taxi-times-checkboxes',
  templateUrl: './msf-taxi-times-checkboxes.component.html',
  styleUrls: ['./msf-taxi-times-checkboxes.component.css']
})
export class MsfTaxiTimesCheckboxesComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  selected: any[] = [];

  all = {"checked":false};
  data =  [
      {"id":1,
      "name":"Taxi-Out",
      "value":"Taxi-Out",
      "checked":false},
      {"id":2,
      "name":"Taxi-In",
      "value":"Taxi-In",
      "checked":false},
      {"id":3,
      "name":"First Gate Departure",
      "value":"First Gate Departure",
      "checked":false},
      {"id":4,
      "name":"1st Diversion",
      "value":"1st Diversion",
      "checked":false},
      {"id":5,
      "name":"2nd Diversion",
      "value":"2nd Diversion",
      "checked":false}
  ];

  loading = false;
  constructor(public globals: Globals) { }

  ngOnInit() { 
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
      this.selected = this.data;
    }else{
      this.selected = [];
    }
  }

  checkBoxAllChange(){
    if(this.all.checked){
      this.changeAllSelected(true);
    }else{
      this.changeAllSelected(false);
    }
  }

}
