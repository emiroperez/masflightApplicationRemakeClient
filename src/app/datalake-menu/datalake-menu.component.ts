import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-datalake-menu',
  templateUrl: './datalake-menu.component.html'
})
export class DatalakeMenuComponent implements OnInit {
  @Output('setOption')
  setOption = new EventEmitter ();

  constructor() { }

  ngOnInit() {
  }
}
