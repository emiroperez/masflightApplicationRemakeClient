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
import { MatTableDataSource, MatPaginator } from '@angular/material';


@Component({
  selector: 'app-user-activation',
  templateUrl: './user-activation.component.html',
  styleUrls: ['./user-activation.component.css']
})
export class UserActivationComponent implements OnInit {

  innerHeight: number;
  innerWidth: number;
  users: any[] = [];
  usersToAdd: any[] = [];
  userSelected: any;
  dataSource;

  constructor(private http: ApiClient, public globals: Globals,
    private service: ApplicationService, private userService: UserService) { }


    displayedColumns = ['columnName', 'columnLastName', 'columnEmail', 'columnAddress', 'columnPostalCode',
    'columnCountry', 'columnCountryState', 'columnPhone', 'columnState', 'columnCustomer'];

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
  }

  handlerError(_this, result) {
    _this.globals.isLoading = false;
    _this.globals.consoleLog(result);
  }

  getUsers(){
    this.service.loadAllUsers(this, this.handlerSuccessUsers, this.handlerErrorUsers);
  }

  handlerSuccessUsers(_this, data){
    _this.users = data;
    _this.globals.consoleLog(_this.users);
    _this.dataSource = new MatTableDataSource(_this.users);
    _this.dataSource.paginator = _this.paginator;
    _this.service.getCustomers (_this, _this.handlerSuccessInit, _this.handlerError);
  }

  handlerErrorUsers(_this, result){
    _this.globals.consoleLog(result);
    _this.globals.isLoading = false;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  saveUsers() {
      this.userService.activationUsers(this, this.usersToAdd, this.handlerSuccessSave, this.handlerErrorSave);
  }

  handlerSuccessSave(_this, data){
    _this.globals.isLoading = false;
  }

  handlerErrorSave(_this, result){
    _this.globals.consoleLog(result);
    _this.globals.isLoading = false;
  }

  addToJson(element){
    this.userSelected = element;
    this.userSelected.state ? this.userSelected.state = 1 : this.userSelected.state = 0;
    this.usersToAdd.push(this.userSelected);
    this.globals.consoleLog(this.usersToAdd);
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
  }



