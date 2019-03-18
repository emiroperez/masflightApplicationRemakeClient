import { Component, OnInit, Input } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-region',
  templateUrl: './msf-region.component.html',
  styleUrls: ['./msf-region.component.css']
})
export class MsfRegionComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  selected: any[] = [];

  all = {"checked":false};

  data =  [
      {"id":1,
      "name":"Domestic",
      "value":"D",
      "checked":false},
      {"id":2,
      "name":"Atlantic",
      "value":"A",
      "checked":false},
      {"id":3,
      "name":"International",
      "value":"I",
      "checked":false},
      {"id":4,
      "name":"Latin America",
      "value":"L",
      "checked":false},
      {"id":5,
      "name":"Pacific",
      "value":"P",
      "checked":false}
  ];

  loading = false;
  constructor(public globals: Globals) { }

  ngOnInit() { 
    if(!this.argument.value1){
      this.all.checked = true;
      this.checkBoxAllChange();
    }
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
