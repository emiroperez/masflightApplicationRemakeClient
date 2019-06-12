import { Component, OnInit } from '@angular/core';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-map-coordinates',
  templateUrl: './msf-map-coordinates.component.html'
})
export class MsfMapCoordinatesComponent implements OnInit
{
  constructor (public globals : Globals)
  {
  }

  ngOnInit ()
  {
  }
}
