import { AfterViewInit, OnInit, Component, ViewChild } from '@angular/core';
import { jqxTreeGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxtreegrid';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements AfterViewInit {

  argumentForm = new FormGroup({
    typeValidator: new FormControl('type', [Validators.required])
  });

  treeObject: any = {};

  categoryArgument: any = {};

  argument: any = {};

  categories: any[];

  columns: any[] =
    [
      { text: 'Id', dataField: 'id', width: '30%' },
      { text: 'Label', dataField: 'label', width: '70%' }
    ];

  columnsCategory: any[] = [
    { text: 'Name1', dataField: 'name1', width: '20%' },
    { text: 'Name2', dataField: 'name2', width: '20%' },
    { text: 'Name3', dataField: 'name3', width: '20%' },
    { text: 'URL', dataField: 'url', width: '30%' },
    { text: 'Required', dataField: 'required', width: '10%' }
  ]

  @ViewChild(jqxTreeGridComponent) jqxTreeGridRef: jqxTreeGridComponent;

  dataAdapter;

  dataAdapterCategory;

  constructor(private http: ApiClient, public globals: Globals, private service: ApplicationService, public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.getCategoryArguments();
  }

  ngAfterViewInit(): void {
    this.getMenuData();
  }

  getSelectedMenuItem(): any[] {
    return this.jqxTreeGridRef.getSelection();
  }

  saveMenu(): void {
    if (this.getSelectedMenuItem().length > 0) {
      this.createOption();
    } else {
      this.createCategory();
    }
    console.log(this.jqxTreeGridRef.getSelection());
  }

  createCategory(): void {
    this.service.createMenucategory(this, this.treeObject, this.handlerSuccessCategory, this.handlerErrorCategory);
  }

  handlerSuccessCategory(_this, result) {
    _this.getMenuData();
    console.log(result);
  }

  handlerErrorCategory(_this, result) {
    console.log(result);
  }

  createOption(): void {
    var re = /Cat/gi;
    var parent = this.getSelectedMenuItem()[0];
    if (parent.id.toString().search(re) == -1) {
      this.treeObject.parentId = parent.id;
      this.treeObject.categoryId = parent.categoryId;
    } else {
      var newCategoryId = parent.id.toString().replace(re, "");
      this.treeObject.categoryId = newCategoryId;
    }
    this.service.createMenuOption(this, this.treeObject, this.handlerSuccessOption, this.handlerErrorOption);
  }

  handlerSuccessOption(_this, result) {
    _this.loadData();
    console.log(result);
  }

  handlerErrorOption(_this, result) {
    console.log(result);
  }

  getMenuData(): void {
    this.service.loadMenuOptions(this, this.handlerSuccess, this.handlerError);
  }

  handlerSuccess(_this, data) {
    let source: any =
    {
      dataType: 'json',
      dataFields: [
        { name: 'id', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'children', type: 'array' },
        { name: 'expanded', type: 'bool' }
      ],
      hierarchy:
      {
        root: 'children'
      },
      id: 'id',
      localData: data
    };
    _this.dataAdapter = new jqx.dataAdapter(source);
    _this.globals.isLoading = false;

  }

  handlerError(_this, result) {
    console.log(result);
    _this.globals.isLoading = false;
  }

  getCategoryArguments() {
    this.service.loadCategoryArguments(this, this.handlerSuccessCategoryArguments, this.handlerErrorCategoryArguments);
  }

  handlerSuccessCategoryArguments(_this, data) {
    _this.categories = data;
  }

  handlerErrorCategoryArguments(_this, result) {
    console.log(result);
  }

  getOptionCategoryArguments() {
    var re = /Cat/gi;
    let selectedOption = this.getSelectedMenuItem();
    let selectedCategory = this.categoryArgument.idCategory;
    let data = {
      idOption: selectedOption[0].id,
      idCategory: selectedCategory.id
    };
    if (selectedOption[0].id.toString().search(re) == -1 && selectedCategory != undefined) {
      this.service.loadOptionCategoryArguments(this, data, this.handlerSuccessOptionCategoryArguments, this.handlerErrorOptionCategoryArguments);
    }
  }

  handlerSuccessOptionCategoryArguments(_this, data) {
    if (data.length != 0) {
      let source: any =
      {
        dataType: 'json',
        dataFields: [
          { name: 'id', type: 'string' },
          { name: 'name1', type: 'string' },
          { name: 'name2', type: 'string' },
          { name: 'name3', type: 'string' },
          { name: 'url', type: 'string' },
          { name: 'required', type: 'boolean' }
        ],
        localData: data[0].categoryArgumentsId.arguments
      };
      _this.dataAdapterCategory = new jqx.dataAdapter(source);
    }
    _this.globals.isLoading = false;
  }

  handlerErrorOptionCategoryArguments(_this, result) {
    _this.globals.isLoading = false;
    console.log(result);
  }

  CategoryArgumentChanged(event: any) {
    this.getOptionCategoryArguments();
    console.log(event);
  }

  saveArgument() {
    if (this.categoryArgument.idCategory != undefined) {
      var re = /Cat/gi;
      var selectedOption = this.getSelectedMenuItem()[0];
      if (selectedOption.id.toString().search(re) == -1 && selectedOption.children.length == 0) {
        this.argument.categoryId = this.categoryArgument.idCategory.id;
        let data: any = {
          idOption: selectedOption.id,
          argument: this.argument
        };
        this.service.createArgument(this, data, this.handlerSuccessArgument, this.handlerErrorArgument);
      } else {
        this.snackBar.open("You must choose a menu option.", "", {
          duration: 5000,
        });
      }
    } else {
      this.snackBar.open("You must choose a category argument.", "", {
        duration: 5000,
      });
    }
  }

  handlerSuccessArgument(_this, result) {
    _this.getOptionCategoryArguments();
    console.log(result);
  }

  handlerErrorArgument(_this, result) {
    console.log(result);
  }

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '90%';
    }
    return 520;
  }

  getHeight(): any {
    return 300;
  }


}
