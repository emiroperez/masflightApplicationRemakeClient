import { Component, OnInit, Input } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-flight-duration-segments',
  templateUrl: './msf-flight-duration-segments.component.html',
  styleUrls: ['./msf-flight-duration-segments.component.css']
})
export class MsfFlightDurationSegmentsComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 
  data: any[] = [
                {id: '2-5', name: '2-5 hours'},
                {id: '5-10', name: '5-10 hours'},
                {id: '10-n', name: 'Above 10 hours'},
                {id: '0-2', name: 'Less than 2 hours'},
  ];
  constructor(private http: ApiClient, public globals: Globals) { }


  ngOnInit() {
  }

}
