import { Component } from '@angular/core';

@Component({
  selector: 'app-msf-partial-summaries',
  templateUrl: './msf-partial-summaries.component.html'
})
export class MsfPartialSummariesComponent {
  colBreakers: any[] = [];
  colAggregators: any[] = [];

  constructor() { }

  addColumnBreaker(): void
  {
    this.colBreakers.push ("foobar");
  }

  addColumnAggregator(): void
  {
    this.colAggregators.push ("foobar");
  }
}
