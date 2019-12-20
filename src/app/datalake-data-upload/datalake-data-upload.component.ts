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
export class DatalakeDataUploadComponent {
  @Input("schemas")
  schemas: DatalakeQuerySchema[] = [];

  // @Input("buckets") kp 16/12/2019
  // buckets: DatalakeBucket[] = [];

  @Input("Datavalue")
  Datavalue: any;

  @Output("closeDialog")
  closeDialog = new EventEmitter ();

  @Output("startLoading")
  startLoading = new EventEmitter ();

  @Output("stopLoading")
  stopLoading = new EventEmitter ();

  currentBuckets: DatalakeBucket[] = [];
  tables: any[] = [];
  tableFilterCtrl: FormControl = new FormControl ();
  filteredTables: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy: Subject<void> = new Subject<void> ();

  tableConfigurationFormGroup: FormGroup;
  uploadFileFormGroup: FormGroup;
  // partitionManagementFormGroup: FormGroup;

  bucket: string = "";
  selectedFileType: string = "";
  fileLoading: boolean = false;
  targetFileSize: string;
  targetFile: any;

  delimiters: string[] = [ "COMMA", "SEMICOLON", "TABULAR", "CUSTOM" ];
  selectedDelimiter: string = "";
  delimiterCharacter: string = "";

  dataSource: any[];
  rawData: string[][];
  fileInfo: FormData;
  Partitions: any[] = [];

  constructor(public globals: Globals, private dialog: MatDialog, private formBuilder: FormBuilder,
    private service: DatalakeService)
  {
    // initialize all form groups
    this.tableConfigurationFormGroup = this.formBuilder.group ({
      schema: ['', Validators.required],
      table: new FormControl ({ value: '', disabled: true }, Validators.required),
      bucket: new FormControl ({ value: '', disabled: true }, Validators.required),
      tableLocation: ['', Validators.required]
    });

    this.uploadFileFormGroup = this.formBuilder.group ({
      fileName: new FormControl ('', Validators.required),
      customDelimiter: new FormControl ({ value: '', disabled: true }, Validators.required)
    });

    /*this.partitionManagementFormGroup = this.formBuilder.group ({
      schemaName: ['', Validators.required],
      tableName: ['', Validators.required],
      runType: ['', Validators.required],
      status: ['', Validators.required]
    });*/

    this.filteredTables.next (this.tables.slice ());
    this.searchChange ();
  }

  goBack(stepper: MatStepper): void
  {
    stepper.previous ();
  }

