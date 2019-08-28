import { Component } from '@angular/core';
import { MatDialogRef, MatStepper } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

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
    // initialize all form groups
    this.newStep1FormGroup = this.formBuilder.group ({
      tableName: ['', Validators.required],
      tableLongName: ['', Validators.required],
      schema: ['', Validators.required],
      bucket: new FormControl ({ value: '', disabled: true }, Validators.required),
      tableDescription: new FormControl ({ value: '', disabled: true }),
      fileLocation: ['', Validators.required]
    });

    this.newStep2FormGroup = this.formBuilder.group ({
      step2Ctrl: ['']
    });

    this.newStep3FormGroup = this.formBuilder.group ({
      step3Ctrl: ['']
    });

    this.newStep4FormGroup = this.formBuilder.group ({
      step4Ctrl: ['', Validators.required]
    });

    this.uploadStep1FormGroup = this.formBuilder.group ({
      schema: ['', Validators.required],
      bucket: new FormControl ({ value: '', disabled: true }, Validators.required),
      tableDescription: new FormControl ({ value: '', disabled: true }),
      fileLocation: ['', Validators.required]
    });

    this.uploadStep2FormGroup = this.formBuilder.group ({
      step2Ctrl: ['']
    });

    this.uploadStep3FormGroup = this.formBuilder.group ({
      step3Ctrl: ['', Validators.required]
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

  schemaChanged(formGroup: FormGroup): void
  {
    formGroup.get ("bucket").enable ();
    formGroup.get ("tableDescription").enable ();
  }
}
