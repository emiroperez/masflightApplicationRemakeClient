import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Globals } from '../globals/Globals';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatalakeService } from '../services/datalake.service';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-datalake-query-engine-save',
  templateUrl: './datalake-query-engine-save.component.html'
})
export class DatalakeQueryEngineSaveComponent implements OnInit {

  saveQueryFormGroup: FormGroup;

  constructor(public dialogRef: MatDialogRef<DatalakeQueryEngineSaveComponent>,
    private dialog: MatDialog,
    public globals: Globals, private formBuilder: FormBuilder, private service: DatalakeService,
    @Inject(MAT_DIALOG_DATA) public data: any)
  { 
    this.saveQueryFormGroup = this.formBuilder.group ({
      QueryName: ['', Validators.required],
      Schema: new FormControl ({ value: this.data.schema, disabled: true }, Validators.required),
      raw: new FormControl ({ value: this.data.input, disabled: true }, Validators.required)
      // Schema: [this.data.schema, Validators.required],
      // raw: ['', Validators.required]
    });
  }

  ngOnInit() {
    // this.saveQueryFormGroup.get ("QueryName").setValue (this.data.input);
    // this.saveQueryFormGroup.get ("Schema").setValue (this.data.schema);
  }

  save(){
    let request = {
      Raw: this.saveQueryFormGroup.get ("raw").value,
      Schema: this.saveQueryFormGroup.get ("Schema").value,
      QueryName: this.saveQueryFormGroup.get ("QueryName").value
    }
    this.service.datalakeSaveQuery (this,request, this.saveResults, this.saveError);
}

saveResults(_this, result): void
{
  if(result.OK){
    _this.dialogRef.close (); 
    _this.dialog.open (MessageComponent, {
      data: { title: "Result: ", message: result.OK }
    });  
  }else{
    _this.dialog.open (MessageComponent, {
      data: { title: "Result: ", message: result.value }
    }); 
  }
}

saveError(_this, result): void
{
  console.log (result);
}

  Clean(){

  }
}
