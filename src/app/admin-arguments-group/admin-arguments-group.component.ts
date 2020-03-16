import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MaterialIconPickerComponent } from '../material-icon-picker/material-icon-picker.component';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MessageComponent } from '../message/message.component';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject, of } from 'rxjs';
import { takeUntil, delay } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';
import { MatDialog } from '@angular/material';
import { AdminShareGroupsArgumentsComponent } from '../admin-share-groups-arguments/admin-share-groups-arguments.component';

@Component({
  selector: 'app-admin-arguments-group, FilterPipeGroupArg',
  templateUrl: './admin-arguments-group.component.html',
  styleUrls: ['./admin-arguments-group.component.css']
})
export class AdminArgumentsGroupComponent implements OnInit {

  innerHeight: number;
  @ViewChild("materialIconPicker", { static: false })
  materialIconPicker: MaterialIconPickerComponent;


  filteredAirline: any[] = [];
  filteredAirport: any[] = [];
  filteredAircraft: any[] = [];

  searchText: string;
  searchAirport: string;
  ArgumentsGroups: any[] = [];  
  ArgumentGroupDelete: any[] = [];
  ArgumentGroup: any = {name: '', group: '', isSelected: false};
  dataToSend: any[] = [];
  
  typeFilterCtrl: FormControl = new FormControl ();
  filteredTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private _onDestroy = new Subject<void> ();

  argGroupTypes: any[] = [
    { value: "Airline", name: "Airline" },
    { value: "Airport", name: "Airport" },
    { value: "AircraftType", name: "AircraftType" }
  ];
  argTypes: any[] = [
    { value: 0, name: "Public" },
    { value: 1, name: "Private" }
    // { value: 2, name: "Shared" }
  ];

  loading: boolean;
  showSelected: boolean = false;
  disable: boolean = true;
  // shareAct: boolean=false;
  
  constructor( private http: ApiClient,public globals: Globals, 
    private service: ApplicationService,
    public dialog: MatDialog) {     
    //add airports and airlines 

    this.getAirports(null,this.AirportHandlerSuccess,this.AirportHandlerError);
    this.getAirlines(null,this.AirlineHandlerSuccess,this.AirlineHandlerError);
    this.getAircraft(null,this.AircraftHandlerSuccess,this.AircraftHandlerError);
    this.searchChange ();
  }

  getAirports(search,AirportHandlerSuccess, AirportHandlerError){
    let url = this.globals.baseUrl + "/getAirports?search="+ (search != null?search:'');
    this.http.get(this,url,AirportHandlerSuccess,AirportHandlerError, null); 
  }
  
  getAirlines(search,AirlineHandlerSuccess, AirlineHandlerError){
    let url = this.globals.baseUrl + "/getAirlines?search="+ (search != null?search:'');
    this.http.get(this,url,AirlineHandlerSuccess,AirlineHandlerError, null); 
  }

  getAircraft(search,AircraftHandlerSuccess, AircraftHandlerError){
    let url = this.globals.baseUrl+ "/getAllAircraftTypes"+ "?search="+ (search != null?search:'');
    this.http.get(this,url,AircraftHandlerSuccess,AircraftHandlerError, null); 
  }
      
  AirportHandlerError(_this,result){
    _this.loading = false; 
  }   

  AirlineHandlerError(_this,result){
    _this.loading = false; 
  }    
  
