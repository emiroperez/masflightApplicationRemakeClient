import { Component, OnInit, HostListener } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApplicationService } from '../services/application.service';
import { delay } from 'rxjs/operators';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-test',
  templateUrl: './msf-test.component.html'
})
export class MsfTestComponent implements OnInit {

  airports: Observable<any[]>;

  selectedAirport;
  
  loading = false;

  constructor(private services: ApplicationService, private http: ApiClient, private globals: Globals) { }

  ngOnInit() {

     this.getAirports(null, this.handlerSuccess);

  }

  getAirports(search, handlerSuccess){
    this.loading = true;
    let url = 'http://localhost:8887/getAirports?search='+ (search != null?search:'');
    //let url = '/getAirports?search='+ (search != null?search:'');
    this.http.get(this,url,handlerSuccess,this.handlerError, null);        
  }


  handlerSuccess(_this,data, tab){   
    _this.airports = of(data).pipe(delay(500)); 
    _this.loading = false;  
  }


  handlerError(_this,result){
    _this.loading = false; 
    console.log(result);
  }


  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
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
