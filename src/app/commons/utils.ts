
import { CategoryArguments } from "../model/CategoryArguments";
import { Arguments } from "../model/Arguments";
import { ComponentType } from "./ComponentType";
import { DateTimeFormatPipe } from "./DateTimeFormatPipe";
import { DateFormatPipe } from "./DateFormatPipe ";
import { Constants } from "./Constants ";
import { DatePipe } from "@angular/common";
import { componentNeedsResolution } from "@angular/core/src/metadata/resource_loading";

export class Utils{

    notificationMessage: string;
    notificationShow: boolean;
    notificationType: string;

    showAlert(type:string, message: string){
        this.notificationShow=true;
        this.notificationType= type;
        this.notificationMessage = message;
    }


    isEmpty (value: string){
        if(value == null || value == ''){
            return true;
        }
        return false;
    }

    getUrlParameters(option: any){
        console.log(option);
        let params;        
        if(option.menuOptionArguments){            
            for( let menuOptionArguments of option.menuOptionArguments){
                if(menuOptionArguments.categoryArguments){            
                    for( let i = 0; i < menuOptionArguments.categoryArguments.length;i++){
                        let category: CategoryArguments = menuOptionArguments.categoryArguments[i];
                        if(category && category.arguments){
                            for( let j = 0; j < category.arguments.length;j++){
                                let argument: Arguments = category.arguments[j];
                                if(params){
                                    if(argument.type!="singleCheckbox"&& argument.type!="serviceClasses" && argument.type!="fareLower"&& argument.type!="airportsRoutes"&&argument.name1!="intermediateCitiesList"){
                                        params += "&" + this.getArguments(argument);
                                    }else{
                                        if(argument.value1!=false && argument.value1!="" &&  argument.value1!=undefined &&  argument.value1!=null){
                                            params += "&" + this.getArguments(argument);
                                        }else{

                                        }
                                    }
                                }else{
                                    params = this.getArguments(argument);
                                }
                            }
                        }        
                    }
                }
            }
        }
        
        if(option.baseUrl){
            return {tab:option.tab,url:option.baseUrl + "?" + params};
        }
        return {tab:option.tab,url: params};
    }

    getParameters(option: any){
        let params;        
        if(option.menuOptionArguments){            
            for( let menuOptionArguments of option.menuOptionArguments){
                if(menuOptionArguments.categoryArguments){            
                    for( let i = 0; i < menuOptionArguments.categoryArguments.length;i++){
                        let category: CategoryArguments = menuOptionArguments.categoryArguments[i];
                        if(category && category.arguments){
                            for( let j = 0; j < category.arguments.length;j++){
                                let argument: Arguments = category.arguments[j];
                                if(params){
                                    if(argument.type!="singleCheckbox"&& argument.type!="serviceClasses" && argument.type!="fareLower"&& argument.type!="airportsRoutes"&&argument.name1!="intermediateCitiesList"){
                                        params += "&" + this.getArguments(argument);
                                    }else{
                                        if(argument.value1!=false && argument.value1!="" &&  argument.value1!=undefined &&  argument.value1!=null){
                                            params += "&" + this.getArguments(argument);
                                        }else{

                                        }
                                    }
                                }else{
                                    params = this.getArguments(argument);
                                }
                            }
                        }        
                    }
                }
            }
        }
        
        return params;
    }

    getArguments(argument: Arguments){
        let args='';
                if(argument.name1){
                    args = argument.name1 + "=" + this.getValueFormat(argument.type, argument.value1);
                }
                if(argument.name2){
                    if(args !== ''){
                        args += "&" + argument.name2 + "=" + this.getValueFormat(argument.type, argument.value2);
                    }else{
                        args += argument.name2 + "=" + this.getValueFormat(argument.type, argument.value2);
                    }            
                }
                if(argument.name3){
                    if(args !== ''){
                        args += "&" + argument.name3 + "=" + this.getValueFormat(argument.type, argument.value3);
                    }else{
                        args += argument.name3 + "=" + this.getValueFormat(argument.type, argument.value3);
                    }            
                }
                return args;
    }

