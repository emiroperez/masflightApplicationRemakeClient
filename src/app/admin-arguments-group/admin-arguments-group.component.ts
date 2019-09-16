import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialIconPickerComponent } from '../material-icon-picker/material-icon-picker.component';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MessageComponent } from '../message/message.component';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject, of } from 'rxjs';
import { takeUntil, delay } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-admin-arguments-group, FilterPipeGroupArg',
  templateUrl: './admin-arguments-group.component.html',
  styleUrls: ['./admin-arguments-group.component.css']
})
export class AdminArgumentsGroupComponent implements OnInit {

  innerHeight: number;
  @ViewChild("materialIconPicker")
  materialIconPicker: MaterialIconPickerComponent;
  searchText: string;
  searchAirport: string;
  ArgumentsGroups: any[] = [];  
  ArgumentGroupDelete: any[] = [];
  ArgumentGroup: any = {name: '', group: '', isSelected: false};
  dataToSend: any[] = [];
  AirportSelect: any[] = [];  
  
  typeFilterCtrl: FormControl = new FormControl ();
  filteredTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  filteredAirline: any[] = [];
  filteredAirport: any[] = [];
  private _onDestroy = new Subject<void> ();

  argGroupTypes: any[] = [
    { value: "Airline", name: "Airline" },
    { value: "Airport", name: "Airport" },
    { value: "AircraftType", name: "AircraftType" }
  ];
  argTypes: any[] = [
    { value: 0, name: "Public" },
    { value: 1, name: "Private" },
    { value: 2, name: "Shared" }
  ];

  loading: boolean;
  showSelected: boolean = false;
  groupSelect: any;
  disable: boolean = true;
  
  constructor( private http: ApiClient,public globals: Globals, 
    private service: ApplicationService) {     
    //add airports and airlines 
    this.getAirports(null,this.AirportHandlerSuccess,this.AirportHandlerError);
    this.getAirlines(null,this.AirlineHandlerSuccess,this.AirlineHandlerError);
    this.searchChange ();
  }

  getAirports(search,HandlerSuccess, HandlerError){
    let url = this.globals.baseUrl + "/getAirports?search="+ (search != null?search:'');
    this.http.get(this,url,HandlerSuccess,HandlerError, null); 
  }
      
  AirportHandlerError(_this,result){
    _this.loading = false; 
    console.log (result);
  }
  AirportHandlerSuccess(_this,data){   
    if(_this.filteredAirport.length != 0){
    for (let i = 0; i < data.length; i++) {
        const index: number = _this.filteredAirport.findIndex(d => d.iata === data[i].iata);
        if(index === -1){
          let NewReg = data[i];
          _this.filteredAirport.push(NewReg);
        }
      }
    }else{
      _this.filteredAirport = data;       
    }         
  }

  getAirlines(search,AirlineHandlerSuccess, AirlineHandlerError){
    let url = this.globals.baseUrl + "/getAirlines?search="+ (search != null?search:'');
    this.http.get(this,url,AirlineHandlerSuccess,AirlineHandlerError, null); 
  }

  AirlineHandlerSuccess(_this,data){   
    if(_this.filteredAirline.length != 0){
    for (let i = 0; i < data.length; i++) {
        const index: number = _this.filteredAirline.findIndex(d => d.iata === data[i].iata);
        if(index === -1){
          let NewReg = data[i];
          _this.filteredAirline.push(NewReg);
        }
      }
    }else{
      _this.filteredAirline = data;       
    }         
  }
      
  AirlineHandlerError(_this,result){
    _this.loading = false; 
    console.log (result);
  }

  ngOnInit() {
    this.innerHeight = window.innerHeight;
    this.getGroupsArguments();
  }

  getGroupsArguments() {
    this.globals.isLoading = true;
    this.service.loadGroupArguments(this, this.handlerSuccessGroupsArguments, this.handlerErrorGroupsArguments);
  }

  handlerSuccessGroupsArguments(_this, result) {
    _this.ArgumentsGroups = result;
    _this.globals.isLoading = false;
  }

  handlerErrorGroupsArguments(_this, result){
    console.log(result);
    _this.globals.isLoading = false;
  }

