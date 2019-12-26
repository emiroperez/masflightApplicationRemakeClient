import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { MessageComponent } from '../message/message.component';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-datalake-alarm-add-email-dialog',
  templateUrl: './datalake-alarm-add-email-dialog.component.html'
})
export class DatalakeAlarmAddEmailDialogComponent implements OnInit {

  users: any[] ;
  // userEmail: any = "";
  selectedUser: any;
  EmailAlarmForm: FormGroup;
  
  constructor(public dialogRef: MatDialogRef<DatalakeAlarmAddEmailDialogComponent>,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data) { 
      this.EmailAlarmForm = this.formBuilder.group ({
        emailValidator: new FormControl('', [Validators.email])
      });

    }
  ngOnInit() {
    this.users = this.data.emailList.slice();
  }
  
  isEmailInvalid(): boolean
  {
    return this.EmailAlarmForm.get ('emailValidator').invalid;
  }

  getErrorEmailMessage() {
    return this.EmailAlarmForm.get ('emailValidator').hasError('email') ? 'Invalid Email' :'';
  }

  closeDialog(): void
  {
    this.dialogRef.close (this.users);
  }

  addUserEmail(){
    let userEmail = this.EmailAlarmForm.get ('emailValidator');
    if(userEmail.value){
      let index: number = this.users.findIndex(d => d.email === userEmail.value);
      if(index!=-1){
        // this.userEmail="";        
        userEmail.setValue (null);
        this.dialog.open (MessageComponent, {
          data: { title: "Error", message: "The email "+userEmail.value+" already exists, please type another email." }
        });
      }else{
        let user = {
          email: userEmail.value,
          remove: null
        };
        // this.users.push (this.UserEmail);
        this.users.push (user);
        userEmail.setValue (null);
      }
    }
  }

  removeUser(): void
  {
    if(this.selectedUser){
      if(this.data.emailList.length != 0){
        //busco en los que ya staban guardados y si lo encutro, le cambio el estado
        let index: number = this.data.emailList.findIndex(d => d.email === this.selectedUser.email);
        if(index!=-1){
          if(this.users[index].remove){
            this.users[index].remove="T";
          }else{
            this.data.emailList.splice(index,1);
            this.users.splice(index,1);
          }
        }else{
          //sino lo encuentro , busco en los que acabo de agregar y lo elimino
          let indexUser: number = this.users.findIndex(d => d.email === this.selectedUser.email);
          if(indexUser!=-1){
            this.users.splice(indexUser,1);
          }
        }
      }else{
        //busco en los que acabo de agregar y lo elimino
          let indexUser: number = this.users.findIndex(d => d.email === this.selectedUser.email);
          if(indexUser!=-1){
            this.users.splice(indexUser,1);
          }
      }
      this.selectedUser = null;
    }
  }

}