    getValueFormat(type: string, value:any){
        if( typeof value === 'undefined'){
            return '';
        }
        if(type == ComponentType.timeRange){
            return new DateTimeFormatPipe('en-US').transform(new Date("2000-01-01 " + value).getTime());
        }else if(type == ComponentType.dateRange || 
            type == ComponentType.date){
            return new DateFormatPipe('en-US').transform(value);
        }else if(type == ComponentType.ceiling ||
             type == ComponentType.rounding || type ==  ComponentType.resultsLess || type ==  ComponentType.geography 
             || type == ComponentType.filterAirlineType || type == ComponentType.fareIncrements || type == ComponentType.fareIncrementMiddle
             || type == ComponentType.fareIncrementMax ||  type == ComponentType.percentIncrement || type == ComponentType.quarterHour 
             || type == ComponentType.stops || type == ComponentType.circuityType || type == ComponentType.circuity
             || type == ComponentType.groupingHubSummaries || type == ComponentType.groupingDailyStatics || type == ComponentType.groupingOperationsSummary
             || type == ComponentType.fareIncrementsMarketHistograms|| type == ComponentType.sortingNostop || type == ComponentType.sortingConnectionBuilder){
            if(typeof value === "string"){
                return value;
            }
            return value.id;
        }else if(type == ComponentType.singleairline || type == ComponentType.singleAirport){
           if(typeof value === "string"){
               return value;
           }
           if( typeof value.iata === 'undefined'){
                return '';
            }
           return value.iata;
        }else if(type == ComponentType.selectBoxSingleOption){
            if(typeof value === "string"){
                return value;
            }
            if( typeof value.name === 'undefined'){
                 return '';
             }
            return value.name;
        }else if(type == ComponentType.airline ||
             type == ComponentType.airportRoute || type == ComponentType.airport || type == ComponentType.airportsRoutes){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.iata;
                }else{
                    valueAux += ","+ val.iata;
                }                
                i++;
            }
            return valueAux;
        }else if(type == ComponentType.tailnumber || type == ComponentType.summary || type == ComponentType.fareTypes 
            || type == ComponentType.summaryRevenueBuilds){
           var valueAux="";
           var i = 0;
           for(var val of value){
               if(i == 0){
                   valueAux = val.id;
               }else{
                   valueAux += ","+ val.id;
               }                
               i++;
           }
           return valueAux;
       }else if(type == ComponentType.aircraftType){
        var valueAux="";
        var i = 0;
        for(var val of value){
            if(i == 0){
                valueAux = val.name;
            }else{
                valueAux += ","+ val.name;
            }                
            i++;
        }
        return valueAux;
       }else if(type == ComponentType.tailnumber){
           var valueAux="";
           var i = 0;
           for(var val of value){
               if(i == 0){
                   valueAux = val.id;
               }else{
                   valueAux += ","+ val.id;
               }                
               i++;
           }
           return valueAux;
         }else if(type == ComponentType.datePeriodYear){
            return value;
          }else if (type == ComponentType.sortingCheckboxes){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.columnName + "-" +val.order;
                }else{
                    valueAux += ","+ val.columnName+ "-" +val.order;
                }                
                i++;
            }
            return valueAux;
          }else if (type == ComponentType.grouping || type == ComponentType.causesFlightDelaysCheckbox
            || type == ComponentType.taxiTimesCheckboxes || type == ComponentType.cancelsCheckBox || type== ComponentType.diversionsCheckbox
            || type  == ComponentType.aircraftTypeCheckboxes){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.id;
                }else{
                    valueAux += ","+ val.id;
                }                
                i++;
            }
            return valueAux;
          }else if (type == ComponentType.groupingAthena || type == ComponentType.groupingMariaDB){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.columnName;
                }else{
                    valueAux += ","+ val.columnName;
                }                
                i++;
            }
            return valueAux;
        }else if (type == ComponentType.selectBoxMultipleOption){
                var valueAux="";
                var i = 0;
                for(var val of value){
                    if(i == 0){
                        valueAux = val.name;
                    }else{
                        valueAux += ","+ val.name;
                    }                
                    i++;
                }
                return valueAux;
        }else if (type == ComponentType.region){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.value;
                }else{
                    valueAux += ","+ val.value;
                }                
                i++;
            }
            return valueAux;
    }   else if (type == ComponentType.datePeriod || type == ComponentType.datePeriodRevenue){
              if(value!=null){
                if(value.id!=null){
                    return value.id;
                }else{
                    return value;
                }
              }else{
                  return "";
              }
          }
        return value;
    };


    getValueFormatView(type: string, value:any){
        if(value!=null){
            if( typeof value === 'undefined'){
                return '';
            }
            if(type == ComponentType.dateRange || 
                type == ComponentType.date){
                return this.getDateFormat(value, null);
            }else if(type == ComponentType.airport){
                if(typeof value === "string"){
                    return value;
                }
                return value.iata;
            }else if(type == ComponentType.ceiling ||
                 type == ComponentType.rounding ||  type ==  ComponentType.resultsLess || type ==  ComponentType.geography 
                 || type == ComponentType.filterAirlineType || type == ComponentType.fareIncrements || type == ComponentType.fareIncrementMiddle
                 || type == ComponentType.fareIncrementMax || type == ComponentType.percentIncrement || type == ComponentType.quarterHour
                 || type == ComponentType.stops || type == ComponentType.circuityType || type == ComponentType.circuity
                 || type == ComponentType.groupingHubSummaries || type == ComponentType.groupingDailyStatics || type == ComponentType.groupingOperationsSummary
                 || type == ComponentType.fareIncrementsMarketHistograms|| type == ComponentType.sortingNostop || type == ComponentType.sortingConnectionBuilder){
                if(typeof value === "string"){
                    return value;
                }
                return value.id;
            }else if(type == ComponentType.singleairline || type == ComponentType.singleAirport){
                    if(typeof value === "string"){
                        return value;
                    }
                    if( typeof value.iata === 'undefined'){
                         return '';
                     }
                     return value.iata;
            }else if(type == ComponentType.selectBoxSingleOption){
                if(typeof value === "string"){
                    return value;
                }
                if( typeof value.name === 'undefined'){
                     return '';
                 }
                return value.name;
            }else if(type == ComponentType.airline ||
                 type == ComponentType.airportRoute || type == ComponentType.airportsRoutes){
                    var valueAux="";
                    var i = 0;
                    for(var val of value){
                        if(i == 0){
                            valueAux = val.iata;
                        }else{
                            valueAux += ","+ val.iata;
                        }                
                        i++;
                    }
                    return valueAux;
           }else if(type == ComponentType.aircraftType){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.name;
                }else{
                    valueAux += ","+ val.name;
                }                
                i++;
            }
            return valueAux;
           }else if (type == ComponentType.sortingCheckboxes){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.columnName + "-" +val.order;
                }else{
                    valueAux += ","+ val.columnName+ "-" +val.order;
                }                
                i++;
            }
            return valueAux;
          }else if (type == ComponentType.groupingAthena|| type == ComponentType.groupingMariaDB){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.columnName;
                }else{
                    valueAux += ","+ val.columnName;
                }                
                i++;
            }
            return valueAux;
          }else if (type == ComponentType.grouping || type == ComponentType.tailnumber || type == ComponentType.summary 
            || type == ComponentType.fareTypes || type == ComponentType.causesFlightDelaysCheckbox 
            || type == ComponentType.taxiTimesCheckboxes || type == ComponentType.cancelsCheckBox || type== ComponentType.diversionsCheckbox
            || type  == ComponentType.aircraftTypeCheckboxes
            || type == ComponentType.summaryRevenueBuilds){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.id;
                }else{
                    valueAux += ","+ val.id;
                }                
                i++;
            }
            return valueAux;
        }else if (type == ComponentType.selectBoxMultipleOption){
                var valueAux="";
                var i = 0;
                for(var val of value){
                    if(i == 0){
                        valueAux = val.name;
                    }else{
                        valueAux += ","+ val.name;
                    }                
                    i++;
                }
                return valueAux;
        }else if (type == ComponentType.datePeriod || type == ComponentType.datePeriodRevenue){
            if(value!=null){
              if(value.id!=null){
                  return value.id;
              }else{
                  return value;
              }
            }else{
                return "";
            }
        }else if(type == ComponentType.selectBoxSingleOption || type == ComponentType.functions){
            if(typeof value === "string"){
                return value;
            }
            if( typeof value.name === 'undefined'){
                 return '';
             }
            return value.name;
        }else if (type == ComponentType.selectBoxMultipleOption){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.name;
                }else{
                    valueAux += ","+ val.name;
                }                
                i++;
            }
            return valueAux;
        }else if (type == ComponentType.region){
            var valueAux="";
            var i = 0;
            for(var val of value){
                if(i == 0){
                    valueAux = val.value;
                }else{
                    valueAux += ","+ val.value;
                }                
                i++;
            }
            return valueAux;
    } 
            return value;
        }
    };

    getDateFormat(value, format){
        if(value != null){
            if(format == null){
                format = 'MM/dd/yyyy';
            }
            var datePipe = new DatePipe('en-US');
            return datePipe.transform(value, format);            
        }
        return value;
    }

}