  getSelectedOption(option) {
    if (this.ArgumentGroup !== option) {
      option.isSelected = !option.isSelected;
      this.ArgumentGroup.isSelected = !this.ArgumentGroup.isSelected;
      option.focus = true;
      this.ArgumentGroup = option;      
      this.checkArgGroupDet(this.ArgumentGroup);
      this.disable = false;
    } else {
      option.isSelected = !option.isSelected;
      option.focus = false;
      this.ArgumentGroup = {};
      this.disable = true;
    }
    console.log(this.ArgumentGroup);
}
  
checkArgGroupDet(ArgGroup: any){
  for (let i = 0; i < ArgGroup.iataList.length; i++) {
    if (ArgGroup.group === 'Airport'){
      const index: number = this.filteredAirport.findIndex(d => d.iata === ArgGroup.iataList[i].iata);
      if(index === -1){
        this.filteredAirport.unshift(ArgGroup.iataList[i]);
        // this.filteredAirport.push(ArgGroup.iataList[i]);
      }
    }else if (ArgGroup.group === 'Airline'){
      const index: number = this.filteredAirline.findIndex(d => d.iata === ArgGroup.iataList[i].iata);
      if(index === -1){
        this.filteredAirline.unshift(ArgGroup.iataList[i]);
        // this.filteredAirline.push(ArgGroup.iataList[i]);
      }
    }
  }
}

onSearch(group: any){
  this.loading = true;
  // let search = this.filteredAirport.filter( it => {
  //   let aux = it.iata + ' - ' +it.name;  
  //   if(aux.toLowerCase().includes(event)){
  //     it.visible = true;
  //   }else{
  //     it.visible = false;
  //   }
  //   return aux.toLowerCase().includes(event);
  // });
  // if (search.length == 0){
  // this.filteredAirport.forEach(element => {
  //   element.visible = false;
  // });
  this.searchAirport = this.searchAirport.toUpperCase()
  if(group === 'Airport'){
    this.getAirports(this.searchAirport.toUpperCase(),this.searchHandlerSuccess,this.AirportHandlerError);  
  } else if(group === 'Airline'){
    this.getAirlines(this.searchAirport.toUpperCase(),this.searchHandlerSuccessAirline,this.AirportHandlerError);  
  }
  // }
}

searchHandlerSuccessAirline(_this,data){   
  if(_this.filteredAirline.length != 0){
  for (let i = 0; i < data.length; i++) {
      const index: number = _this.filteredAirline.findIndex(d => d.iata === data[i].iata);
      if(index === -1){
        let NewReg = data[i];
        _this.filteredAirline.push(NewReg);
      }
    }      
  }else{
    _this.filteredAirline = data;       
  } 
  let search = _this.filteredAirline.filter( it => {
    let aux = it.iata + ' - ' +it.name;  
    if(aux.toUpperCase().includes(_this.searchAirport)){
      it.visible = true;
    }else{
      it.visible = false;
    }
    return aux.toUpperCase().includes(_this.searchAirport);
  });

}

  searchHandlerSuccess(_this,data){   
    if(_this.filteredAirport.length != 0){
    for (let i = 0; i < data.length; i++) {
        const index: number = _this.filteredAirport.findIndex(d => d.iata === data[i].iata);
        if(index === -1){
          let NewReg = data[i];
          _this.filteredAirport.push(NewReg);
        }
      }      
    }else{
      _this.filteredAirport = data;       
    } 
    let search = _this.filteredAirport.filter( it => {
      let aux = it.iata + ' - ' +it.name;  
      if(aux.toUpperCase().includes(_this.searchAirport)){
        it.visible = true;
      }else{
        it.visible = false;
      }
      return aux.toUpperCase().includes(_this.searchAirport);
    });

  }

addCategory() {
  const ArgGroup = {
    name: '',
    group: '',
    owner:'',
    type: 0,
    aaa_GroupDet: [],
    iataList: [],
    delete: false
  }
  this.ArgumentsGroups.unshift(ArgGroup);
  this.getSelectedOption(this.ArgumentsGroups[0]);
  this.disable = false;
}



deleteCategory() {
  const index: number = this.ArgumentsGroups.findIndex(d => d === this.ArgumentGroup);
    if (index != -1){
      if(this.ArgumentGroup.id){
        this.ArgumentGroupDelete.push(this.ArgumentGroup);
      }
      this.ArgumentGroup.delete = true;
      this.ArgumentsGroups.splice(index, 1);
      this.ArgumentGroup = { name: '', group: '',owner:'', type: 0,aaa_GroupDet: [],iataList: [],delete: false, isSelected: false };
      this.disable = true;
    }
  }

