import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-grouping-comp-genre',
  templateUrl: './msf-grouping-comp-genre.component.html',
  styleUrls: ['./msf-grouping-comp-genre.component.css']
})
export class MsfGroupingCompGenreComponent implements OnInit {

  @Input("argument") public argument: Arguments;

  @Input("isDashboardPanel")
  isDashboardPanel: boolean = false;

  @Output("startURLUpdate")
  startURLUpdate = new EventEmitter ();

  groupingList: any[] = [
    {id: 'world_region', columnLabel: 'World Region', columnName:'world_region'},
    {id: 'month', columnLabel: 'Month', columnName:'month'},
    {id: 'genre', columnLabel: 'Genre', columnName:'genre'},
    {id: 'date', columnLabel: 'Date', columnName:'date'}
];
  
  constructor() { }


  ngOnInit() {
  }
}
