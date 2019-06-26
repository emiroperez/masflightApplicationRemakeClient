import { Component } from '@angular/core';

import { routerTransition } from './animations/animations';
import { Globals } from './globals/Globals';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [routerTransition]
})

export class AppComponent {
  constructor (public globals: Globals)
  {    
  }
}
