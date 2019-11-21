import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Globals } from '../globals/Globals';
import { forEach } from '@angular/router/src/utils/collection';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-option-welcome',
  templateUrl: './option-welcome.component.html',
  styleUrls: ['./option-welcome.component.css']
})
export class OptionWelcomeComponent implements OnInit {
    
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  
  constructor(public globals : Globals, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {

    this.mobileQuery = media.matchMedia('(max-width: 480px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
   }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  
  welcome :any;
  items :any = [];
  dataSource :any = [];
  output :any = [];
  columns  = [{columnName:"label",columnLabel:"Name"},
  {columnName:"description",columnLabel:"Description"},
  {columnName:"keyControl",columnLabel:"Key Control Variables (*Required)"},
  {columnName:"outputs",columnLabel:"Output Tables"}];

  displayedColumns = ["label","description","keyControl","outputs"];


  ngOnInit() {
  }
 
  formatItem(text :string){
    var aux ="";
    if(text.substring(0, 1)=="ñ"){
      aux = text.replace("ñ", "");
    }else if(text.substring(0, 1)=="&"){
      aux = text.replace("&", "");
    }else{
      aux = text;
    }
    return aux;
  }

  classItem(text :string){
    if(text.substring(0, 1)=="ñ"){
      return  "mat-list-item msf-ident ng-star-inserted";
    }if(text.substring(0, 1)=="&"){
      return  "mat-list-item msf-low-bold ng-star-inserted";
    }else{
      return  "mat-list-item ng-star-inserted"
    }
  }
  
}
