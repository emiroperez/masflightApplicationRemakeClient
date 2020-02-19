import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-diversions-checkbox',
  templateUrl: './msf-diversions-checkbox.component.html',
  styleUrls: ['./msf-diversions-checkbox.component.css']
})
export class MsfDiversionsCheckboxComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();
  
  selected: any[] = [];
  all = {"checked":false};
  data =  [
      {"id":"airborne",
      "name":"Airborne Return To Origin",
      "value":"Airborne Return To Origin",
      "checked":false},
      {"id":"enroutenroute",
      "name":"En-route Diversion",
      "value":"En-route Diversion",
      "checked":false}
  ];

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
