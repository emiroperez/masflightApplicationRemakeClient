import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, SimpleChanges } from '@angular/core';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { MatStepper, MatDialog } from '@angular/material';

import { MessageComponent } from '../message/message.component';
import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';
import { DatalakeBucket } from '../datalake-create-table/datalake-bucket';
import { DatalakeService } from '../services/datalake.service';
import { Globals } from '../globals/Globals';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject, Subject } from 'rxjs';

@Component({
  selector: 'app-datalake-data-upload',
  templateUrl: './datalake-data-upload.component.html'
})
export class DatalakeDataUploadComponent{
  @Input("schemas")
  schemas: DatalakeQuerySchema[] = [];

  @Input("buckets")
  buckets: DatalakeBucket[] = [];

  @Input("Datavalue")
  Datavalue: any;

  @Output("closeDialog")
  closeDialog = new EventEmitter ();

  @Output("startLoading")
  startLoading = new EventEmitter ();

  @Output("stopLoading")
  stopLoading = new EventEmitter ();

  currentBuckets: DatalakeBucket[] = [];
  tables: string[] = [];
  tableFilterCtrl: FormControl = new FormControl ();
  filteredTables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy: Subject<void> = new Subject<void> ();

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
  fileInfo: FormData;

  constructor(public globals: Globals, private dialog: MatDialog, private formBuilder: FormBuilder,
    private service: DatalakeService)
  {
    // initialize all form groups
    this.tableConfigurationFormGroup = this.formBuilder.group ({
      schema: ['', Validators.required],
      table: new FormControl ({ value: '', disabled: true }, Validators.required),
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

    this.filteredTables.next (this.tables.slice ());
    this.searchChange ();
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

    if (stepper.selectedIndex == 1 &&  !this.tableConfigurationFormGroup.get ("fileName").value){
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "The required information is incomplete, please complete them and try again." }
      });
  
      return;
    }

    // validate form before going forward
    Object.keys (formGroup.controls).forEach (field =>
    {
      formGroup.get (field).markAsTouched ({ onlySelf: true });
    });
  
