import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

import { Globals } from '../globals/Globals';
import { Airline } from '../model/Airline';
import { ApiClient } from '../api/api-client';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-airline-restrictions-dialog',
  templateUrl: './airline-restrictions-dialog.component.html'
})
export class AirlineRestrictionsDialogComponent {
  restrictList: any[] = [];
  selectedAirlines: Airline[] = [];
  selectedRestrictedAirline: any;
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
    this.getRecords (null, this.recordSuccess);
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

  getAirlineRestrictionList(): void
  {
    let url = this.globals.baseUrl + "/getAirlineRestriction?customerId=" + this.data.selectedCustomer.id;  
    this.http.get (this, url, this.handlerSuccess, this.handlerError, null);    
  }

  getRecords(search, handlerSuccess): void
  {
    let url = this.globals.baseUrl + "/getAirlines?search=" + (search != null ? search : '');  
    this.http.get (this, url, handlerSuccess, this.handlerError, null);
  }

  recordSuccess(_this, data): void
  {
    _this.airlines = of (data).pipe (delay (500));
    _this.getAirlineRestrictionList ();
  }

  handlerSuccess(_this, data): void
  {
    _this.restrictList = data;
    _this.isLoading = false;
  }

  handlerSearchSuccess(_this, data): void
  {
    _this.airlineListLoading = false;
    _this.airlines = of (data).pipe (delay (500));
  }

  handlerError(_this, result)
  {
    _this.airlineListLoading = false;
    _this.isLoading = false;
  }

  addAirlines(): void
  {
    let url = this.globals.baseUrl + "/addNewAirlineRestrictions";
    let newItems = [];

    for (let item of this.selectedAirlines)
    {
      newItems.push ({
        customer: {
          id: this.data.selectedCustomer.id
        },
        airlineIata: item.iata,
        airlineName: item.name
      });
    }

    this.isLoading = true;

    this.selectedAirlines = []; // clear selected airlines
    this.http.post (this, url, newItems, this.reloadList, this.addError);
    this.selectedRestrictedAirline = null;
  }

  reloadList(_this): void
  {
    _this.restrictList = [];
    _this.getAirlineRestrictionList ();
  }

  addError(_this): void
  {
    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to add new airlines to restrict." }
    });

    _this.isLoading = false;
  }

  removeAirline(): void
  {
    let url = this.globals.baseUrl + "/removeAirlineRestriction?customerId=" + this.data.selectedCustomer.id
      + "&airlineIata=" + this.selectedRestrictedAirline.airlineIata;
  
    this.isLoading = true;
    this.http.get (this, url, this.removeSuccess, this.removeError, null);
  }

  removeSuccess(_this): void
  {
    _this.restrictList.splice (_this.restrictList.indexOf (_this.selectedRestrictedAirline), 1);
    _this.selectedRestrictedAirline = null;
    _this.isLoading = false;
  }

  removeError(_this): void
  {
    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to airline." }
    });

    _this.isLoading = false;
  }
}
