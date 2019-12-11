import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'categoryFilter'
})
export class FilterPipeArg implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if(!items) return [];
    if(!searchText) return items;
searchText = searchText.toLowerCase();
return items.filter( it => {
      return it.label.toLowerCase().includes(searchText);
    });
   }
}
