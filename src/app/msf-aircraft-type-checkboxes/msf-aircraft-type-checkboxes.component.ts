import { Component, OnInit, Input } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-aircraft-type-checkboxes',
  templateUrl: './msf-aircraft-type-checkboxes.component.html',
  styleUrls: ['./msf-aircraft-type-checkboxes.component.css']
})
export class MsfAircraftTypeCheckboxesComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  selected: any[] = [];
  all = {"checked":false};
  

  data =  [
      {"id":"REGIONALS",
      "name":"Regionals",
      "value":"REGIONALS",
      "checked":false},
      {"id":"NARROWBODY",
      "name":"Narrow Body",
      "value":"NARROWBODY",
      "checked":false},
      {"id":"WIDEBODY",
      "name":"Wide Body",
      "value":"WIDEBODY",
      "checked":false}
      ,
  ];

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