    if (formGroup.invalid)
    // if (formGroup.invalid || !this.tableConfigurationFormGroup.get ("fileName").value)
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
    this.startLoading.emit ();
    this.service.getDatalakeSchemaTables (this, schema.schemaName, this.setSchemaTables, this.setSchemaTablesError);
  }

  
  setSchemaTables(_this, data): void
  {
    let tableSelector = _this.tableConfigurationFormGroup.get ("table");

    if (!data.Tables.length)
    {
      _this.stopLoading.emit ();

      tableSelector.setValue (null);
      tableSelector.disable ();
      tableSelector.markAsUntouched ();
      return;
    }

    _this.tables = [];

    for (let tableName of data.Tables)
      _this.tables.push (tableName);

    _this.filteredTables.next (_this.tables.slice ());
    tableSelector.setValue (null);
    tableSelector.enable ();
    tableSelector.markAsUntouched ();

    if(_this.Datavalue.tableName){
      var index = _this.tables.findIndex (aux => aux == _this.Datavalue.tableName);
      if(index != -1){
        _this.tableConfigurationFormGroup.get ("table").setValue (_this.tables[index]);
        tableSelector.disable ();
      }
    }

    _this.stopLoading.emit ();
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
    this.fileInfo = new FormData ();
    let tableFileConfig;

    this.delimiterCharacter = this.getDelimiterCharacter ();
    this.targetFile = event.target.files[0];
    this.fileInfo.append ('file', this.targetFile, this.targetFile.name);

    tableFileConfig = {
      separator: this.delimiterCharacter,
      format: this.selectedFileType,
      s3filepath: this.tableConfigurationFormGroup.get ("tableLocation").value
    };

    this.fileLoading = true;
    this.service.uploadDatalakeTableFile (this, tableFileConfig, this.fileInfo, this.uploadSuccess, this.uploadFailed);
  
    /*let fileReader: FileReader;

    this.tableConfigurationFormGroup.get ("fileName").setValue (this.targetFile.name)
    this.targetFileSize = this.calcFileSize (this.targetFile.size);
    this.dataSource = [];

    if (this.selectedFileType === "PARQUET")
    {
      this.rawData = [];
      this.fileLoading = false;
      return;
    }

    fileReader = new FileReader ();
    fileReader.onload = (e) => {
      let data: string = fileReader.result as string;
      let columns: string[];

      // split the columns first
      columns = data.split ("\r\n");

      this.rawData = [];

      // then the rows by the selected delimiter
      for (let i = 0; i < columns.length; i++)
      {
        if (i >= 15)
          break;    // limit it to 25 for better performance

        this.rawData.push (columns[i].split (this.delimiterCharacter));
      }

      this.fileLoading = false;
    };

    // read file as text for data preview
    fileReader.readAsText (this.targetFile);*/

    
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


  setSchemaTablesError(_this, result): void
  {
    let tableSelector = _this.tableConfigurationFormGroup.get ("table");

    // TODO: Show dialog
    console.log (result);
    _this.tables = [];
    _this.filteredTables.next (_this.tables.slice ());
    tableSelector.setValue (null);
    tableSelector.disable ();
    tableSelector.markAsUntouched ();
    _this.stopLoading.emit ();
  }
  
  searchChange(): void
  {
    // listen for search field value changes
    this.tableFilterCtrl.valueChanges.pipe (takeUntil (this._onDestroy)).subscribe (() => {
      this.filterSchema ();
    });
  }


  filterSchema(): void
  {
    let search, filteredResults;

    if (!this.tables.length)
      return;

    // get the search keyword
    search = this.tableFilterCtrl.value;
    if (!search)
    {
      this.filteredTables.next (this.tables.slice ());
      return;
    }

    search = search.toLowerCase ();
    filteredResults = this.tables.filter (a => (a.toLowerCase ().indexOf (search) > -1));

    this.filteredTables.next (
      filteredResults.filter (function (elem, index, self)
      {
        return index === self.indexOf(elem);
      })
    );
  }
  dataUpload(): void
    {
      let request;
  
      request = {
        bucket: this.tableConfigurationFormGroup.get ("bucket").value.bucketName,
        format: this.selectedFileType,
        s3FilePath: this.tableConfigurationFormGroup.get ("tableLocation").value,
        schemaName: this.tableConfigurationFormGroup.get ("schema").value.schemaName,
        separator: this.delimiterCharacter,
        tableName: this.tableConfigurationFormGroup.get ("table").value
      };
      this.startLoading.emit ();
      this.service.dataUploadDatalake (this, request,this.fileInfo, this.handlerDataUpload, this.dataUploadError);
    }

    handlerDataUpload(_this, data): void
    {
      _this.stopLoading.emit ();
      if (data.message){
        _this.dialog.open (MessageComponent, {
          data: { title: "Error", message: data.message }
        });
      }else{
        _this.dialog.open (MessageComponent, {
          data: { title: "Success", message: "Data Uploaded Successfully" }
        });      
      _this.closeDialog.emit ();
      }
      console.log (data);    
    }
  
    dataUploadError(_this, result): void
    {
      _this.stopLoading.emit ();
      console.log (result);
  
      _this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "Failed to Upload data." }
      });
    }

      
  setschema()
  {
    if(this.Datavalue.schemaName){
      var index = this.schemas.findIndex (aux => aux.schemaName == this.Datavalue.schemaName);
      if(index != -1){
        this.tableConfigurationFormGroup.get ("schema").setValue (this.schemas[index]);
        this.tableConfigurationFormGroup.get ("schema").disable ();
        this.schemaChanged();
      }
    }
    else
      this.tableConfigurationFormGroup.get ("schema").enable ();
    // if(this.Datavalue.tableName){
    //   this.tableConfigurationFormGroup.get ("schema").setValue (this.Datavalue.schemaName);
    // }
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes['Datavalue']){
      // this.stopLoading.emit ();
      this.setschema();
    }
  }
  
}