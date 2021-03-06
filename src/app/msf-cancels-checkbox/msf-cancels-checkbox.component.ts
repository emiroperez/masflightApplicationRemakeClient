import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-cancels-checkbox',
  templateUrl: './msf-cancels-checkbox.component.html',
  styleUrls: ['./msf-cancels-checkbox.component.css']
})
export class MsfCancelsCheckboxComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  selected: any[] = [];

  all = {"checked":false};

  data =  [
    {"id":"A",
    "name":"Carrier (A)",
    "value":"Carrier (A)",
    "checked":false},
    {"id":"B",
    "name":"Weather (B)",
    "value":"Weather (B)",
    "checked":false},
    {"id":"C",
    "name":"Airspace (C)",
    "value":"Airspace (C)",
    "checked":false},
    {"id":"D",
    "name":"Security (D)",
    "value":"Security (D)",
    "checked":false},
    {"id":"E",
    "name":"Late Inbound (E)",
    "value":"Late Inbound (E)",
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

    this.startURLUpdate.emit ();
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

}