    getInnerHeight(): number
    {
      return this.innerHeight;
    }
  
hideIconPicker(): void
  {
    if (this.materialIconPicker)
      this.materialIconPicker.disableIconPicker ();
  }


handlerSuccessSend(_this, result){

  // if (_this.ArgumentsGroups.length != result.length)
  // {
  //   _this.dialog.open (MessageComponent, {
  //     data: { title: "Information", message: "Some arguments category/ies were not deleted because some options are using it."}
  //   });
  // }

  _this.ArgumentGroup = { name: '', group: '',owner:'', type: 0, isSelected: false };
  _this.ArgumentsGroups = result;
  _this.globals.isLoading = false;
  _this.disable = true;
}

handlerErrorSend(_this,result){
  console.log(result);
  _this.globals.isLoading = false;
  _this.dialog.open(MessageComponent, {
    data: { title:"Error", message: "It was an error, try again."}
  });
}

private filterTypes(): void
{
  // get the search keyword
  let search = this.typeFilterCtrl.value;
  if (!search)
  {
    this.filteredTypes.next (this.argGroupTypes.slice ());
    return;
  }

  search = search.toLowerCase ();
  this.filteredTypes.next (
    this.argGroupTypes.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
  );
}

searchChange(): void
{
  // listen for search field value changes
  this.typeFilterCtrl.valueChanges
    .pipe (takeUntil (this._onDestroy))
    .subscribe (() => {
      this.filterTypes ();
    });
}



handlerSuccess(_this,data, tab){   
  _this.loading = false;
  _this.globals.airports = of(data).pipe(delay(500));;        
}

compareElement(st1: any, st2: any) {
  return st1 && st2 ? st1.iata === st2.iata : st1 === st2;
}

isSelected(Airport,iataList){
  if(iataList){
    return iataList.findIndex(a => a.iata === Airport.iata) == -1 && this.showSelected;
  }else{
    return false;
  }   
}

sendData() {
  console.log(this.ArgumentsGroups);
  // this.addIataToGroupDet(this.ArgumentsGroups);
  this.dataToSend = this.ArgumentsGroups.concat(this.ArgumentGroupDelete);
  this.service.saveNewGroupArguments(this, this.dataToSend, this.handlerSuccessSend, this.handlerErrorSend);
  this.searchAirport="";
}

addGroupDet(ArgGroupDet, type) {
  if (!ArgGroupDet.option.selected) {
    if(type === 'Airline'){
      let index = this.ArgumentGroup.aaa_GroupDet.findIndex(d => d.airline.iata === ArgGroupDet.option.value.iata);
      if (index != -1){
        if(this.ArgumentGroup.aaa_GroupDet[index].id){
          this.ArgumentGroup.aaa_GroupDet[index].delete = true;
        }else{
          this.ArgumentGroup.aaa_GroupDet.splice(index, 1);
        }
      }
    }else if(type === 'Airport'){
      let index = this.ArgumentGroup.aaa_GroupDet.findIndex(d => d.airport.iata === ArgGroupDet.option.value.iata);
      if (index != -1){
        if(this.ArgumentGroup.aaa_GroupDet[index].id){
          this.ArgumentGroup.aaa_GroupDet[index].delete = true;
        }else{
          this.ArgumentGroup.aaa_GroupDet.splice(index, 1);
        }
      }
  }
  }else {
    if(type === 'Airline'){
      let index = this.ArgumentGroup.aaa_GroupDet.findIndex(d => d.airline.iata === ArgGroupDet.option.value.iata);
      if (index != -1){
          this.ArgumentGroup.aaa_GroupDet[index].delete = false;
      }else{
        const airline = {
          id: null,
          airline: ArgGroupDet.option.value,
          airport: null,
          aircraftTail: null,
          delete: false
        }
        this.ArgumentGroup.aaa_GroupDet.push(airline);
    }
    }else if(type === 'Airport'){
      let index = this.ArgumentGroup.aaa_GroupDet.findIndex(d => d.airport.iata === ArgGroupDet.option.value.iata);
      if (index != -1){
        this.ArgumentGroup.aaa_GroupDet[index].delete = false;
        }else{
          const airport = {
            id: null,
            airline: null,
            airport: ArgGroupDet.option.value,
            aircraftTail: null,
            delete: false
          }
        this.ArgumentGroup.aaa_GroupDet.push(airport);
      }
    }
  }
}


}
