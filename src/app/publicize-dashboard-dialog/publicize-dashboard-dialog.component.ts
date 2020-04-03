import { Component, Inject } from '@angular/core';
import { MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
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
  today: Date = new Date ();

  publicForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<PublicizeDashboardDialogComponent>,
    private services: ApplicationService, public globals: Globals, public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.publicForm = new FormGroup ({
      nameValidator: new FormControl ('', [Validators.required, PublicizeDashboardDialogComponent.spaceValidator (this)])
    });

    if (this.data)
    {
      this.publicDashboardInfo.id = this.data.publicDashboardInfo.id;
      this.publicDashboardInfo.name = this.data.publicDashboardInfo.name;
      this.publicDashboardInfo.expirationDate = this.data.publicDashboardInfo.expirationDate;

      this.publicForm.get ('nameValidator').setValue (this.publicDashboardInfo.name);

      if (this.publicDashboardInfo.expirationDate)
        this.expirable = true;
    }
    else
    {
      this.publicDashboardInfo.id = null;
      this.publicDashboardInfo.name = "";
      this.publicDashboardInfo.expirationDate = null;
    }

    this.publicForm.get ('nameValidator').valueChanges.subscribe (value =>
    {
      this.checkPublicDashboardName (value);
    });
  }

  clearExpirationDate(): void
  {
    this.publicDashboardInfo.expirationDate = null;
  }

  parseDate(date): string
  {
    let day, month;
    let d: Date;

    if (date == null)
      return "";

    d = new Date(date);
    if (Object.prototype.toString.call(d) === "[object Date]")
    {
      if (isNaN(d.getTime()))
        return "";
    }
    else
      return "";

    month = (d.getMonth() + 1);
    if (month < 10)
      month = "0" + month;

    day = d.getDate();
    if (day < 10)
      day = "0" + day;

    return d.getFullYear() + "-" + month + "-" + day;
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
      this.publicDashboardInfo.expirationDate = this.parseDate (this.publicDashboardInfo.expirationDate);

    this.dialogRef.close ({ delete: false, info: this.publicDashboardInfo });
  }

  checkPublicDashboardName(name): void
  {
    this.services.checkPublicDashboardName (this, name, this.checkNameResponse, this.checkNameError);
  }

  checkNameResponse(_this, data): void
  {
    let nameValidator = _this.publicForm.get ("nameValidator");

    if (data)
    {
      if (!(_this.data.publicDashboardInfo && _this.data.publicDashboardInfo.id == data))
      {
        if (nameValidator.hasError ('hasSpaces'))
          nameValidator.setErrors ({ hasSpaces: nameValidator.hasError ('hasSpaces'), exists: true });
        else if (nameValidator.hasError ('required'))
          nameValidator.setErrors ({ required: nameValidator.hasError ('required'), exists: true });
        else
          nameValidator.setErrors ({ exists: true });

        return;
      }
    }

    if (nameValidator.hasError ('hasSpaces'))
      nameValidator.setErrors ({ hasSpaces: nameValidator.hasError ('hasSpaces'), exists: null });
    else if (nameValidator.hasError ('required'))
      nameValidator.setErrors ({ required: nameValidator.hasError ('required'), exists: null });
    else
      nameValidator.setErrors (null);
  }

  checkNameError(_this): void
  {
  }

  getNameErrorMessage(): string
  {
    if (this.publicForm.get ('nameValidator').hasError ('hasSpaces'))
      return 'The name must not have any spaces';
    else if (this.publicForm.get ('nameValidator').hasError ('exists'))
      return 'This dashboard name is already in use';

    return this.publicForm.get ('nameValidator').hasError ('required') ? 'The name must not be empty' : '';
  }

  removePublicDashboard(): void
  {
    this.services.confirmationDialog (this, "Are you sure you want to remove the public dashboard?",
      function (_this)
      {
        _this.publicDashboardInfo.id = null;
        _this.dialogRef.close ({ delete: true, info: _this.publicDashboardInfo });
      }
    );
  }

  static spaceValidator(comp: PublicizeDashboardDialogComponent): ValidatorFn
  {
    return (control: AbstractControl): ValidationErrors => {
      if (comp.publicForm == undefined)
        return null;

      let nameValidator = comp.publicForm.get ('nameValidator');
      let name: string = nameValidator.value;

      if (name != null && name != "" && /\s/g.test(name))
        return { hasSpaces: true };

      return null;
    };
  }
}
