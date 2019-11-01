import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { MatStepper, MatDialog } from '@angular/material';
import { ReplaySubject, Subject } from 'rxjs';

import { MessageComponent } from '../message/message.component';
import { DatalakeQuerySchema } from '../datalake-query-engine/datalake-query-schema';
import { DatalakeBucket } from '../datalake-create-table/datalake-bucket';
import { DatalakeService } from '../services/datalake.service';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-datalake-create-new-structure',
  templateUrl: './datalake-create-new-structure.component.html'
})
export class DatalakeCreateNewStructureComponent {
  @Input("schemas")
  schemas: DatalakeQuerySchema[] = [];

  @Input("buckets")
  buckets: DatalakeBucket[] = [];

  @Output("closeDialog")
  closeDialog = new EventEmitter ();

  @Output("startLoading")
  startLoading = new EventEmitter ();

  @Output("stopLoading")
  stopLoading = new EventEmitter ();

  currentBuckets: DatalakeBucket[] = [];

  tableConfigurationFormGroup: FormGroup;

  selectedFileType: string = "CSV";
  fileLoading: boolean = false;
  targetFileSize: string;
  targetFile: File;

  delimiters: string[] = [ "COMMA", "SEMICOLON", "TABULAR", "CUSTOM" ];
  selectedDelimiter: string = "COMMA";
  delimiterCharacter: string = ",";

  dataTypes: string[] = [ "string", "double", "bigint", "timestamp" ];
  partitionDataTypes: string[] = [ "String", "Double", "Bigint", "Timestamp" ];
  filteredDataColumns: ReplaySubject<any[]> = new ReplaySubject<any[]> (1);
  _onDestroy = new Subject<void> ();
  dataColumnFilter: string;

  dataColumns: any[];
  partitions: any[] = [];
  rawData: string[][];
  showSelected: boolean = false;
  request: {
  columns: any[]; Partitions: any[]; format: string; tableName: any; schemaName: any; s3TableLocation: string; s3FilePath: any;
    // s3FilePath: vS3FilePath,
    tableDesc: any; separator: string; longName: any;
  };

  constructor(public globals: Globals,private dialog: MatDialog, private formBuilder: FormBuilder,
    private service: DatalakeService)
  {
    // initialize all form groups
    this.tableConfigurationFormGroup = this.formBuilder.group ({
      tableName: ['', Validators.required],
      tableLongName: ['', Validators.required],
      schema: ['', Validators.required],
      bucket: new FormControl ({ value: '', disabled: true }, Validators.required),
      tableDescription: new FormControl ({ value: '', disabled: true }),
      tableLocation: [''],
      customDelimiter: new FormControl ({ value: '', disabled: true }, Validators.required),
      fileName: new FormControl ('', Validators.required)
    });
  }

  ngOnDestroy(): void
  {
    this._onDestroy.next ();
    this._onDestroy.complete ();
  }

  goBack(stepper: MatStepper): void
  {
    stepper.previous ();
  }

