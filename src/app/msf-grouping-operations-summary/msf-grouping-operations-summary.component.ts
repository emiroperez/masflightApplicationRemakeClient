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
                      {id: 'AUTO', columnLabel: 'Auto', columnName:'Auto'},
                      {id: 'YEAR', columnLabel: 'Year', columnName:'Year'},
                      {id: 'MONTH', columnLabel: 'Month', columnName:'Month'},
                      {id: 'DAY', columnLabel: 'Day' ,columnName:'Day'},
                      {id: 'HOUR', columnLabel: 'Hour', columnName: 'Hour'},
                      {id: 'QUARTERHOUR', columnLabel: 'Quarter Hour',columnName:'Quarter Hour'}
  ];
  constructor() { }


  ngOnInit() { 
    this.argument.value1= {id: 'AUTO', columnLabel: 'Auto', columnName:'Auto'};
  }

}
