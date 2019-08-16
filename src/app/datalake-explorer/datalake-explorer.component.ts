import { Component, OnInit } from '@angular/core';
import { DatalakeTableCardValues } from '../datalake-table-card/datalake-table-card-values';

@Component({
  selector: 'app-datalake-explorer',
  templateUrl: './datalake-explorer.component.html'
})
export class DatalakeExplorerComponent implements OnInit {

  tablecards: DatalakeTableCardValues[] = [
    {
      tableName: "fradar24_r",
      descr: "Flight Radar24 Tracking table",
      bucketName: "fradar24-r",
      schemaName: "fr24p",
      longName: "Flight Radar24 Tracking"
    },
    {
        tableName: "unified_tracking_detail_pq",
        descr: "American Airlines Unified Tracking Detail",
        bucketName: "unified-tracking-detail-pq",
        schemaName: "pruebaperformancepq",
        longName: "American Airlines Unified"
    },
    {
        tableName: "unified_tracking_master_pq",
        descr: "American Airlines Unified Tracking Detail",
        bucketName: "unified-tracking-master-pq",
        schemaName: "pruebaperformancepq",
        longName: "American Airlines Tracking"
    },
    {
        tableName: "prueba",
        descr: "Prueba de creación de tabla por Luis Fontalvo",
        bucketName: "csv-luis",
        schemaName: "pruebaperformancepq",
        longName: "Prueba Creación"
    },
    {
        tableName: "table20190409",
        descr: "table201904091059 description",
        bucketName: "csv-luis",
        schemaName: "pruebaperformancepq",
        longName: "table201904091059"
    },
    {
        tableName: "personas",
        descr: "datos de algunas personas gee",
        bucketName: "csv-luis",
        schemaName: "pruebaperformancepq",
        longName: "personas gee"
    },
    {
        tableName: "transactions4",
        descr: "transactions travel date project",
        bucketName: "tmp-luis-json-raw-pq",
        schemaName: "pruebaperformancepq",
        longName: "transactions2 travel data"
    },
    {
        tableName: "empleados",
        descr: "lista empleados",
        bucketName: "csv-luis",
        schemaName: "pruebaperformancepq",
        longName: "empleados"
    },
    {
        tableName: "personas2",
        descr: "personas2",
        bucketName: "csv-luis",
        schemaName: "pruebaperformancepq",
        longName: "personas2"
    },
    {
        tableName: "aaaa",
        descr: "aaaa",
        bucketName: "csv-luis",
        schemaName: "pruebaperformancepq",
        longName: "aaaa"
    },
    {
        tableName: "resourcedata",
        descr: "resourcedata",
        bucketName: "csv-luis",
        schemaName: "pruebaperformancepq",
        longName: "resourcedata"
    },
    {
        tableName: "asda",
        descr: "asdasd",
        bucketName: "csv-luis",
        schemaName: "pruebaperformancepq",
        longName: "adsfasd"
    }
  ];

  constructor() { }

  ngOnInit() {
  }

  addTableCard(): void
  {
    this.tablecards.push (new DatalakeTableCardValues ("fradar24_r",
      "Flight Radar24 Tracking table", "fradar24-r", "fr24p", "Flight Radar24 Tracking"));
  }
}
