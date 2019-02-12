import { Component, OnInit, Input } from '@angular/core';
import { Arguments } from '../model/Arguments';

@Component({
  selector: 'app-msf-grouping-operations-summary',
  templateUrl: './msf-grouping-operations-summary.component.html',
  styleUrls: ['./msf-grouping-operations-summary.component.css']
})
export class MsfGroupingOperationsSummaryComponent implements OnInit {

  @Input("argument") public argument: Arguments;
 
  groupingList: any[] = [
                      {id: 'AUTO', name: 'Auto', column:'Auto'},
                      {id: 'YEAR', name: 'Year', column:'Year'},
                      {id: 'MONTH', name: 'Month', column:'Month'},
                      {id: 'DAY', name: 'Day' ,column:'Day'},
                      {id: 'HOUR', name: 'Hour', column: 'Hour'},
                      {id: 'QUARTERHOUR', name: 'Quarter Hour',column:'Quarter Hour'}
  ];
  constructor() { }


  ngOnInit() { 
    this.argument.value1= {id: 'AUTO', name: 'Auto', column:'Auto'};
  }

}