  goForward(formGroup: FormGroup,formGroup2: FormGroup, stepper: MatStepper): void
  {
    if (!formGroup && !formGroup2)
    {
      stepper.next ();
      return;
    }

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

    // validate form before going forward
    Object.keys (formGroup2.controls).forEach (field =>
      {
        formGroup2.get (field).markAsTouched ({ onlySelf: true });
      });
    
      if (formGroup2.invalid)
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
    // this.currentBuckets = []; kp 16/12/2019

    // for (let bucket of this.buckets)
    // {
    //   if (bucket.schemaName === schema.schemaName)
    //     this.currentBuckets.push (bucket);
    // }
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
      var index = _this.tables.findIndex (aux => aux.TableName == _this.Datavalue.tableName);
      // var index = _this.tables.findIndex (aux => aux.TableName == "testkupload");
      if(index != -1){
        tableSelector.setValue (_this.tables[index]);
        tableSelector.disable ();
        _this.tableChanged();
      }
    }
    _this.stopLoading.emit ();
  }

  toggleCustomDelimiter(): void
  {
    let customDelimiter = this.uploadFileFormGroup.get ("customDelimiter");

    if (this.selectedDelimiter === "CUSTOM")
    {
      this.delimiterCharacter = null;
      this.uploadFileFormGroup.get ("fileName").setValue ("");
      this.dataSource = [];
      this.rawData = [];
      this.targetFileSize = null;

      customDelimiter.markAsUntouched ();
      customDelimiter.enable ();
      return;
    }

    customDelimiter.markAsUntouched ();
    customDelimiter.setValue ("");
    customDelimiter.disable ();
    
    this.delimiterCharacter = null;
    this.uploadFileFormGroup.get ("fileName").setValue ("");
    this.dataSource = [];
    this.rawData = [];
    this.targetFileSize = null;
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
    if (this.selectedFileType === "CSV" || this.selectedFileType === ""){
      return ".csv";
    }else{
      return ".parquet";
    }

  }

  browseFile(uploader): void
  {
    if (this.selectedFileType === ""){
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "You must specify a File Type before importing a file." }
      });

      return;
    }

    if (this.selectedFileType === "CSV" && this.selectedDelimiter === "CUSTOM")
    {
      if (this.uploadFileFormGroup.get ("customDelimiter").value === "")
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
        return this.uploadFileFormGroup.get ("customDelimiter").value;
    }
  }

  uploadFile(event,op): void
  {
    this.fileInfo = new FormData ();
    let tableFileConfig;

    this.delimiterCharacter = this.getDelimiterCharacter ();
    if(op===1){
    this.targetFile = event.target.files[0];
    }
    // if(this.targetFile.size <= 130){
    if(this.targetFile.size <= 104857600){ //100MB
      this.fileInfo.append ('file', this.targetFile, this.targetFile.name);

      tableFileConfig = {
        separator: this.delimiterCharacter,
        format: this.selectedFileType,
        s3filepath: this.tableConfigurationFormGroup.get ("tableLocation").value
      };

      this.fileLoading = true;
      this.service.uploadDatalakeTableFile (this, tableFileConfig, this.fileInfo, this.uploadSuccess, this.uploadFailed);
    }else{
      this.selectedDelimiter = null;
      this.uploadFileFormGroup.get ("customDelimiter").setValue ("");
      this.delimiterCharacter = null;
      this.uploadFileFormGroup.get ("fileName").setValue ("");
      this.dataSource = [];
      this.rawData = [];
      this.targetFileSize = this.calcFileSize (this.targetFile.size);
      this.dialog.open (MessageComponent, {
        data: { title: "Error", message: "Maximum upload size allowed 100 MB. Uploaded file size: "+ this.targetFileSize}
      });
    }
  }

  uploadSuccess(_this, data): void
  {
    let fileReader: FileReader;

    _this.uploadFileFormGroup.get ("fileName").setValue (_this.targetFile.name);
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

        // _this.rawData.push (columns[i].split (_this.delimiterCharacter));
        if(columns[i].length != 0){
        _this.rawData.push (_this.splitRows(_this.delimiterCharacter, columns[i]));
        }
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
    _this.uploadFileFormGroup.get ("fileName").setValue ("");
  }

  resetStepper(stepper: MatStepper): void
  {
    stepper.reset ();

    // clear other related variables after changing the file type
    this.rawData = [];

    this.targetFileSize = null;
    this.targetFile = null;
    this.uploadFileFormGroup.get ("fileName").setValue ("");
    this.fileLoading = false;
  }


  setSchemaTablesError(_this, result): void
  {
    let tableSelector = _this.tableConfigurationFormGroup.get ("table");

    // TODO: Show dialog
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
    filteredResults = this.tables.filter (a => (a.TableName.toLowerCase ().indexOf (search) > -1));

    this.filteredTables.next (
      filteredResults.filter (function (elem, index, self)
      {
        return index === self.indexOf(elem);
      })
    );
  }
  dataUpload(): void
    {
      let valid = true;
      if(this.selectedFileType === "PARQUET"){
        valid = this.validateForm(this.tableConfigurationFormGroup,this.uploadFileFormGroup);
      }

      if(valid){
      let request;

      // TODO: Verify form data for Step 2 for parquet files

      request = {
        // bucket: this.tableConfigurationFormGroup.get ("bucket").value.bucketName,
        bucket: this.tableConfigurationFormGroup.get ("bucket").value,
        format: this.selectedFileType,
        s3FilePath: this.tableConfigurationFormGroup.get ("tableLocation").value,
        schemaName: this.tableConfigurationFormGroup.get ("schema").value.schemaName,
        separator: this.delimiterCharacter,
        tableName: this.tableConfigurationFormGroup.get ("table").value.TableName
      };
      this.startLoading.emit ();
      this.service.dataUploadDatalake (this, request,this.fileInfo, this.handlerDataUpload, this.dataUploadError);
      }
    }

    handlerDataUpload(_this, data): void
    {
      _this.stopLoading.emit ();
      if (data.message){
        _this.dialog.open (MessageComponent, {
          data: { title: "Error", message: data.message }
        });
        _this.closeDialog.emit ("Error");
      }else{
        _this.dialog.open (MessageComponent, {
          data: { title: "Success", message: "Data Uploaded Successfully" }
        });      
      _this.closeDialog.emit ();
      }   
    }
  
    dataUploadError(_this, result): void
    {
      _this.stopLoading.emit ();
  
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

  disableFileNameInput(event): void
  {
    event.preventDefault ();
    event.stopPropagation ();
  }

  splitRows(delimiter, row): any {
    var exp =/("(.*?)")/g ;
    var newString = row.replace(exp, '$');
    var array = newString.split(delimiter);
    var array2 =row.match(exp);
    for (let index = 0; index < array.length; index++) {
      if(array[index]=='$'){
        array[index] = array2[0].replace(/"/g,'');
         array2.shift();
      }
    }

    return array;
  }

  tableChanged(){
    this.bucket = this.tableConfigurationFormGroup.get ("table").value.S3TableLocation;
    this.tableConfigurationFormGroup.get ("bucket").setValue (this.bucket);
    if(this.tableConfigurationFormGroup.get ("table").value.Format != ""){
      this.selectedFileType = this.tableConfigurationFormGroup.get ("table").value.Format == "P" ? "PARQUET" : this.tableConfigurationFormGroup.get ("table").value.Format == "C" ? "CSV" : "";
    }else{
      this.selectedFileType = "";
    }
    
    this.delimiterCharacter = this.tableConfigurationFormGroup.get ("table").value.Separator;
    this.selectedDelimiter = this.getDelimiter();
    if(this.tableConfigurationFormGroup.get ("table").value.Partitions != null && this.tableConfigurationFormGroup.get ("table").value.Partitions.length != 0){
      this.Partitions = this.tableConfigurationFormGroup.get ("table").value.Partitions;
    }else{
      this.Partitions = [];
    }

    if(this.Datavalue.targetFile){
      this.targetFile = this.Datavalue.targetFile;
      if(this.selectedDelimiter){
        this.uploadFile("any",0);
      }      
    }
  }

  validateForm(formGroup: FormGroup,formGroup2: FormGroup): boolean
  {
    if (!formGroup && !formGroup2)
    {
      return false;
    }

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
  
      return false;
    }

    // validate form before going forward
    Object.keys (formGroup2.controls).forEach (field =>
      {
        formGroup2.get (field).markAsTouched ({ onlySelf: true });
      });
    
      if (formGroup2.invalid)
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "The required information is incomplete, please complete them and try again." }
        });
    
        return false;
      }

      return true;
    }

    selectedDelimiterAndSimbol(){
      if(this.delimiterCharacter!=""){
        return this.selectedDelimiter+" ("+this.delimiterCharacter+")";
      }else{
        return "";
      }
    }

    getDelimiter(): string
  {
    switch (this.delimiterCharacter)
    {
      case ",":
        return "COMMA";

      case ";":
        return "SEMICOLON";

      case "\t":
        return "TABULAR";

      default:
        this.uploadFileFormGroup.get ("customDelimiter").setValue(this.delimiterCharacter);
        return "CUSTOM";
    }
  }
}