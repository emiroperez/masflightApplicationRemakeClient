import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-msf-more-info-popup',
  templateUrl: './msf-more-info-popup.component.html',
  styleUrls: ['./msf-more-info-popup.component.css']
})
export class MsfMoreInfoPopupComponent {
  response;
  mainElement;
  constructor(
    public dialogRef: MatDialogRef<MsfMoreInfoPopupComponent>,
    public globals: Globals,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

    onNoClick(): void
    {
      this.dialogRef.close ();
    }

    closeDialog(): void
    {
      this.dialogRef.close ();
    }

    getFormatMinutes(value:any){
      if(value=="0"){
        return "0h 0m";
      }else{
        var aux ="";
        var result = value/60;
        var resultString = String(result);
        if(resultString.split(".")[0]!="0"){
          aux = resultString.split(".")[0] + "h " + resultString.split(".")[1].substr(0, 1)+ "m";
        }else{
          aux = value + "m";
        }
        return aux;
      }
    }

    getBackground(){
      var titulo = this.globals.popupMainElement[0].title;
      titulo = titulo.replace(/ /g, '_');
        return "../../assets/images/Top_Ten_Movie_Posters/"+titulo+".png"
    }
}
