import { Component, Input } from '@angular/core';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { MatStepper, MatDialog } from '@angular/material';

import { MessageComponent } from '../message/message.component';
import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';
import { DatalakeBucket } from '../datalake-create-table/datalake-bucket';
import { DatalakeService } from '../services/datalake.service';

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

  tableConfigurationFormGroup: FormGroup;
  partitionManagementFormGroup: FormGroup;

  fileTypes: string[] = [ "CSV", "PARQUET" ];
  selectedFileType: string = "CSV";
  fileLoading: boolean = false;
  targetFileSize: string;
  targetFile: any;

  delimiters: string[] = [ "COMMA", "SEMICOLON", "TABULAR", "CUSTOM" ];
  selectedDelimiter: string = "COMMA";
  delimiterCharacter: string = ",";

  dataSource: any[];
  rawData: string[][];

  constructor(private dialog: MatDialog, private formBuilder: FormBuilder,
    private service: DatalakeService)
  {
    // initialize all form groups
    this.tableConfigurationFormGroup = this.formBuilder.group ({
      schema: ['', Validators.required],
      bucket: new FormControl ({ value: '', disabled: true }, Validators.required),
      customDelimiter: new FormControl ({ value: '', disabled: true }),
      tableLocation: ['', Validators.required],
      fileName: new FormControl ({ value: '', disabled: true }, Validators.required)
    });

    this.partitionManagementFormGroup = this.formBuilder.group ({
      schemaName: ['', Validators.required],
      tableName: ['', Validators.required],
      runType: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  goBack(stepper: MatStepper): void
  {
    stepper.previous ();
  }

  goForward(formGroup: FormGroup, stepper: MatStepper): void
  {
    if (!formGroup)
    {
      stepper.next ();
      return;
    }

    // validate form before going forward
    Object.keys (formGroup.controls).forEach (field =>
    {
      formGroup.get (field).markAsTouched ({ onlySelf: true });
    });
  
    if (formGroup.invalid || !this.tableConfigurationFormGroup.get ("fileName").value)
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

    bucketValue = this.tableConfigurationFormGroup.get ("bucket");
    bucketValue.enable ();

    schema = this.tableConfigurationFormGroup.get ("schema").value;
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
    let customDelimiter = this.tableConfigurationFormGroup.get ("customDelimiter");

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
    if (this.selectedFileType === "CSV" && this.selectedDelimiter === "CUSTOM")
    {
      if (this.tableConfigurationFormGroup.get ("customDelimiter").value === "")
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "You must specify a delimiter before importing a file." }
        });

        return;
      }
    }

    uploader.click ();
  }

  getDelimiterCharacter(): string
  {
    switch (this.selectedDelimiter)
    {
      case "COMMA":
        return ",";

      case "SEMICOLON":
        return ";";

      case "TABULAR":
        return "\t";

      default:
        return this.tableConfigurationFormGroup.get ("customDelimiter").value;
    }
  }

  uploadFile(event): void
  {
    let fileInfo = new FormData ();
    let tableFileConfig;

    this.delimiterCharacter = this.getDelimiterCharacter ();
    this.targetFile = event.target.files[0];
    fileInfo.append ('file', this.targetFile, this.targetFile.name);

    tableFileConfig = {
      separator: this.delimiterCharacter,
      format: this.selectedFileType,
      s3filepath: this.tableConfigurationFormGroup.get ("tableLocation").value
    };

    this.fileLoading = true;
    this.service.uploadDatalakeTableFile (this, tableFileConfig, fileInfo, this.uploadSuccess, this.uploadFailed);
  }

  uploadSuccess(_this, data): void
  {
    let fileReader: FileReader;

    _this.tableConfigurationFormGroup.get ("fileName").setValue (_this.targetFile.name);
    _this.targetFileSize = _this.calcFileSize (_this.targetFile.size);

    _this.dataSource = [];

    for (let column of data.columns)
      _this.dataSource.push (column);

    // do not read as text the parquet file type
    if (_this.selectedFileType === "PARQUET")
    {
      _this.rawData = [];
      _this.fileLoading = false;
      return;
    }

    fileReader = new FileReader ();
    fileReader.onload = (e) => {
      let data: string = fileReader.result as string;
      let columns: string[];

      // split the columns first
      columns = data.split ("\r\n");

      _this.rawData = [];

      // then the rows by the selected delimiter
      for (let i = 0; i < columns.length; i++)
      {
        if (i >= 15)
          break;    // limit it to 25 for better performance

        _this.rawData.push (columns[i].split (_this.delimiterCharacter));
      }

      _this.fileLoading = false;
    };

    // read file as text for data preview
    fileReader.readAsText (_this.targetFile);
  }

  uploadFailed(_this, result): void
  {
    // remove filename from input if the upload failed
    _this.fileLoading = false;
    _this.targetFile = null;
    _this.tableConfigurationFormGroup.get ("fileName").setValue (null);

    console.log (result);
  }

  ResetStepper(stepper: MatStepper, uploader): void
  {
    stepper.reset ();

    // clear other related variables after changing the file type
    this.rawData = [];

    this.targetFileSize = null;
    this.targetFile = null;
    this.tableConfigurationFormGroup.get ("fileName").setValue (null);
    uploader.value = null;
  }
}