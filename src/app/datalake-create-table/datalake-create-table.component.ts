import { Component } from '@angular/core';
import { MatDialogRef, MatStepper } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-datalake-create-table',
  templateUrl: './datalake-create-table.component.html'
})
export class DatalakeCreateTableComponent {
  newStep1FormGroup: FormGroup;
  newStep2FormGroup: FormGroup;
  newStep3FormGroup: FormGroup;
  newStep4FormGroup: FormGroup;
  uploadStep1FormGroup: FormGroup;
  uploadStep2FormGroup: FormGroup;
  uploadStep3FormGroup: FormGroup;

  constructor(public dialogRef: MatDialogRef<DatalakeCreateTableComponent>,
    private formBuilder: FormBuilder)
  {
    this.newStep1FormGroup = this.formBuilder.group ({
      firstCtrl: ['']
    });
    this.newStep2FormGroup = this.formBuilder.group ({
      secondCtrl: ['']
    });
    this.newStep3FormGroup = this.formBuilder.group ({
      secondCtrl: ['']
    });
    this.newStep4FormGroup = this.formBuilder.group ({
      secondCtrl: ['', Validators.required]
    });

    this.uploadStep1FormGroup = this.formBuilder.group ({
      secondCtrl: ['']
    });
    this.uploadStep2FormGroup = this.formBuilder.group ({
      secondCtrl: ['']
    });
    this.uploadStep3FormGroup = this.formBuilder.group ({
      secondCtrl: ['', Validators.required]
    });
  }

  onNoClick(): void
  {
    this.dialogRef.close ();
  }

  goBack(stepper: MatStepper): void
  {
    stepper.previous ();
  }

  goForward(stepper: MatStepper): void
  {
    stepper.next ();
  }
}
