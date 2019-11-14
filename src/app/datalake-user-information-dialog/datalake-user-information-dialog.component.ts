import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-datalake-user-information-dialog',
  templateUrl: './datalake-user-information-dialog.component.html'
})
export class DatalakeUserInformationDialogComponent implements OnInit {
  datalakeUserInfoFormGroup: FormGroup;
  roleName: any;
  roles: string[] = [];

  constructor(public globals: Globals,public dialogRef: MatDialogRef<DatalakeUserInformationDialogComponent>,
    private formBuilder: FormBuilder,private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data) {
      if(this.data.userInfoDatalake){        
        this.datalakeUserInfoFormGroup = this.formBuilder.group ({
          username: [this.data.userInfoDatalake.username,Validators.required],
          aws_access_key_id: [this.data.userInfoDatalake.aws_access_key_id,Validators.required],
          aws_secret_access_key: [this.data.userInfoDatalake.aws_secret_access_key,Validators.required],
          s3_query_location: [this.data.userInfoDatalake.s3_query_location,Validators.required],
          s3_region: [this.data.userInfoDatalake.s3_region,Validators.required],
          role: [this.data.datalakeRoles,Validators.required]
          // role: [this.data.userInfoDatalake.datalakeRole.name,Validators.required]
        }); 
      } else{
      this.datalakeUserInfoFormGroup = this.formBuilder.group ({
        username: ['',Validators.required],
        aws_access_key_id: ['',Validators.required],
        aws_secret_access_key: ['',Validators.required],
        s3_query_location: ['',Validators.required],
        s3_region: ['',Validators.required],
        role: ['',Validators.required],
      });
    }
   }

  ngOnInit() {
    this.service.getDatalakeRoles (this,"", this.setRoles, this.setRolesError);
  }

  closeDialog(): void
  {
    Object.keys (this.datalakeUserInfoFormGroup.controls).forEach (field =>
      {
        this.datalakeUserInfoFormGroup.get (field).markAsTouched ({ onlySelf: true });
      });

    if (this.datalakeUserInfoFormGroup.valid){
      this.dialogRef.close ();
    }
  }

  saveInformation(): void
  {
    Object.keys (this.datalakeUserInfoFormGroup.controls).forEach (field =>
      {
        this.datalakeUserInfoFormGroup.get (field).markAsTouched ({ onlySelf: true });
      });
      if (this.datalakeUserInfoFormGroup.valid){
        let element = {
          userInfoDatalake: this.datalakeUserInfoFormGroup.value,
          userDatalake: 1
        }
        if(this.data.userInfoDatalake){
          if(this.data.userInfoDatalake.id){
          element.userInfoDatalake.id = this.data.userInfoDatalake.id;
          }
        }
        this.dialogRef.close (element);
      }
  }

  Clean(): void
  {
    // Object.keys (this.datalakeUserInfoFormGroup.controls).forEach (field =>
    //   {
    //     this.datalakeUserInfoFormGroup.get (field).markAsTouched ({ onlySelf: true });
    //   });

    // if (this.datalakeUserInfoFormGroup.valid){
      // let element = {
      //   userDatalake: 1
      // }
    //   this.dialogRef.close ();    
    // }else{      
      this.datalakeUserInfoFormGroup.reset();
      // let element = {
      //   userDatalake: 0
      // }
      this.dialogRef.close ();          
    // }
  }

  RoleChanged(): void
  {
    this.roleName = this.datalakeUserInfoFormGroup.get ("role").value;

    this.globals.isLoading = true;
    this.service.getDatalakeRoles (this, this.roleName, this.setRoles, this.setRolesError);
  }

  setRoles(_this, data): void
  {
    if (!data.length)
    {
      _this.globals.isLoading = false;
      return;
    }

    for (let role of data)
      _this.roles.push (role);

      // _this.setschema();
    _this.globals.isLoading = false;
  }

//   setschema()
// {
//   if(this.currentOption.schemaName){
//     var index = this.schemas.findIndex (aux => aux == this.currentOption.schemaName);
//     if(index != -1){
//       this.alarmFormGroup.get ("schema").setValue (this.schemas[index]);
//       this.alarmFormGroup.get ("schema").disable ();
//       this.schemaChanged();
//     }
//   }
// }

  setRolesError(_this, result): void
  {
    console.log (result);
    _this.globals.isLoading = false;
  }

}
