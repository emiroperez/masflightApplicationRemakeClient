import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {FormControl, Validators,ValidatorFn, ValidationErrors, AbstractControl, FormGroup} from '@angular/forms';
import { User} from '../model/User';
import { State } from '../model/State';
import { County } from '../model/Country';
import { Plan } from '../model/Plan';
import { UserPlan } from '../model/UserPlan';
import { Utils } from '../commons/utils';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { ApplicationService } from '../services/application.service';
import { UserService } from '../services/user.service';
import { MatTableDataSource } from '@angular/material';


@Component({
  selector: 'app-user-activation',
  templateUrl: './user-activation.component.html',
  styleUrls: ['./user-activation.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UserActivationComponent implements OnInit {

  users: any[] = [];
  usersToAdd: any[] = [];
  plans: any[] = [];
  userSelected: any;
  dataSource;

  constructor(private http: ApiClient, public globals: Globals,
    private service: ApplicationService, private userService: UserService) { }


    displayedColumns = ['columnName', 'columnLastName', 'columnEmail', 'columnAddress', 'columnPostalCode',
    'columnCountry', 'columnCountryState', 'columnPhone', 'columnState', 'columnMembership'];

    get isActiveBool() {
      return this.users["state"] == 1;
    }

    set isActiveBool(newValue:boolean) {
      this.users["state"] = newValue ? 1 : 0;
    }

  ngOnInit() {
    this.getUsers();
  }


  getPlansService() {
    this.globals.isLoading = true;
    let url = "http://localhost:8887/getPlans";
    //let url = '/getPlans';
    this.http.get(this, url, this.handlerSuccessInit, this.handlerError, null);
  }

  handlerSuccessInit(_this, data, tab) {
    console.log('data: ' + data);
    _this.plans = data;

  }
  handlerError(_this, result) {
    _this.globals.isLoading = false;
    console.log(result);
  }


  getUsers(){
    this.service.loadAllUsers(this, this.handlerSuccessUsers, this.handlerErrorUsers);
  }

  handlerSuccessUsers(_this, data){
    _this.users = data;
    _this.getPlansService();
    console.log(_this.users);
    _this.dataSource = new MatTableDataSource(_this.users);
    _this.globals.isLoading = false;
  }

  handlerErrorUsers(_this, result){
    console.log(result);
    _this.globals.isLoading = false;
  }


  saveUsers() {
      this.userService.activationUsers(this, this.usersToAdd, this.handlerSuccessSave, this.handlerErrorSave);
  }

  handlerSuccessSave(_this, data){
    _this.globals.isLoading = false;
  }

  handlerErrorSave(_this, result){
    console.log(result);
    _this.globals.isLoading = false;
  }

  addToJson(element){
    this.userSelected = element;
    this.userSelected.state ? this.userSelected.state = 1 : this.userSelected.state = 0;

    console.log(this.userSelected.state);
    this.usersToAdd.push(this.userSelected);
    console.log(this.usersToAdd);
  }

  }



