import { Component, OnInit, Input } from '@angular/core';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-results-less',
  templateUrl: './msf-results-less.component.html',
  styleUrls: ['./msf-results-less.component.css']
})
export class MsfResultsLessComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 
  data: any[] = [
                {id: '1', name: '1%'},
                {id: '2', name: '2%'},
                {id: '3', name: '3%' },
                {id: '4', name: '4%'},
                {id: '5', name: '5%'},
                {id: '10', name: '10%'},
                {id: '15', name: '15%'},                          
                {id: '20', name: '20%'},
                {id: '25', name: '25%'},
                {id: '50', name: '50%'}
  ];
  constructor(public globals: Globals) { }


  ngOnInit() { 
    if(!this.argument.value1){
    this.argument.value1 = {id: '1', name: '1%'};
    }
  }


}
