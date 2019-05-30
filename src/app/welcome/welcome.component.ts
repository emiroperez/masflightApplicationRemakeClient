import { Component, OnInit, Inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Globals } from '../globals/Globals';
import { WelcomeService } from '../services/welcome.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MenuService } from '../services/menu.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  options:any[]=[];
  options2:any[]=[];

  activeElement ='Landing';
  userName: string;


  customer = {
    name: 'Emiro Perez',
    lastSession:'July 12, 2018',
    overview:{
                since:'12/14/2011',
                plan: 'Administrator',
                username:'admin',
                email: 'emiro.perez@aspsols.com',
                expDate: '12/14/3011(over 994 year)',
                company: 'Jet Blue',
                jobTitle: '',
                website: 'none',
                phone: 'none',
                querySaved: '99 left',
                resultsSaved: '99 left',
              },
    lastestQueries:[
                    {
                      name:'Full Reports(234)',
                      date: 'July 10,2018 16:48',
                    },
                    {
                      name:'Full Reports(234)',
                      date: 'July 10,2018 16:48',
                    },
                    {
                      name:'Full Reports(234)',
                      date: 'July 10,2018 16:48',
                    },
                    {
                      name:'Full Reports(234)',
                      date: 'July 10,2018 16:48',
                    },
                    {
                      name:'Full Reports(234)',
                      date: 'July 10,2018 16:48',
                    }
                  ],
    SavedQueries:[
                    {
                      name:'IAD-Marchist',
                      date: 'July 10,2018 16:48',
                      desc:'Daily Statistics'
                    }
                  ]
  };




  constructor(public globals: Globals, private menuService: MenuService, private service: WelcomeService, private authService: AuthService, private router: Router) {
  }

  setState(option){

      this.activeElement = option;
  };

  ngOnInit() {
    this.getUserLoggedIn();
  }
  getUserLoggedIn(){
    if (!this.authService.getToken ())
      return;

    this.globals.isLoading = true;
    this.menuService.getUserLoggedin(this, this.handleLogin, this.errorLogin);
  }

  handleLogin(_this,data){
    _this.globals.currentUser = data.name;
    _this.userName = _this.globals.currentUser;
    _this.getApplications();
  }
  errorLogin(_this,result){
    _this.globals.consoleLog(result);
    _this.getApplications();

  }
  ngAfterViewInit() {
  }

  getApplications(){
    this.service.getApplications(this,this.handlerSuccess,this.handlerError);
  }

  handlerSuccess(_this,data){
    _this.options = data;
    _this.options2 = data.slice();

    _this.activeElement = _this.options[0];
    //Cambio temporal------------------------------------------------------
    const indexColumn = _this.options2.findIndex(column => column.id === 2);
    _this.options2.splice(indexColumn,1);
    //---------------------------------------------------------------------
    _this.globals.isLoading = false;
  }

  handlerError(_this,result){
    _this.globals.consoleLog(result);
    _this.globals.isLoading = false;
  }

  goTo(option:any){
    this.globals.currentApplication = option;
    this.globals.clearVariables();
    localStorage.setItem("currentApplication", JSON.stringify(this.globals.currentApplication));
    this.router.navigate([option.url]);
  }

  getDisplay(option : any){
    if(option.hover){
      return "inline-block !important"
    }else{
      return "none !important"
    }

  }

  getBackground(option : any){
    var aux = option.name;
    aux = aux.replace(" ","");
    if(option.hover){
      return "../../assets/images/w_"+aux+"2.png"
    }else{
      return "../../assets/images/w_"+aux+"1.png"
    }

  }


  getBackground2(option : any){
    var aux = option.name;
    aux = aux.replace(" ","");
    return "../../assets/images/w_"+aux+".png"
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event)
  {
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
}
