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
  plans:any[] = [];
  plansFare: Plan = new Plan();
  userSelected: any;
  dataSource;

  constructor(private http: ApiClient, public globals: Globals,
    private service: ApplicationService, private userService: UserService) { }


    displayedColumns = ['columnName', 'columnLastName', 'columnEmail', 'columnAddress', 'columnPostalCode',
    'columnCountry', 'columnCountryState', 'columnPhone', 'columnState', 'columnMembership','columnMembershipFare'];

    @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
    this.getUsers();
  }


  getPlansService() {
    this.globals.isLoading = true;
    // let url = "http://localhost:8887/getPlans";
    let url = this.globals.baseUrl+'/getPlans';
    this.http.get(this, url, this.handlerSuccessInit, this.handlerError, null);
  }

  handlerSuccessInit(_this, data, tab) {
    console.log('data: ' + data);
    _this.plans = data;
    console.log(_this.plans);
     for (let i = 0; i < _this.users.length;i++){
      for(let j=0; j<_this.plans.length;j++){
        if(_this.plans[j].id == _this.users[i].userPlan[0].Plan_Id){
          let plans = _this.plans[j];
          _this.users[i].auxplans= plans.fares;
        }
      }
    }
  }

  handlerError(_this, result) {
    _this.globals.isLoading = false;
    console.log(result);
  }

  checkFare(element){
    for(let j=0; j< this.plans.length;j++){
      console.log(this.plans[j]);
      if(this.plans[j].id == element.userPlan[0].Plan_Id){
        let plans = this.plans[j];
        element.auxplans= plans.fares;
      }
    }
    this.addToJson(element);
  }


  getUsers(){
    this.service.loadAllUsers(this, this.handlerSuccessUsers, this.handlerErrorUsers);
  }

  handlerSuccessUsers(_this, data){
    _this.users = data;
    for(let i = 0; i < _this.users.length; i++){
      console.log(i)
      console.log(_this.users[i])
    if (_this.users[i].userPlan.length == 0){
      _this.users[i].userPlan.push({"id": null,"Plan_Id":null,"Fare_Id":null});
    }
    }
    console.log(_this.users)
    _this.getPlansService();
    console.log(_this.users);
    _this.dataSource = new MatTableDataSource(_this.users);
    _this.dataSource.paginator = _this.paginator;
    _this.globals.isLoading = false;
  }

  handlerErrorUsers(_this, result){
    console.log(result);
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
    console.log(result);
    _this.globals.isLoading = false;
  }

  addToJson(element){
    this.userSelected = element;
    this.userSelected.state ? this.userSelected.state = 1 : this.userSelected.state = 0;
    this.usersToAdd.push(this.userSelected);
    console.log(this.usersToAdd);
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



