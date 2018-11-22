import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { jqxTreeGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxtreegrid';
import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements AfterViewInit {

  treeObject: any = {};

  columns: any[] =
    [
      { text: 'Id', dataField: 'id', width: '30%' },
      { text: 'Label', dataField: 'label', width: '70%' }
    ];

  @ViewChild(jqxTreeGridComponent) jqxTreeGridRef: jqxTreeGridComponent;

  constructor(private http: ApiClient, public globals: Globals, private service: ApplicationService) {
  }

  ngAfterViewInit(): void {
    this.loadData();
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
    _this.loadData();
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

  loadData(): void {
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

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '90%';
    }
    return 500;
  }

  getHeight(): any {
    return 300;
  }


}
