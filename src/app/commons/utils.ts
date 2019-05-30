
import { CategoryArguments } from "../model/CategoryArguments";
import { Arguments } from "../model/Arguments";
import { ComponentType } from "./ComponentType";
import { DateTimeFormatPipe } from "./DateTimeFormatPipe";
import { DateFormatPipe } from "./DateFormatPipe ";
import { Constants } from "./Constants ";
import { DatePipe } from "@angular/common";
import { componentNeedsResolution } from "@angular/core/src/metadata/resource_loading";
import { ComponentFactory } from '@angular/core/src/render3';

export class Utils{

    notificationMessage: string;
    notificationShow: boolean;
    notificationType: string;

    showAlert(type:string, message: string){
        this.notificationShow=true;
        this.notificationType= type;
        this.notificationMessage = message;
    }

    isJSONEmpty(obj): boolean
    {
      if (obj == null)
        return true;
  
      for (let key in obj)
      {
        if (obj.hasOwnProperty (key))
          return false;
      }
  
      return true;
    }

    isEmpty (value: string){
        if(value == null || value == ''){
            return true;
        }
        return false;
    }

    getUrlParameters(option: any, urlBase:boolean){
        this.consoleLog(option);
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
        
        if(option.baseUrl && urlBase){
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

    getArguments(argument: Arguments)
    {
        let args = '';

        if (argument.name1)
            args = argument.name1 + "=" + this.getValueFormat (argument.type, argument.value1,argument);

        if (argument.name2)
        {
            if (args !== '')
                args += "&";

            args += argument.name2 + "=" + this.getValueFormat (argument.type, argument.value2,argument);          
        }

        if (argument.name3)
        {
            if (args !== '')
                args += "&";

            args += argument.name3 + "=" + this.getValueFormat (argument.type, argument.value3,argument);
        }

        return args;
    }

    getArguments2(argument: Arguments, parentCategoryId, categoryFilter)
    {
        let args = '';

        if (argument.name1 != null && argument.name1.toLowerCase ().includes ("date"))
        {
            let dateVal1, dateVal2, numSlashes;

            numSlashes = -1;

            // check number of slashes if the value to filter is a date format
            if (parentCategoryId.includes ("date"))
            {
              let numSlashes = 0;
        
              for (let i = 0; i < categoryFilter.length; i++)
              {
                if (categoryFilter[i] == '/')
                  numSlashes++;
              }
        
              if (numSlashes > 2)
                numSlashes = 2;
            }
            else if (parentCategoryId.includes ("year"))
              numSlashes = 0;
            else if (parentCategoryId.includes ("month"))
              numSlashes = 1;
            else if (parentCategoryId.includes ("day"))
              numSlashes = 2;
        
            // set special values for date formats depending of the number of slashes,
            // -1 if not a date format
            if (numSlashes != -1)
            {
              if (!numSlashes)
              {
                // from January 1 to December 31
                dateVal1 = categoryFilter + "0101";
                dateVal2 = categoryFilter + "1231";
              }
              else
              {
                let year, month;
                let lastDay = {
                  "01" : 31,    // January
                  "02" : 28,    // February
                  "03" : 31,    // March
                  "04" : 30,    // April
                  "05" : 31,    // May
                  "06" : 30,    // June
                  "07" : 31,    // July
                  "08" : 31,    // August
                  "09" : 30,    // September
                  "10" : 31,    // October
                  "11" : 30,    // November
                  "12" : 31     // December
                };
        
                year = categoryFilter.slice (0, 4);
                month = categoryFilter.slice (5, 7);
        
                if (numSlashes == 2)
                {
                  let day = categoryFilter.slice (8, 10);
        
                  // use the same day for the date values
                  dateVal1 = dateVal2 = year + month + day;
                }
                else
                {
                  // from the first day of the month to the last one
                  dateVal1 = year + month + "01";
                  dateVal2 = year + month + lastDay[month];
                }
              }
            }

            args = argument.name1 + "=" + dateVal1 + "&" + argument.name2 + "=" + dateVal2;
        }
        else if (argument.name1 != null && argument.name1.toLowerCase ().includes ("origin"))
        {
            if (parentCategoryId.includes ("origin"))
                args = argument.name1 + "=" + categoryFilter + "&" + argument.name2 + "=";
            else
                args = argument.name1 + "=&" + argument.name2 + "=" + categoryFilter;
        }
        else
        {
            // Duplicate the value into the three parameters
            if (argument.name1)
                args = argument.name1 + "=" + categoryFilter;

            if (argument.name2)
                args += "&" + argument.name2 + "=" + categoryFilter;

            if (argument.name3)
                args += "&" + argument.name3 + "=" + categoryFilter;
        }

        return args;
    }

    getValueFormat(type: string, value:any,argument:any){
        if( typeof value === 'undefined'){
            return '';
        }
        if(argument.url!=null && argument.url!='' && type != ComponentType.sortingCheckboxes){
            var valueAux="";
            var i = 0;
            if(value!=null){
                if(Array.isArray(value)){
                    for(var val of value){
                        if(i == 0){
                            valueAux = val[argument.selectedAttribute];
                        }else{
                            valueAux += ","+ val[argument.selectedAttribute];
                        }                
                        i++;
                    }
                }else{
                    return value[argument.selectedAttribute];
                }
            }else{
                return '';
            }
            return valueAux;
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
             || type == ComponentType.groupingHubSummaries || type == ComponentType.groupingDailyStatics || type == ComponentType.groupingOperationsSummary || type == ComponentType.groupingOpSum
             || type == ComponentType.groupingOpSum2 || type == ComponentType.fareIncrementsMarketHistograms|| type == ComponentType.sortingNostop || type == ComponentType.sortingConnectionBuilder){
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
        }else if(type == ComponentType.summary || type == ComponentType.fareTypes 
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
          }else if (type == ComponentType.groupingAthena || type == ComponentType.groupingMariaDB || type == ComponentType.groupingCompGenre || type == ComponentType.groupingCompTotal){
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
        }else if (type == ComponentType.totalType || type == ComponentType.flightSegments || type == ComponentType.states
            || type == ComponentType.flightDelaysCheckbox){
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


    getValueFormatView(type: string, value:any,argument:any){
        if(value!=null){
            if( typeof value === 'undefined'){
                return '';
            }
            if(argument.url!=null && argument.url!='' && type != ComponentType.sortingCheckboxes){
                var valueAux="";
                var i = 0;
                if(Array.isArray(value)){
                    for(var val of value){
                        if(i == 0){
                            valueAux = val[argument.selectedAttribute];
                        }else{
                            valueAux += ","+ val[argument.selectedAttribute];
                        }                
                        i++;
                    }
                }else{
                    return value[argument.selectedAttribute];
                }
    
                return valueAux;
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
                 || type == ComponentType.groupingHubSummaries || type == ComponentType.groupingDailyStatics || type == ComponentType.groupingOperationsSummary|| type == ComponentType.groupingOpSum
                 || type == ComponentType.groupingOpSum2 || type == ComponentType.fareIncrementsMarketHistograms|| type == ComponentType.sortingNostop || type == ComponentType.sortingConnectionBuilder){
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
          }else if (type == ComponentType.groupingAthena|| type == ComponentType.groupingMariaDB || type == ComponentType.groupingMariaDB || type == ComponentType.groupingCompGenre || type == ComponentType.groupingCompTotal){
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
          }else if (type == ComponentType.grouping || type == ComponentType.summary 
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
        }else if (type == ComponentType.selectBoxMultipleOption || type == ComponentType.totalType){
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
        }else if ( type == ComponentType.totalType || type == ComponentType.flightSegments || type == ComponentType.states){
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
        }else if (type == ComponentType.region || type == ComponentType.flightDelaysCheckbox){
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
    }

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

    rad2degr(rad)
    {
        return rad * 180 / Math.PI;
    }

    degr2rad(degr)
    {
        return degr * Math.PI / 180;
    }

    consoleLog(message)
    {
        if (window.console)
        {
            console.log (message);
            console.debug (message);
        }
    }
}