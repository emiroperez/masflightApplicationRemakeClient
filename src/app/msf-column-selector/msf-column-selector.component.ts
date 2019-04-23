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
  
}
