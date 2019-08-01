import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-menu-mobile-recursivo',
  templateUrl: './menu-mobile-recursivo.component.html',
  styleUrls: ['./menu-mobile-recursivo.component.css']
})
export class MenuMobileRecursivoComponent implements OnInit {
  @Input("menu")
  option: any;

  constructor() { }

  ngOnInit() {
  }

}
