import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { MatStepper, MatDialog } from '@angular/material';

import { MessageComponent } from '../message/message.component';
import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';
import { DatalakeBucket } from '../datalake-create-table/datalake-bucket';

@Component({
  selector: 'app-datalake-create-new-structure',
  templateUrl: './datalake-create-new-structure.component.html'
})
export class DatalakeCreateNewStructureComponent {
  @Input("schemas")
  schemas: DatalakeQuerySchema[] = [];

  @Input("buckets")
  buckets: DatalakeBucket[] = [];

  currentBuckets: DatalakeBucket[] = [];

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
      delimiter: ['', Validators.required],
      customDelimiter: ['', Validators.required]
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
    let bucketValue: AbstractControl;
    let schema: DatalakeQuerySchema;

    bucketValue = this.newStep1FormGroup.get ("bucket");
    bucketValue.enable ();
    this.newStep1FormGroup.get ("tableDescription").enable ();

    schema = this.newStep1FormGroup.get ("schema").value;
    bucketValue.setValue (null);
    bucketValue.markAsUntouched ();
    this.currentBuckets = [];

    for (let bucket of this.buckets)
    {
      if (bucket.schemaName === schema.schemaName)
        this.currentBuckets.push (bucket);
    }
  }
}
