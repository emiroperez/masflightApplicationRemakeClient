import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-sorting-by-airport',
  templateUrl: './msf-sorting-by-airport.component.html',
  styleUrls: ['./msf-sorting-by-airport.component.css']
})
export class MsfSortingByAirportComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  selected: any[] = [];
  all = {"checked":false};

  data: any[] = [
    {id: 'YEAR', name: 'Year', column:'Year',"checked":false, "order":"desc"},
    {id: 'MONTH', name: 'Month', column:'Month',"checked":false, "order":"desc"},
    {id: 'DAY', name: 'Day' ,column:'Date',"checked":false, "order":"desc"},
    {id: 'HOUR', name: 'Hour', column: 'Hour',"checked":false, "order":"desc"},
    {id: 'EQUIPMENTTYPESPECIFIC', name: 'Specific Equipment Type',column:'EspecificEquipmentType',"checked":false, "order":"desc"},
    {id: 'EQUIPMENTTYPEGENERAL', name: 'General Equipment Type',column:'GeneralEquipmentType',"checked":false, "order":"desc"},
    {id: 'OPERATINGAIRLINE', name: 'Operating Airline',column:'OperatingAirline',"checked":false, "order":"desc"},                          
    {id: 'ORIGINAIRPORT', name: 'Origin Airport',column:'Origin',"checked":false, "order":"desc"},
    {id: 'DESTINATIONAIRPORT', name: 'Destination Airport',column:'Destination',"checked":false, "order":"desc"},
    {id: 'FLIGHTNUMBER', name: 'Flight Number',column:'FlightNumber',"checked":false, "order":"desc"},
    {id: 'MARKETINGAIRLINE', name: 'Marketing Airline',column:'Marketing_Carrier',"checked":false, "order":"desc"},
    {id: 'ROUTE', name: 'Route',column:'Route',"checked":false, "order":"desc"},

    {id: 'Tracked', name: 'Tracked',column:'Tracked',"checked":false, "order":"desc"},
    {id: 'Comp', name: 'Comp',column:'Comp',"checked":false, "order":"desc"},
    {id: 'Cxld', name: 'Cxld',column:'Cxld',"checked":false, "order":"desc"},
    {id: 'Other', name: 'Other',column:'Other',"checked":false, "order":"desc"},
    {id: 'CF_pct', name: 'CF(%)',column:'CF_pct',"checked":false, "order":"desc"},
    {id: 'D0_pct', name: 'DO(%)',column:'D0_pct',"checked":false, "order":"desc"},
    {id: 'D15_pct', name: 'D15(%)',column:'D15_pct',"checked":false, "order":"desc"},
    {id: 'A0_pct', name: 'A0(%)',column:'A0_pct',"checked":false, "order":"desc"},
    {id: 'A14_pct', name: 'A14(%)',column:'A14_pct',"checked":false, "order":"desc"},
    {id: 'Avg_TXO', name: 'Avg TXO',column:'Avg_TXO',"checked":false, "order":"desc"},
    {id: 'TXO_less_30', name: 'TXO less 30',column:'TXO_less_30',"checked":false, "order":"desc"},
    {id: 'TXO_less_30', name: 'TXO 31 60',column:'TXO_31_60',"checked":false, "order":"desc"},
    {id: 'TXO_less_30', name: 'TXO 60',column:'TXO_60',"checked":false, "order":"desc"}
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

  checkBoxChangeOrder(checkBox){
    if(checkBox.order=='desc'){
      checkBox.order='asc';
    }else{
      checkBox.order='desc';
    }
  }

}
