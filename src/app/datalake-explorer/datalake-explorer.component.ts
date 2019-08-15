import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-datalake-explorer',
  templateUrl: './datalake-explorer.component.html'
})
export class DatalakeExplorerComponent implements OnInit {

  tablecards: any[] = [];

  constructor() { }

  ngOnInit() {
  }

  addTableCard(): void
  {
    this.tablecards.push ({ test: "test" });
  }
}
