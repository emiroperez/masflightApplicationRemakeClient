import { Component, OnInit, HostListener } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MessageComponent } from '../message/message.component';
import { MatDialog } from '@angular/material';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-datalake-create-roles',
  templateUrl: './datalake-create-roles.component.html'
})
export class DatalakeCreateRolesComponent implements OnInit {
  innerHeight: number;
  searchText: string;
  searchOption: string;
  listOptions: any[] = [];
  Roles: any[] = []; 
  Role: any = {name: '',state:0, isSelected: false};
  disable: boolean = true;
  dataToSend: any[] = [];
  showSelected: boolean = false;
  filteredOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  tempDatalakeOptionRoles: any= [];

  constructor(public globals: Globals, 
    private service: ApplicationService,
    public dialog: MatDialog)
  {
  }

  ngOnInit() {
    this.innerHeight = window.innerHeight;
    this.getRoles();
  }

  getRoles() {
    this.globals.isLoading = true;
    this.service.getDatalakeRoles(this,"", this.handlerSuccessRoles, this.handlerErrorRoles);
  }

  handlerSuccessRoles(_this, result) {
    _this.Roles = result
    // _this.tempDatalakeOptionRoles = _this.Roles.slice();    
    _this.tempDatalakeOptionRoles = JSON.parse (JSON.stringify (_this.Roles));
    _this.service.getDatalakeOptions(_this,"", _this.handlerSuccessOptions, _this.handlerErrorOptions);
  }

  handlerErrorRoles(_this, result){
    _this.globals.isLoading = false;
  }

  handlerSuccessOptions(_this, result) {
    _this.listOptions = result;
    _this.filteredOptions.next (_this.listOptions.slice ());
    _this.globals.isLoading = false;
  }

  handlerErrorOptions(_this, result){
    _this.globals.isLoading = false;
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event)
  {
    this.innerHeight = event.target.innerHeight;

    if (this.globals.isTablet ())
      return;

    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.globals.isFullscreen = true;
    else
      this.globals.isFullscreen = false;
  }
  
  getInnerHeight(): number
  {
    return this.innerHeight;
  }

  addRole(){
    const role = {
      id: null,
      name: '',
      state: 1,
      datalakeOption: []
    }
    this.Roles.unshift(role);
    this.getSelectedOption(this.Roles[0]);
    this.disable = false;
  }

sendData() {
  // this.dataToSend = this.ArgumentsGroups.concat(this.ArgumentGroupDelete);
  // this.dataToSend = this.Roles;
  this.dataToSend = this.tempDatalakeOptionRoles;
  this.service.saveNewDatalakeRole(this, this.dataToSend, this.handlerSuccessSend, this.handlerErrorSend);
  this.searchOption="";
}


handlerSuccessSend(_this, result){
  _this.Roles = [];
  _this.tempDatalakeOptionRol = [];
  _this.Role = { id: null, name: '', state: 0,isSelected: false };
  // _this.Roles = result;
  // _this.tempDatalakeOptionRoles = JSON.parse (JSON.stringify (_this.Roles));
  // _this.globals.isLoading = false;
  _this.disable = true;
  _this.service.getDatalakeRoles(_this,"", _this.handlerSuccessRoles, _this.handlerErrorRoles);
}

handlerErrorSend(_this,result){
  _this.globals.isLoading = false;
  _this.dialog.open(MessageComponent, {
    data: { title:"Error", message: "It was an error, try again."}
  });
}


  // deleteRole(){
  //   const index: number = this.Roles.findIndex(d => d === this.Role);
  //     if (index != -1){
  //       this.Roles[index].state=0;
  //       this.Role = { id: null, name: '', state: 0, datalakeOption: [],isSelected: false };
  //       this.disable = true;
  //     }
  //   }

    compareElement(st1: any, st2: any){
      return st1 && st2.action ? st1.id === st2.action.id : st1 === st2;
    }

    isSelected(action, optionList){
      if(optionList){
        return optionList.findIndex(a => a.action.id === action.id) == -1 && this.showSelected;
      }else{
        return false;
      }
    }

    filteredOption(): void
    {
      // get the search keyword
      let search = this.searchOption;
      if (!search)
      {
        this.filteredOptions.next (this.listOptions.slice ());
        return;
      }
  
      search = search.toLowerCase ();
      this.filteredOptions.next (
        this.listOptions.filter (a => a.name.toLowerCase ().indexOf (search) > -1)
      );
    }
  
  getSelectedOption(option) {
      if (this.Role !== option) {
        option.isSelected = !option.isSelected;
        this.Role.isSelected = !this.Role.isSelected;
        option.focus = true;
        this.Role = option;
        this.disable = false;
      } else {
        option.isSelected = !option.isSelected;
        option.focus = false;
        this.Role = {};
        this.disable = true;
      }
  }
  
    RoleChanged(event,role): void
  {
    // this.RoleChangedView(event,role);
    let aux = event.option.value;
    if(!event.option.selected){
      //desmarcando la opcion
      let indexRol = -1;
      if(role.id){
        //si tiene id viene de la BD,busco el rol por el id
        indexRol= this.tempDatalakeOptionRoles.findIndex(dR => dR.id === role.id);
      }else{
        //sino tiene id es agregado recientemente
        indexRol= this.tempDatalakeOptionRoles.findIndex(dR => dR.name === role.name);
      }

      if(indexRol != -1){
        //si encuentra el rol busco la opcion
        let index= this.tempDatalakeOptionRoles[indexRol].datalakeOption.findIndex(doR => doR.action.id === aux.id);
        if(index!=-1){
          if(this.tempDatalakeOptionRoles[indexRol].datalakeOption[index].id){
            //si encuentra la opcion y tiene id, le cambio el estado para borrarla por BD
          this.tempDatalakeOptionRoles[indexRol].datalakeOption[index].state = 0
          }else{
            //si encuentra la opcion y NO tiene id, la borro de la lista
            this.tempDatalakeOptionRoles[indexRol].datalakeOption.splice(index,1)
          }
        }
      }
      //sino encuentra el rol
      else{

      }
    }else{
      //marcando la opcion
      let indexRol = -1;
      if(role.id){
        //si tiene id viene de la BD
        indexRol= this.tempDatalakeOptionRoles.findIndex(dR => dR.id === role.id);
      }else{
        //sino tiene id es agregado recientemente
        indexRol= this.tempDatalakeOptionRoles.findIndex(dR => dR.name === role.name);
      }
      if(indexRol != -1){
        //si el rol existe busco la accion
        let index= this.tempDatalakeOptionRoles[indexRol].datalakeOption.findIndex(dR => dR.action.id === aux.id);
        if(index!=-1){
          this.tempDatalakeOptionRoles[indexRol].datalakeOption[index].state = 1
        }else{
          //si la accion no existe la agrego
          this.tempDatalakeOptionRoles[indexRol].datalakeOption.push({id: null, action: aux, state: 1});
        }
      }else{
        //si el rol no existe lo agrego
       let rolTemp = JSON.parse (JSON.stringify (role));
       rolTemp.datalakeOption = [{
          id: null,
          action: aux,
          state: 1
        }]


        this.tempDatalakeOptionRoles.push(rolTemp);
      }
    }
  }


  }