  AircraftHandlerError(_this,result){
    _this.loading = false; 
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

  AircraftHandlerSuccess(_this,data){   
    if(_this.filteredAircraft.length != 0){
    for (let i = 0; i < data.length; i++) {
        const index: number = _this.filteredAircraft.findIndex(d => d.iata === data[i].iata);
        if(index === -1){
          let NewReg = data[i];
          _this.filteredAircraft.push(NewReg);
        }
      }
    }else{
      _this.filteredAircraft = data;       
    }
  }

  ngOnInit() {
    if (this.globals.currentApplication == undefined)
      this.globals.currentApplication = JSON.parse (localStorage.getItem ("currentApplication"));

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
      // this.shareAct= true;
    } else {
      option.isSelected = !option.isSelected;
      option.focus = false;
      this.ArgumentGroup = {};
      this.disable = true;
      // this.shareAct= false;
    }
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
    }else if (ArgGroup.group === 'AircraftType'){
      const index: number = this.filteredAircraft.findIndex(d => d.name === ArgGroup.iataList[i].name);
      if(index === -1){
        this.filteredAircraft.unshift(ArgGroup.iataList[i]);
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
    this.getAirports(this.searchAirport,this.searchHandlerSuccess,this.AirportHandlerError);  
  } else if(group === 'Airline'){
    this.getAirlines(this.searchAirport,this.searchHandlerSuccessAirline,this.AirportHandlerError);  
  }else if(group === 'AircraftType'){
    this.getAircraft(this.searchAirport,this.searchHandlerSuccessAircraft,this.AirportHandlerError);  
  }
  // }
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

searchHandlerSuccessAircraft(_this,data){   
  if(_this.filteredAircraft.length != 0){
  for (let i = 0; i < data.length; i++) {
      const index: number = _this.filteredAircraft.findIndex(d => d.name === data[i].name);
      if(index === -1){
        let NewReg = data[i];
        _this.filteredAircraft.push(NewReg);
      }
    }      
  }else{
    _this.filteredAircraft = data;       
  } 
  let search = _this.filteredAircraft.filter( it => {
    let aux = it.name ;  
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
    id: null,
    name: '',
    group: '',
    owner:'',
    type: 1,
    share: 0,
    aaa_GroupDet: [],
    iataList: [],
    delete: false
  }
  if (!this.globals.SuperAdmin){
    ArgGroup.type=1;
  }
  this.ArgumentsGroups.unshift(ArgGroup);
  this.getSelectedOption(this.ArgumentsGroups[0]);
  this.disable = false;
  // this.shareAct = false ;
}



deleteCategory() {
  const index: number = this.ArgumentsGroups.findIndex(d => d === this.ArgumentGroup);
    if (index != -1){
      if(this.ArgumentGroup.id){
        this.ArgumentGroupDelete.push(this.ArgumentGroup);
      }
      this.ArgumentGroup.delete = true;
      this.ArgumentsGroups.splice(index, 1);
      this.ArgumentGroup = { id: null, name: '', group: '',owner:'', type: 1,share: 0, aaa_GroupDet: [],iataList: [],delete: false, isSelected: false };
      this.disable = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void {
    this.innerHeight = event.target.innerHeight;

    // if(!this.mobileQuery.matches)
    // {
    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.globals.isFullscreen = true;
    else
      this.globals.isFullscreen = false;
    // }
    // else{
    //   this.globals.isFullscreen = false;
    // }
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

  _this.ArgumentGroup = { id: null, name: '', group: '',owner:'', type: 1,share: 0, isSelected: false };
  _this.ArgumentsGroups = result;
  _this.globals.isLoading = false;
  _this.disable = true;
}

handlerErrorSend(_this,result){
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

compareElementAircraft(st1: any, st2: any, group: any) {
  return st1 && st2 ? st1.name === st2.name : st1 === st2;
}

compareElement(st1: any, st2: any, group: any) {
  return st1 && st2 ? st1.iata === st2.iata : st1 === st2;
}

isSelected(Airport,iataList,group){
  if(iataList){    
    if (group != 'AircraftType' ){
      return iataList.findIndex(a => a.iata === Airport.iata) == -1 && this.showSelected;
    }else{
      return iataList.findIndex(a => a.name === Airport.name) == -1 && this.showSelected;
    }
  }else{
    return false;
  }   
}

sendData() {
  // this.addIataToGroupDet(this.ArgumentsGroups);
  this.dataToSend = this.ArgumentsGroups.concat(this.ArgumentGroupDelete);
  this.service.saveNewGroupArguments(this, this.dataToSend, this.handlerSuccessSend, this.handlerErrorSend);
  this.searchAirport="";
}

share(ArgumentsGroup): void{
  this.dialog.open (AdminShareGroupsArgumentsComponent, {
    height: '430px',
    width: '400px',
    panelClass: 'msf-dashboard-child-panel-dialog',
    data: ArgumentsGroup
  });
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
    }else if(type === 'AircraftType'){
      let index = this.ArgumentGroup.aaa_GroupDet.findIndex(d => d.aircraftType.name === ArgGroupDet.option.value.name);
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
          aircraftType: null,
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
            aircraftType: null,
            delete: false
          }
        this.ArgumentGroup.aaa_GroupDet.push(airport);
      }
    }else if(type === 'AircraftType'){
      let index = this.ArgumentGroup.aaa_GroupDet.findIndex(d => d.aircraftType.name === ArgGroupDet.option.value.name);
      if (index != -1){
        this.ArgumentGroup.aaa_GroupDet[index].delete = false;
        }else{
          const AircraftType = {
            id: null,
            airline: null,
            airport: null,
            aircraftType: ArgGroupDet.option.value,
            delete: false
          }
        this.ArgumentGroup.aaa_GroupDet.push(AircraftType);
      }
    }
  }
}


}
