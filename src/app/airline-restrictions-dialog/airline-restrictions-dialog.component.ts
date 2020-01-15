import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

import { Globals } from '../globals/Globals';
import { Airline } from '../model/Airline';
import { ApiClient } from '../api/api-client';

@Component({
  selector: 'app-airline-restrictions-dialog',
  templateUrl: './airline-restrictions-dialog.component.html'
})
export class AirlineRestrictionsDialogComponent {
  selectedAirlines: Airline[] = [];
  airlineListLoading: boolean = false;
  isLoading: boolean = false;
  airlines: Observable<any[]>;

  constructor (public dialogRef: MatDialogRef<AirlineRestrictionsDialogComponent>,
    public globals: Globals,
    public dialog: MatDialog,
    private http: ApiClient,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.isLoading = true;
    this.getRecords (null, this.handlerSuccess);
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  onSearch($event: any): void
  {
    if ($event.term.length >= 2)
    {
      this.airlineListLoading = true;
      this.getRecords ($event.term, this.handlerSearchSuccess);
    }
  }

  getRecords(search, handlerSuccess): void
  {
    let url = this.globals.baseUrl + "/getAirlines?search=" + (search != null ? search : '');  
    this.http.get (this, url, handlerSuccess, this.handlerError, null);
  }

  handlerSuccess(_this, data, tab): void
  {
    _this.airlines = of (data).pipe (delay (500));
    _this.isLoading = false;
  }

  handlerSearchSuccess(_this, data, tab): void
  {
    _this.airlineListLoading = false;
    _this.airlines = of (data).pipe (delay (500));
  }

  handlerError(_this, result)
  {
    _this.airlineListLoading = false;
    _this.isLoading = false;
  }
}
