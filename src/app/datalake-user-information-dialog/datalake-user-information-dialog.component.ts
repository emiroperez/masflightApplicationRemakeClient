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
  userRoles: any;
  tempDatalakeRoles: any= [];

  constructor(public globals: Globals,public dialogRef: MatDialogRef<DatalakeUserInformationDialogComponent>,
    private formBuilder: FormBuilder,private service: ApplicationService,
    @Inject(MAT_DIALOG_DATA) public data) {
      this.datalakeUserInfoFormGroup = this.formBuilder.group ({
        username: ['',Validators.required],
        aws_access_key_id: ['',Validators.required],
        aws_secret_access_key: ['',Validators.required],
        s3_query_location: ['',Validators.required],
        s3_region: ['',Validators.required],
        datalakeRoles: ['',Validators.required],
      });
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
        element.userInfoDatalake.datalakeRoles = this.tempDatalakeRoles;
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

  compareTo(st1: any, st2: any) {
    return st1 && st2 ? st1.id === st2.id : st1 === st2;
  }

  RoleChanged(event): void
  {
    let aux = event.source.value;
    if(!event.source.selected){
      let index= this.tempDatalakeRoles.findIndex(dR => dR.idRol.id === aux.id);
      if(index!=-1){
        this.tempDatalakeRoles[index].state = 0
      }
    }else{
      let index= this.tempDatalakeRoles.findIndex(dR => dR.idRol.id === aux.id);
      if(index!=-1){
        this.tempDatalakeRoles[index].state = 1
      }else{
        this.tempDatalakeRoles.push({idRol:aux});
      }
    }

    // this.globals.isLoading = true;
    // this.service.getDatalakeRoles (this, this.roleName, this.setRoles, this.setRolesError);
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

      if(_this.data.userInfoDatalake){
        _this.datalakeUserInfoFormGroup.get ("username").setValue (_this.data.userInfoDatalake.username);
        _this.datalakeUserInfoFormGroup.get ("aws_access_key_id").setValue (_this.data.userInfoDatalake.aws_access_key_id);
        _this.datalakeUserInfoFormGroup.get ("aws_secret_access_key").setValue (_this.data.userInfoDatalake.aws_secret_access_key);
        _this.datalakeUserInfoFormGroup.get ("s3_query_location").setValue (_this.data.userInfoDatalake.s3_query_location);
        _this.datalakeUserInfoFormGroup.get ("s3_region").setValue (_this.data.userInfoDatalake.s3_region);
        _this.setUserRoles();
        
      }
      // _this.setschema();
    _this.globals.isLoading = false;
  }
  setUserRoles() {
    this.tempDatalakeRoles = JSON.parse (JSON.stringify (this.data.userInfoDatalake.datalakeRoles))
    let aux = [];
    let datalakeRoles = this.data.userInfoDatalake.datalakeRoles;
    datalakeRoles.forEach(element => {
      aux.push(element.idRol)
    });
    this.datalakeUserInfoFormGroup.get ("datalakeRoles").setValue(aux);
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
    _this.globals.isLoading = false;
  }

}
