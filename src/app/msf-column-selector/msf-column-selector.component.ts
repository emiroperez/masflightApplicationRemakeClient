import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-msf-column-selector',
  templateUrl: './msf-column-selector.component.html',
  styleUrls: ['./msf-column-selector.component.css']
})
export class MsfColumnSelectorComponent implements OnInit {


  selected: any[] = [];
  search;
  searchText = "Select to filter columns";

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
  constructor(public globals:Globals,
    public dialogRef: MatDialogRef<MsfColumnSelectorComponent>) { }

    onNoClick(): void
    {
      this.dialogRef.close ();
    }

    closeDialog(): void
    {
      this.dialogRef.close ();
    }

  ngOnInit() { 
    this.globals.displayedColumns.forEach(element => {
      if(element.show){
        element.checked = true;
      }
    });
    this.selected = this.globals.displayedColumns.slice();
  }

  checkBoxChange(checkBox){
    if(checkBox.checked){
      if(!this.inList(this.selected,"columnName",checkBox.id)){
        this.selected.push(checkBox);
        this.setShowColumn(checkBox,this,true);
      }
    }else{
      var index = this.selected.findIndex(column => column.columnName === checkBox.columnName)
          if(this.selected.length>1){
            this.setShowColumn(checkBox,this,false);
            this.selected.splice(index, 1);
          }
    }

  }

  setShowColumn(checkBox,_this, value){
    var index = _this.globals.displayedColumns.findIndex(column => column.columnName === checkBox.columnName);
    _this.globals.displayedColumns[index].show = value;
    _this.globals.displayedColumns[index].checked = value;
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
  }

  checkBoxAllChange(){
    if(this.all.checked){
      this.changeAllSelected(true);
    }else{
      this.changeAllSelected(false);
    }
  }
}
