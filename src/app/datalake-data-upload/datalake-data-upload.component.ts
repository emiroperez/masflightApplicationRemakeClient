import { Component } from '@angular/core';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { MatStepper, MatDialog } from '@angular/material';

import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-datalake-data-upload',
  templateUrl: './datalake-data-upload.component.html'
})
export class DatalakeDataUploadComponent {
  uploadStep1FormGroup: FormGroup;
  uploadStep2FormGroup: FormGroup;
  uploadStep3FormGroup: FormGroup;

  constructor(private dialog: MatDialog, private formBuilder: FormBuilder)
  {
    // initialize all form groups
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

  goBack(stepper: MatStepper): void
  {
    stepper.previous ();
  }

  goForward(formGroup: FormGroup, stepper: MatStepper): void
  {
    // validate form before going forward
    Object.keys (formGroup.controls).forEach (field =>
    {
      formGroup.get (field).markAsTouched ({ onlySelf: true });
    });
  
    if (formGroup.invalid)
    {
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "The required information is incomplete, please complete them and try again." }
      });
  
      return;
    }
  
    stepper.next ();
  }

  schemaChanged(): void
  {
    this.uploadStep1FormGroup.get ("bucket").enable ();
    this.uploadStep1FormGroup.get ("tableDescription").enable ();
  }
}
