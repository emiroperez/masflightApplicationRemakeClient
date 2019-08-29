import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatStepper, MatDialog } from '@angular/material';

import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-datalake-create-new-structure',
  templateUrl: './datalake-create-new-structure.component.html'
})
export class DatalakeCreateNewStructureComponent {
  newStep1FormGroup: FormGroup;
  newStep2FormGroup: FormGroup;
  newStep3FormGroup: FormGroup;
  newStep4FormGroup: FormGroup;

  constructor(private dialog: MatDialog, private formBuilder: FormBuilder)
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
    this.newStep1FormGroup.get ("bucket").enable ();
    this.newStep1FormGroup.get ("tableDescription").enable ();
  }
}
