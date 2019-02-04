import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-percent-increment',
  templateUrl: './msf-percent-increment.component.html',
  styleUrls: ['./msf-percent-increment.component.css']
})
export class MsfPercentIncrementComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 
  data: any[] = [
                {id: '1', name: '1%'},
                {id: '2', name: '2%'},
                {id: '2.5', name: '2.5%' },
                {id: '4', name: '4%'},
                {id: '5', name: '5%'},
                {id: '10', name: '10%'},                          
                {id: '20', name: '20%'},
                {id: '25', name: '25%'},
                {id: '33.3', name: '33.3%'},
                {id: '50', name: '50%'}
  ];
  constructor() { }


  ngOnInit() { 
    this.argument.value1 = {id: '1', name: '1%'};
  }

}