  goForward(stepper: MatStepper): void
  {
    if (!stepper.selectedIndex)
    {
      // validate form before going forward
      Object.keys (this.tableConfigurationFormGroup.controls).forEach (field =>
      {
        this.tableConfigurationFormGroup.get (field).markAsTouched ({ onlySelf: true });
      });

      if (this.tableConfigurationFormGroup.invalid)
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "The required information is incomplete, please complete them and try again." }
        });
  
        return;
      }
      // else{
      //   this.addPartitionS3tabletLocation(this.tableConfigurationFormGroup.get ("tableLocation").value);
      // }
    }
    /*else if ((stepper.selectedIndex == 1 && this.selectedFileType === 'PARQUET'))
    {
      if (!this.partitions.length)
      {
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "You must at least add one partition." }
        });
  
        return;
      }
    }*/

    stepper.next ();
  }

  schemaChanged(): void
  {
    let bucketValue: AbstractControl;
    let schema: DatalakeQuerySchema;

    bucketValue = this.tableConfigurationFormGroup.get ("bucket");
    bucketValue.enable ();
    this.tableConfigurationFormGroup.get ("tableDescription").enable ();

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
      this.delimiterCharacter = null;
      this.tableConfigurationFormGroup.get ("fileName").setValue ("");
      this.dataColumns = [];
      this.rawData = [];
      this.filteredDataColumns.next (this.dataColumns.slice ());
      this.targetFileSize = null;

      customDelimiter.markAsUntouched ();
      customDelimiter.enable ();
      return;
    }

    customDelimiter.markAsUntouched ();
    customDelimiter.setValue ("");
    customDelimiter.disable ();
    
    this.delimiterCharacter = null;
    this.tableConfigurationFormGroup.get ("fileName").setValue ("");
    this.dataColumns = [];
    this.rawData = [];
    this.filteredDataColumns.next (this.dataColumns.slice ());
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
    // if(this.targetFile.size <= 130){
    if(this.targetFile.size <= 104857600){ //100MB
    fileInfo.append ('file', this.targetFile, this.targetFile.name);

    tableFileConfig = {
      separator: this.delimiterCharacter,
      format: this.selectedFileType,
      s3filepath: this.tableConfigurationFormGroup.get ("tableLocation").value
    };

    this.fileLoading = true;
    this.service.uploadDatalakeTableFile (this, tableFileConfig, fileInfo, this.uploadSuccess, this.uploadFailed);
  }else{
    this.selectedDelimiter = null;
    this.tableConfigurationFormGroup.get ("customDelimiter").setValue ("");
    this.delimiterCharacter = null;
    this.tableConfigurationFormGroup.get ("fileName").setValue ("");
    this.dataColumns = [];
    this.rawData = [];
    this.filteredDataColumns.next (this.dataColumns.slice ());
    this.targetFileSize = this.calcFileSize (this.targetFile.size);
    this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Maximum upload size allowed 100 MB. Uploaded file size: "+ this.targetFileSize}
    });
  }
  }

  uploadSuccess(_this, data): void
  {
    let fileReader: FileReader;
    let i: number = 1;

    _this.tableConfigurationFormGroup.get ("fileName").setValue (_this.targetFile.name);
    _this.targetFileSize = _this.calcFileSize (_this.targetFile.size);

    _this.dataColumns = [];

    for (let column of data.columns)
    {
      _this.dataColumns.push ({
        index: i,
        name: column.Name,
        mapName: column.Name,
        dataType: column.DataType,
        mapDataType: column.DataType
      });

      i++;
    }

    _this.filteredDataColumns.next (_this.dataColumns.slice ());

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
    _this.tableConfigurationFormGroup.get ("fileName").setValue ("");

    console.log (result);
  }

  filterDataColumns(): void
  {
    let search, filteredResults;

    if (!this.dataColumns.length)
      return;

    // get the search keyword
    search = this.dataColumnFilter;
    if (!search)
    {
      this.filteredDataColumns.next (this.dataColumns.slice ());
      return;
    }

    search = search.toLowerCase ();
    filteredResults = this.dataColumns.filter (a => (a.name.toLowerCase ().indexOf (search) > -1
      || a.mapName.toLowerCase ().indexOf (search) > -1 || a.dataType.toLowerCase ().indexOf (search) > -1
      || a.mapDataType.toLowerCase ().indexOf (search) > -1));

    this.filteredDataColumns.next (
      filteredResults.filter (function (elem, index, self)
      {
        return index === self.indexOf (elem);
      })
    );
  }

  resetStepper(stepper: MatStepper, uploader): void
  {
    stepper.reset ();

    // clear other related variables after changing the file type
    this.dataColumns = [];
    this.rawData = [];

    this.targetFileSize = null;
    this.targetFile = null;
    this.tableConfigurationFormGroup.get ("fileName").setValue ("");
    uploader.value = null;

    this.filteredDataColumns.next (this.dataColumns.slice ());
    this.fileLoading = false;
  }

  createTable(): void
  {
    let columnList = [];
    let partitionList = [];
    // let request;
    let vS3FilePath = "";

    for (let column of this.dataColumns)
    {
      columnList.push ({
        Row: column.index - 1,
        Name: column.mapName,
        DataType: column.mapDataType
      });
    }

    for (let partition of this.partitions)
    {
      partitionList.push ({
        Name: partition.name,
        isPartition: partition.isPartition? partition.isPartition : "YES",
        DataType: partition.dataType
      });

      // if (vS3FilePath===""){
      //   vS3FilePath = partition.name;
      // }else{
      //   vS3FilePath = vS3FilePath+"/"+partition.name;
      // }
    }

    this.request = {
      columns: columnList,
      Partitions: partitionList,
      format: this.selectedFileType,
      tableName: this.tableConfigurationFormGroup.get ("tableName").value,
      schemaName: this.tableConfigurationFormGroup.get ("schema").value.schemaName,
      s3TableLocation: "s3://" + this.tableConfigurationFormGroup.get ("bucket").value.bucketName,
      s3FilePath: this.tableConfigurationFormGroup.get ("tableLocation").value,
      // s3FilePath: vS3FilePath,
      tableDesc: this.tableConfigurationFormGroup.get ("tableDescription").value,
      separator: this.delimiterCharacter,
      longName: this.tableConfigurationFormGroup.get ("tableLongName").value
    };
    this.startLoading.emit ();
    this.service.createDatalakeTable (this, this.request, this.tableCreated, this.createTableError);
  }

  tableCreated(_this, data): void
  {
    // _this.stopLoading.emit ();
    if (data.message){
      _this.dialog.open (MessageComponent, {
        data: { title: "Error", message: data.message }
      });
    }else{
      _this.dialog.open (MessageComponent, {
        data: { title: "Success", message: "Table created Successfully" }
      });
      let dataUpload = null;
      if(_this.showSelected){
        dataUpload = {index: 1,
        schemaName: _this.tableConfigurationFormGroup.get ("schema").value.schemaName,
        tableName: _this.tableConfigurationFormGroup.get ("tableName").value}
      } 
    _this.closeDialog.emit (dataUpload);
    // _this.closeDialog.emit();
    }
    console.log (data);    
  }

  createTableError(_this, result): void
  {
    console.log (result);
    _this.stopLoading.emit ();

    _this.dialog.open (MessageComponent, {
      data: { title: "Error", message: "Failed to create new table." }
    });
  }

  addPartition(): void
  {
    this.partitions.push ({
      name: "New Partition",
      isPartition: "YES",
      dataType: "String"
    });
  }

  removePartition(partition): void
  {
    this.partitions.splice (this.partitions.indexOf (partition), 1);
  }

  // addPartitionS3tabletLocation(namePart: any): void
  // {
  //   if (this.showSelected){
  //     let index: number = this.partitions.findIndex(d => d.name === namePart);
  //     if(index!=-1){
  //       this.partitions[index].isPartition="YES";
  //     }else{
  //       this.partitions.push ({
  //         name: namePart,
  //         isPartition: "YES",
  //         dataType: "String"
  //       });
  //     }
  //   }else{
  //     let index: number = this.partitions.findIndex(d => d.name === namePart);
  //     if(index!=-1){
  //       this.partitions[index].isPartition="NO";
  //     }else{
  //       this.partitions.push ({
  //         name: namePart,
  //         isPartition: "NO",
  //         dataType: "String"
  //       });
  //     }
  //   }
  // }

  tableNameChange(){
    if(this.tableConfigurationFormGroup.get ("tableLocation").value === ''){
    this.tableConfigurationFormGroup.get ("tableLocation").setValue (this.tableConfigurationFormGroup.get ("tableName").value);
    }
  }
}
