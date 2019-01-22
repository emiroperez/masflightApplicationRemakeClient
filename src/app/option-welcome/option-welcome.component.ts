import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals/Globals';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-option-welcome',
  templateUrl: './option-welcome.component.html',
  styleUrls: ['./option-welcome.component.css']
})
export class OptionWelcomeComponent implements OnInit {

  constructor(public globals : Globals) { }

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
 
}
