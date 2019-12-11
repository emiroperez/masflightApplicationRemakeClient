import { Pipe, PipeTransform } from '@angular/core';
import { AdminArgumentsGroupComponent } from './admin-arguments-group.component';

@Pipe({
  name: 'groupFilter'
})
export class FilterPipeGroupArg implements PipeTransform {
  
  transform(items: any[], searchText: string): any[] {
    if(!items) return [];
    if(!searchText) return items;
searchText = searchText.toLowerCase();
return items.filter( it => {
      return it.name.toLowerCase().includes(searchText);
    });
   }
}
//   constructor( public Airport: AdminArgumentsGroupComponent){
//   }
//   transform(items: any[], searchText: string): any[] {
//     if(!items) return [];
//     if(!searchText) return items;    
//     searchText = searchText.toLowerCase();
    
//     if(searchText.length >= 3){
//       return items.filter( it => {
//             let aux = it.iata + ' - ' +it.name;
//             return aux.toLowerCase().includes(searchText);
//           });
//         }
//     }// end length != 2

// }
