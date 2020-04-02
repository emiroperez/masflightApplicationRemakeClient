import { Component } from '@angular/core';
import { MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';
import { MessageComponent } from '../message/message.component';

export const US_DATE_FORMAT = {
  parse: {
    dateInput: 'MM/DD/YYYY',
  },
  display: {
    dateInput: 'MM/DD/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-publicize-dashboard-dialog',
  templateUrl: './publicize-dashboard-dialog.component.html',
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: US_DATE_FORMAT },
  ]
})
export class PublicizeDashboardDialogComponent
{
  publicDashboardInfo: any = {};
  expirable: boolean = false;

  publicForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<PublicizeDashboardDialogComponent>,
    private services: ApplicationService, public globals: Globals, public dialog: MatDialog)
  {
    this.publicForm = new FormGroup ({
      nameValidator: new FormControl ('', [Validators.required, PublicizeDashboardDialogComponent.spaceValidator (this)])
    });

    this.publicDashboardInfo.id = null;
    this.publicDashboardInfo.name = "";
    this.publicDashboardInfo.expirationDate = null;
  }

  setDashboardToPublic(): void
  {
    this.dialogRef.close (this.publicDashboardInfo);
  }

  clearExpirationDate(): void
  {
    this.publicDashboardInfo.expirationDate = null;
  }

  confirmChanges(value: boolean): void
  {
    if (!value)
    {
      this.dialogRef.close (null);
      return;
    }

    // validate before proceeding
    Object.keys (this.publicForm.controls).forEach (field => {
      this.publicForm.get (field).markAsTouched ({ onlySelf: true });
    });

    if (this.publicForm.invalid || this.expirable && !this.publicDashboardInfo.expirationDate)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "Cannot publicize the dashboard, please correct the error before proceeding." }
      });

      return;
    }

    this.publicDashboardInfo.name = this.publicForm.get ('nameValidator').value;

    if (this.publicDashboardInfo)
      this.publicDashboardInfo.expirationDate = this.publicDashboardInfo.expirationDate.toString ();

    this.dialogRef.close (this.publicDashboardInfo);
  }

  checkPublicDashboardName(name): void
  {
    this.services.checkPublicDashboardName (this, name, this.checkNameResponse, this.checkNameError);
  }

  checkNameResponse(_this, data): void
  {
    if (data)
      _this.publicForm.get ("nameValidator").setErrors ({ exists: data });
    else
      _this.publicForm.get ("nameValidator").setErrors (null);
  }

  checkNameError(_this): void
  {
  }

  getNameErrorMessage(): string
  {
    if (this.publicForm.get('nameValidator').hasError ('hasSpaces'))
      return 'The name must not have any spaces';
    else if (this.publicForm.get('nameValidator').hasError ('exists'))
      return 'This dashboard name is already in use';

    return this.publicForm.get ('nameValidator').hasError ('required') ? 'The name must not be empty' : '';
  }

  static spaceValidator(comp: PublicizeDashboardDialogComponent): ValidatorFn
  {
    return (control: AbstractControl): ValidationErrors => {
      if (comp.publicForm == undefined)
        return null;

      let name: string = comp.publicForm.get ('nameValidator').value;

      if (name != null && name != "" && /\s/g.test (name))
        return { hasSpaces: true };
      else
        return null;
    };
  }
}
