import { Component, Input } from '@angular/core';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { MatStepper, MatDialog } from '@angular/material';

import { MessageComponent } from '../message/message.component';
import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';
import { DatalakeBucket } from '../datalake-create-table/datalake-bucket';

@Component({
  selector: 'app-datalake-data-upload',
  templateUrl: './datalake-data-upload.component.html'
})
export class DatalakeDataUploadComponent {
  @Input("schemas")
  schemas: DatalakeQuerySchema[] = [];

  @Input("buckets")
  buckets: DatalakeBucket[] = [];

  currentBuckets: DatalakeBucket[] = [];

  uploadStep1FormGroup: FormGroup;
  uploadStep2FormGroup: FormGroup;
  uploadStep3FormGroup: FormGroup;

  fileTypes: string[] = [ "CSV", "PARQUET" ];
  selectedFileType: string = "CSV";
  fileLoading: boolean = false;
  targetFileSize: string;
  targetFile: any;

  delimiters: string[] = [ "COMMA", "SEMICOLON", "TABULAR", "CUSTOM" ];
  selectedDelimiter: string = "COMMA";

  constructor(private dialog: MatDialog, private formBuilder: FormBuilder)
  {
    // initialize all form groups
    this.uploadStep1FormGroup = this.formBuilder.group ({
      schema: ['', Validators.required],
      bucket: new FormControl ({ value: '', disabled: true }, Validators.required),
      tableDescription: new FormControl ({ value: '', disabled: true }),
      customDelimiter: new FormControl ({ value: '', disabled: true }),
      fileLocation: new FormControl ({ value: '', disabled: true }, Validators.required)
    });

    this.uploadStep2FormGroup = this.formBuilder.group ({
      delimiter: ['', Validators.required],
      customDelimiter: ['', Validators.required]
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
    let bucketValue: AbstractControl;
    let schema: DatalakeQuerySchema;

    bucketValue = this.uploadStep1FormGroup.get ("bucket");
    bucketValue.enable ();
    this.uploadStep1FormGroup.get ("tableDescription").enable ();

    schema = this.uploadStep1FormGroup.get ("schema").value;
    bucketValue.setValue (null);
    bucketValue.markAsUntouched ();
    this.currentBuckets = [];

    for (let bucket of this.buckets)
    {
      if (bucket.schemaName === schema.schemaName)
        this.currentBuckets.push (bucket);
    }
  }

  toggleCustomDelimiter(): void
  {
    let customDelimiter = this.uploadStep1FormGroup.get ("customDelimiter");

    if (this.selectedDelimiter === "CUSTOM")
    {
      customDelimiter.enable ();
      return;
    }

    customDelimiter.setValue ("");
    customDelimiter.disable ();
  }

  calcFileSize(size: number): string
  {
    if (size > 1024 * 1024 * 1024)
    {
      size /= 1073741824;
      return size.toFixed (2) +  " GB";
    }
    else if (size > 1024 * 1024)
    {
      size /= 1048576;
      return size.toFixed (2) +  " MB";
    }
    else if (size >= 1024)
    {
      size /= 1024;
      return size.toFixed (2) + " KB";
    }

    return size + " bytes";
  }

  getAcceptedFileFormat(): string
  {
    if (this.selectedFileType === "CSV")
      return ".csv";

    return ".parquet";
  }

  browseFile(uploader): void
  {
    if (this.selectedDelimiter === "CUSTOM")
    {
      if (this.uploadStep1FormGroup.get ("customDelimiter").value === "")
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "You must specify a delimiter before importing a file." }
        });

        return;
      }
    }

    uploader.click ();
  }

  uploadFile(event): void
  {
    this.uploadStep1FormGroup.get ("fileLocation").setValue (event.target.files[0].name);
    this.targetFileSize = this.calcFileSize (event.target.files[0].size);
    this.targetFile = event.target.files[0];
  }
}