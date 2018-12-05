import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { Utils } from '../commons/utils';

@Component({
  selector: 'app-current-query-summary',
  templateUrl: './current-query-summary.component.html',
  styleUrls: ['./current-query-summary.component.css']
})
export class CurrentQuerySummaryComponent implements OnInit {

  open: boolean = false;

  argsBefore: any;
  iconBefore: any;

  constructor(public utils: Utils, public globals: Globals) {

   }

  ngOnInit() {
  }


  componentClickHandler(argsContainer, icon){
    if(this.argsBefore){
      this.argsBefore.open = false;
      this.iconBefore.innerText ="expand_more";
    }    
    if(!this.open || (this.open && (this.argsBefore !==argsContainer))){
      argsContainer.open = true;
      icon.innerText ="expand_less";
      this.open = true;
    }else{
      argsContainer.open = false;
      icon.innerText ="expand_more";
      this.open = false;
    }    
    this.globals.currentAgts = argsContainer;
    this.iconBefore = icon;
    this.argsBefore = argsContainer;
  }
  

}
