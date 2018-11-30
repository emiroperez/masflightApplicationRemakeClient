import { Component, OnInit, ViewChild} from '@angular/core';
import { Menu } from '../model/Menu';
import { Option } from '../model/Option';
import {CategoryArguments} from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';
import { MatDialog} from '@angular/material';
import { MsfDynamicTableVariablesComponent } from '../msf-dynamic-table-variables/msf-dynamic-table-variables.component';
import { MsfContainerComponent } from '../msf-container/msf-container.component';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {
  
  animal: string;
  name: string;

  menu: Menu;
  status: boolean;
  ELEMENT_DATA: any[];
  //displayedColumns: string[] = [];
  variables;

  @ViewChild('msfContainerRef')
  msfContainerRef: MsfContainerComponent;

  constructor(public dialog: MatDialog, public globals: Globals, private service: MenuService) {
    this.status = true;    
  }

  ngOnInit() {

   /*
    let ceilingArgs = new Arguments(true, ComponentType.ceiling,'ceilingmin', 'ceilingmax', 'distanceunit', null);
    let windArgs = new Arguments(true, ComponentType.windSpeed,'windmin', 'windmax', 'speedunit', null);
    let temperaturaArgs = new Arguments(true, ComponentType.temperature,'tempmin', 'tempmax', 'tempunit', null);
    let windDirectionArgs = new Arguments(true, ComponentType.windDirection,'windanglemin', 'windanglemax', null, null);    
    let weatherCondArgs: Arguments[] = [ceilingArgs,windArgs,temperaturaArgs,windDirectionArgs];
    let weatherCondCategory = new CategoryArguments('Weather Conditions','../../assets/images/components/Weather_Conditions.png',weatherCondArgs);



    let cancelsAndDiversionCategory = new CategoryArguments('Cancels & Diversions','../../assets/images/components/Cancels_Diversions.png',null);
    let categoryArgts5 = new CategoryArguments('Flight Delays','../../assets/images/components/Flight_Delays.png',null);
    let categoryArgts6 = new CategoryArguments('Taxi Times','../../assets/images/components/Taxi_Times.png',null);
    let categoryOutputFormat = new CategoryArguments('Output Format','../../assets/images/components/Output_Format.png',null);
    
    let categoryArgts9 = new CategoryArguments('Date Period','../../assets/images/components/Taxi_Times.png',null);
    let categoriesArguments: CategoryArguments[] = [airlineCategory,airportCategory,weatherCondCategory,cancelsAndDiversionCategory,categoryArgts5,categoryArgts6,categoryOutputFormat];
    
*/


    this.getMenu();
  }


  getMenu(){
    this.service.getMenu(this,this.handlerSuccess,this.handlerError);
  }

  handlerSuccess(_this,data){
    _this.menu = data;
    _this.globals.isLoading = false; 
  }

  handlerError(_this,result){
    console.log(result);
    _this.globals.isLoading = false;  
  }

  toogle(){
    this.status  = !this.status ;
    if(!this.status && this.globals.currentAgts){
      this.globals.currentAgts.open=false;
    }if(this.status && this.globals.currentAgts){
      this.globals.currentAgts.open=true;
    }
  }

  search(){
    if(this.globals.currentOption.tabType === 'map'){
      this.globals.map = true;
      this.msfContainerRef.msfMapRef.getTrackingDataSource(); 
    }else if(this.globals.currentOption.tabType === 'usageStatistics'){
      this.msfContainerRef.msfTableRef.getDataUsageStatistics();
    }else{
      this.msfContainerRef.msfTableRef.getData(); 
    }       
  }


  disabled(){
    let option:any = this.globals.currentOption;
    let disabled = false;
    if(option && option.menuOptionArguments){            
      for( let menuOptionArguments of option.menuOptionArguments){
          if(menuOptionArguments.categoryArguments){   
            if( menuOptionArguments.categoryArguments){            
              for( let i = 0; i < menuOptionArguments.categoryArguments.length;i++){
                let category: CategoryArguments = menuOptionArguments.categoryArguments[i];
                if(category && category.arguments){
                  for( let j = 0; j < category.arguments.length;j++){
                    let argument: Arguments = category.arguments[j];
                    if(argument.required){
                      if(argument.value1 == null || (argument.name2 && argument.value2 == null)){
                        return true;
                      }       
                    }
                  }
                }        
              }   
            }   
          }
        }
      }
    
    return disabled;
  }


  openChart(){
    this.globals.chart = !this.globals.chart;
    this.globals.selectedIndex = 3;
  }

  dynamicTable(){
    this.openDialog();
  }

  openDialog(): void {
    this.globals.generateDynamicTable = true;
    const dialogRef = this.dialog.open(MsfDynamicTableVariablesComponent, {
      width: '600px',
      data: {metadata:this.msfContainerRef.msfTableRef.metadata, variables: this.variables}      
    });

    const sub = dialogRef.componentInstance.dynamicTableOpen.subscribe(() => {
      this.msfContainerRef.msfDynamicTableRef.loadData();
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

}
