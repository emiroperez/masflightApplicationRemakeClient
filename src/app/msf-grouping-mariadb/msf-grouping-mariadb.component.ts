import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-grouping-mariadb',
  templateUrl: './msf-grouping-mariadb.component.html',
  styleUrls: ['./msf-grouping-mariadb.component.css']
})
export class MsfGroupingMariadbComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  
  groupingList: any[] = [
    {id: 'seat', columnLabel: 'Seat Number', columnName:'seat'},
    {id: 'aircraft_tail', columnLabel: 'Aircraft Tail', columnName:'aircraft_tail'},
    {id: 'date', columnLabel: 'Day', columnName:'date'},
    {id: 'content_type', columnLabel: 'Content Type', columnName:'content_type'},
    {id: 'seat_class', columnLabel: 'Seat Class', columnName:'seat_class'},
];
  
  constructor() { }


  ngOnInit() {
  }

}
