import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-seats',
  templateUrl: './msf-seats.component.html',
  styleUrls: ['./msf-seats.component.css']
})
export class MsfSeatsComponent implements OnInit {

  @Input("argument") public argument: Arguments;
  constructor() { }

  ngOnInit() {
    if(!this.argument.value1 && !this.argument.value2){
    this.argument.value1 = 0;
    this.argument.value2 = 600;
  }
}

}
