import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-date-restriction-dialog',
  templateUrl: './date-restriction-dialog.component.html'
})
export class DateRestrictionDialogComponent {

  minDate: Date;
  maxDate: Date;
  isLoading: boolean = false;
  restricted: boolean = false;
  id: number;

  constructor (public dialogRef: MatDialogRef<DateRestrictionDialogComponent>,
    public globals: Globals,
    public dialog: MatDialog,
    private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.isLoading = true;
    this.service.getDateRestriction2 (this, this.data.selectedCustomer.id, this.getSuccess, this.getError);
  }

  closeDialog(): void
  {
    this.dialogRef.close ();
  }

  closeDialogAndSave(): void
  {
    this.dialogRef.close ({
      id: this.id,
      customer: this.data.selectedCustomer,
      startDate: this.minDate ? this.minDate.toString () : null,
      endDate: this.maxDate ? this.maxDate.toString () : null,
      restricted: this.restricted
    })
  }

  clearDateRange(): void
  {
    this.minDate = null;
    this.maxDate = null;
  }

  getSuccess(_this, data): void
  {
    if (!data)
    {
      _this.isLoading = false;
      return;
    }

    _this.isLoading = false;

    _this.id = data.id;

    if (data.startDate)
      _this.minDate = new Date (data.startDate);

    if (data.endDate)
      _this.maxDate = new Date (data.endDate);

    if (_this.minDate || _this.maxDate)
      _this.restricted = true;
  }

  getError(_this): void
  {
    _this.isLoading = false;
  }
}
