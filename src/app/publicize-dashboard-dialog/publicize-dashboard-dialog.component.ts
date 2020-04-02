import { Component } from '@angular/core';
import { MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

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

  constructor(public dialogRef: MatDialogRef<PublicizeDashboardDialogComponent>)
  {
    this.publicForm = new FormGroup ({
      nameValidator: new FormControl ('', [Validators.required, PublicizeDashboardDialogComponent.spaceValidator (this)])
    });

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

    this.dialogRef.close (this.publicDashboardInfo);
  }

  getNameErrorMessage(): string
  {
    if (this.publicForm.get('nameValidator').hasError ('hasSpaces'))
      return 'The name must not have any spaces';

    return this.publicForm.get ('nameValidator').hasError ('required') ? 'The name must not be empty' : '';
  }

  static spaceValidator(comp: PublicizeDashboardDialogComponent): ValidatorFn
  {
    return (control: AbstractControl): ValidationErrors => {
      if (comp.publicForm == undefined)
        return null;

      let name: string = comp.publicForm.get ('nameValidator').value;

      if (name != null && name != "" && /^\s*$/.test (name))
        return { hasSpaces: true };
      else
        return null;
    };
  }
}
