import { Component, OnInit, Inject, ViewChild, Input, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator } from '@angular/material';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { Globals } from '../globals/Globals';
import { DatalakeService } from '../services/datalake.service';

@Component({
  selector: 'app-datalake-query-engine-history',
  templateUrl: './datalake-query-engine-history.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DatalakeQueryEngineHistoryComponent implements OnInit {
  
  innerHeight: number;

  historyTable: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;
  historyColumns: string[] = ['ExecutionId', 'Query','ExecutionStatus', 'Schema', 'Timestamp', 'Name','actions'];
  expandedElement: any | null;

  constructor(public dialogRef: MatDialogRef<DatalakeQueryEngineHistoryComponent>,
    public globals: Globals, private service: DatalakeService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  { }

  data2= [{"ExecutionId":"21","Query":"select * from resourcedata limit 10\t","ExecutionStatus":"","Schema":"pruebaperformancepq","Timestamp":"2019-10-23 19:02:01","Name":"Prueba"},
  {"ExecutionId":"22","Query":"select * from resourcedata limit 10\t","ExecutionStatus":"","Schema":"pruebaperformancepq","Timestamp":"2019-10-23 20:28:13","Name":"Prueba2"},
  {"ExecutionId":"23","Query":"SELECT V.C_EMP, V.NOMBRE, 'A ' || TO_CHAR(TO_DATE(?, 'YYYYMM'), 'MON') || ' ' ||SUBSTR(V.PER,0,4) periodo, V.VENTAS, ROUND(V.VENTAS/R.VENTAS*100,2) PORCENTAJE FROM VENTAS_ACUM_LINEA V JOIN ( SELECT A.C_EMP, 'TOTAL', 'A ' || TO_CHAR(TO_DATE(?, 'YYYYMM'), 'MON') || ' ' ||SUBSTR(A.PER_CT,0,4) periodo, sUM(A.VENTAS) VENTAS, 100 PORCENTAJE FROM VENTA_ALL_PERIODOS A WHERE SUBSTR(A.PER_CT,0,4) = SUBSTR(?,0,4) OR SUBSTR(A.PER_CT,0,4) = SUBSTR(?,0,4) - 1 GROUP BY A.C_EMP, 'TOTAL', 'A ' || TO_CHAR(TO_DATE(?, 'YYYYMM'), 'MON') || ' ' ||SUBSTR(A.PER_CT,0,4)) R ON R.PERIODO = 'A ' || TO_CHAR(TO_DATE(?, 'YYYYMM'), 'MON') || ' ' ||SUBSTR(V.PER,0,4) WHERE V.PER = ? OR V.PER = TO_CHAR(TO_DATE(?, 'YYYYMM') - 365, 'YYYYMM')","ExecutionStatus":"","Schema":"pruebaperformancepq","Timestamp":"2019-10-25 13:20:10","Name":"Prueba3"},
  {"ExecutionId":"24","Query":"select * from  fr24p.fradar24_r limit 3","ExecutionStatus":"","Schema":"pruebaperformancepq","Timestamp":"2019-10-25 19:52:45","Name":"testSave"},
  {"ExecutionId":"25","Query":"select * from  fr24p.fradar24_r limit 3","ExecutionStatus":"","Schema":"pruebaperformancepq","Timestamp":"2019-10-25 19:54:20","Name":"testSave"}]
  ngOnInit() {
    this.innerHeight = window.innerHeight;
    // this.historyTable = new MatTableDataSource (this.data2);
    this.historyTable = new MatTableDataSource (this.data);
    this.historyTable.paginator = this.paginator;
  }

  
  getTableHeight(): string
  {
    return "calc(" + this.innerHeight + "px - 18.5em)";
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.innerHeight = event.target.innerHeight;
  }

  runQuery(query){
    this.globals.selectedSchema.input = query.Query;
    this.globals.selectedSchema.schema = query.Schema;
    this.dialogRef.close (true);
 
  }

  copyQuery(val: string){
    let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = val;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
    }

    
  onNoClick(): void
  {
      this.dialogRef.close ();
  }
}
