import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Globals } from '../globals/Globals';
import { ApiClient } from '../api/api-client';
import { ApplicationService } from '../services/application.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-admin-arguments-category, FilterPipeArg',
  templateUrl: './admin-arguments-category.component.html',
  styleUrls: ['./admin-arguments-category.component.css']
})
export class AdminArgumentsCategoryComponent implements OnInit {

  innerHeight: number;
  category: any = {label: '', icon: '', description: '', isSelected: false};
  categories: any[] = [];
  optionSelected: any;
  idDomOptionSelected: any;
  categoryDelete: any[] = [];
  argumentDelete: any[] = [];
  dataToSend: any[] = [];
  searchText:string;

  constructor(private http: ApiClient,  public dialog: MatDialog, public globals: Globals, private service: ApplicationService) { }

  ngOnInit() {
    this.innerHeight = window.innerHeight;

    this.getCategoryArguments();

  }

  getCategoryArguments() {
    this.globals.isLoading = true;
    this.service.loadCategoryArguments(this, this.handlerSuccessCategoryArguments, this.handlerErrorCategoryArguments);
  }
  handlerSuccessCategoryArguments(_this, result) {
    _this.categories = result;
    _this.globals.isLoading = false;
  }

  handlerErrorCategoryArguments(_this, result) {
    console.log(result);
    _this.globals.isLoading = false;
  }
sendData() {
  this.dataToSend = this.categories.concat(this.categoryDelete);
  console.log(this.dataToSend);
  this.service.saveNewCategoryArguments(this, this.dataToSend, this.handlerSuccess, this.handlerError);
}

handlerSuccess(_this, result){
  _this.categories = result;
  _this.globals.isLoading = false;
}

handlerError(_this,result){
  console.log(result);
  _this.globals.isLoading = false;
  const dialogRef = _this.dialog.open(MessageComponent, {
    data: { title:"Error", message: "It was an error, try again."}
  });
}

getSelectedOption(option) {
  if (this.category !== option) {
    option.isSelected = !option.isSelected;
    this.category.isSelected = !this.category.isSelected;
    option.focus=true;
    this.category = option;
  } else {
    option.isSelected = !option.isSelected;
    option.focus=false;
    this.category = {};
  }

  console.log(this.category);
}

addCategory() {
  const cat = {
    label: '',
    icon: '',
    description: '',
    arguments: [],
  }
  this.categories.unshift(cat);
  this.getSelectedOption(this.categories[0]);
}

deleteCategory() {
  this.category.toDelete = true;
  this.categoryDelete.push(this.category);
  const index: number = this.categories.findIndex(d => d === this.category);
  this.categories.splice(index, 1);
  this.category = null;
}

addArgument() {
  const arg = {
    description: '',
    type: ''
  };
  this.category.arguments.unshift(arg);
}

deleteArgument(argument) {
  argument.toDelete = true;
}

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.innerHeight = event.target.innerHeight;
  }

  getInnerHeight(): number
  {
    return this.innerHeight;
  }
}
