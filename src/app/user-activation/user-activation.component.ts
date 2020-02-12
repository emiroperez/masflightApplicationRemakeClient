import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import {FormControl, Validators,ValidatorFn, ValidationErrors, AbstractControl, FormGroup} from '@angular/forms';
import { User} from '../model/User';
import { State } from '../model/State';
import { Country } from '../model/Country';
import { Plan } from '../model/Plan';
import { UserPlan } from '../model/UserPlan';
import { Utils } from '../commons/utils';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { ApplicationService } from '../services/application.service';
import { UserService } from '../services/user.service';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { DatalakeUserInformationDialogComponent } from '../datalake-user-information-dialog/datalake-user-information-dialog.component';
import { CreateUserDialogComponent } from '../create-user-dialog/create-user-dialog.component';
import { MessageComponent } from '../message/message.component';
import { Customer } from '../model/Customer';


@Component({
  selector: 'app-user-activation',
  templateUrl: './user-activation.component.html'
})
export class UserActivationComponent implements OnInit {

  userCreated: boolean = false;
  innerHeight: number;
  innerWidth: number;
  users: any[] = [];
  usersToAdd: any[] = [];
  customers: Customer[];
  userSelected: any;
  dataSource;

  constructor(private http: ApiClient, public globals: Globals,
    private service: ApplicationService, private userService: UserService,
    private dialog: MatDialog)
  {
    this.globals.showBigLoading = true;
  }

  displayedColumns = ['columnName', 'columnLastName', 'columnEmail', 'columnAddress', 'columnPostalCode',
    'columnCountry', 'columnCountryState', 'columnPhone', 'columnState', 'columnProposedCustomer', 'columnCustomer', 'columnDatalake'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
    this.getUsers();
  }

  handlerSuccessInit(_this, data, tab) {
    _this.customers = data;

    for (let user of _this.users)
    {
      if (!user.customer)
        continue;

      for (let customer of _this.customers)
      {
        if (user.customer.id == customer.id)
        {
          user.customer = customer;
          continue;
        }
      }
    }

    _this.globals.isLoading = false;

    if (_this.userCreated)
    {
      _this.dialog.open (MessageComponent, {
        data: { title: "Information", message: "User has been created succesfully!" }
      });

      _this.userCreated = false;
    }
  }

  handlerError(_this, result) {
    _this.globals.isLoading = false;
  }

  getUsers(){
    this.service.loadAllUsers(this, this.handlerSuccessUsers, this.handlerErrorUsers);
  }

  handlerSuccessUsers(_this, data){
    _this.users = data;
    _this.dataSource = new MatTableDataSource(_this.users);
    _this.dataSource.paginator = _this.paginator;
    _this.service.getCustomers (_this, _this.handlerSuccessInit, _this.handlerError);
  }

  handlerErrorUsers(_this, result){
    _this.globals.isLoading = false;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  saveUsers() {
      this.userService.activationUsers(this, this.usersToAdd, this.handlerSuccessSave, this.handlerErrorSave);
  }

  handlerSuccessSave(_this, data){
    _this.users = [];
    _this.usersToAdd = [];
    _this.service.loadAllUsers(_this, _this.handlerSuccessUsers, _this.handlerErrorUsers);
    // _this.globals.isLoading = false;
  }

  handlerErrorSave(_this, result){
    _this.globals.isLoading = false;
  }

  addToJson(element){
    this.userSelected = element;
    this.userSelected.state ? this.userSelected.state = 1 : this.userSelected.state = 0;
    //add KP
    if(this.usersToAdd.length!=0){
      let index: number = this.usersToAdd.findIndex(d => d.id === this.userSelected.id);
      if(index != -1){
        this.usersToAdd[index].state = this.userSelected.state;
      }else{
        this.usersToAdd.push(this.userSelected);
      }
    }else{
      this.usersToAdd.push(this.userSelected);
    }

    // remove customer info since it's no longer necessary
    element.customerInfo = null;
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.innerHeight = event.target.innerHeight;
    this.innerWidth = event.target.innerWidth;

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

  getInnerWidth(): number
  {
    return this.innerWidth;
  }

  addDatalakeInformationToJson(element,edit){
    this.userSelected = element;
    this.userSelected.datalakeUser ? this.userSelected.datalakeUser = 1 : this.userSelected.datalakeUser = 0;
    if(this.userSelected.datalakeUser){
      let dialogRef = this.dialog.open (DatalakeUserInformationDialogComponent, {
        height: 'auto',
        width: '400px',
        panelClass: 'AddEmailSendAlarms',
        data: {
          userInfoDatalake: this.userSelected.userInfoDatalake
        }
        
      });
      
      dialogRef.afterClosed ().subscribe ((result) => {
        if (result)
        {
          this.userSelected.datalakeUser = result.userDatalake ;
          if(result.userInfoDatalake){
            this.userSelected.userInfoDatalake = result.userInfoDatalake;
            //agrego el estado del usuario datalake
            this.userSelected.userInfoDatalake.state = result.userDatalake;
          }
        if(this.usersToAdd.length!=0){
          let index: number = this.usersToAdd.findIndex(d => d.id === this.userSelected.id);
          if(index != -1){
              this.usersToAdd[index].userInfoDatalake = this.userSelected.userInfoDatalake;
          }else{
            this.usersToAdd.push(this.userSelected);
          }
        }else{
          this.usersToAdd.push(this.userSelected);
        }
        //guardo en la BD        
        this.saveUsers ();
      }else{
        if(!edit){
          //si no estoy editando y cancelo o cierro el dialogo, cambio el estado a no seleccionado
          this.userSelected.datalakeUser ? this.userSelected.datalakeUser = 0 : this.userSelected.datalakeUser = 1;       }
         }
  
      });
    }//sino esta marcado
    else{
      if(this.userSelected.userInfoDatalake){
        if(!this.userSelected.userInfoDatalake.id){
          this.userSelected.userInfoDatalake = null;
        }
      }
      if(this.usersToAdd.length!=0){
        let index: number = this.usersToAdd.findIndex(d => d.id === this.userSelected.id);
        if(index != -1){
          this.usersToAdd[index].datalakeUser = this.userSelected.datalakeUser;
          if(this.usersToAdd[index].userInfoDatalake){
            if(!this.usersToAdd[index].userInfoDatalake.id){
              this.usersToAdd[index].userInfoDatalake = null;
            }
          }
        }else{
          this.usersToAdd.push(this.userSelected);
        }
      }else{
        this.usersToAdd.push(this.userSelected);
      }
    }
  }

  editInformationDatalake(element): void
  {
  }

  createUser(): void
  {
    let self = this;
    let dialogRef = this.dialog.open (CreateUserDialogComponent,
    {
      height: '565px',
      width: '700px',
      panelClass: 'create-user-container',
      data: { customers: this.customers }
    });

    dialogRef.afterClosed ().subscribe ((result) => {
      if (!result)
        return;

      if (result.error)
      {
        self.dialog.open (MessageComponent, {
          data: { title: "Error", message: result.error }
        });

        return;
      }
      else
      {
        // save existing user list
        this.userCreated = true;
        this.saveUsers ();
      }
    });
  }
}
