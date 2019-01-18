import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-sorting',
  templateUrl: './msf-sorting.component.html',
  styleUrls: ['./msf-sorting.component.css']
})
export class MsfSortingComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 

  sortingList: any[] = [
                          {id: 'YEAR', name: 'Year', column:'Year'},
                          {id: 'MONTH', name: 'Month', column:'Month'},
                          {id: 'DAY', name: 'Day' ,column:'Date'},
                          {id: 'HOUR', name: 'Hour', column: 'Hour'},
                          {id: 'EQUIPMENTTYPESPECIFIC', name: 'Specific Equipment Type',column:'EspecificEquipmentType'},
                          {id: 'EQUIPMENTTYPEGENERAL', name: 'General Equipment Type',column:'GeneralEquipmentType'},
                          {id: 'OPERATINGAIRLINE', name: 'Operating Airline',column:'OperatingAirline'},                          
                          {id: 'ORIGINAIRPORT', name: 'Origin Airport',column:'Origin'},
                          {id: 'DESTINATIONAIRPORT', name: 'Destination Airport',column:'Destination'},
                          {id: 'FLIGHTNUMBER', name: 'Flight Number',column:'FlightNumber'},
                          {id: 'MARKETINGAIRLINE', name: 'Marketing Airline',column:'Marketing_Carrier'},
                          {id: 'ROUTE', name: 'Route',column:'Route'}
                        ];

  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() { 
  }


}
