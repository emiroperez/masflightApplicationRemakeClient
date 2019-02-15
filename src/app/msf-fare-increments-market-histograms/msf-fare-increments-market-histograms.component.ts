import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-fare-increments-market-histograms',
  templateUrl: './msf-fare-increments-market-histograms.component.html',
  styleUrls: ['./msf-fare-increments-market-histograms.component.css']
})
export class MsfFareIncrementsMarketHistogramsComponent implements OnInit {

 
  @Input("argument") public argument: Arguments;
 
  increments: any[] = [
                {id: '1', name: '$1'},
                {id: '5', name: '$5'},
                {id: '10', name: '$10'},
                {id: '20', name: '$20'},
                {id: '25', name: '$25'},
                {id: '50', name: '$50'},
                {id: '100', name: '$100'},
                {id: '250', name: '$250'},
                {id: '500', name: '$500'},
  ];
  constructor() { }


  ngOnInit() { 
    this.argument.value1 = {id: '25', name: '$25'};
  }


}
