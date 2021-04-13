import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(array: any[], field: string, order?: string): any[] {
    if (!Array.isArray(array)) {
      return array;
    }
    if (!order) {
      array.sort((a: any, b: any) => {
        if (a[field] < b[field]) {
          return -1;
        } else if (a[field] > b[field]) {
          return 1;
        } else {
          return 0;
        }
      });
    } else if (order && order === 'reverse') {
      array.sort((a: any, b: any) => {
        if (a[field] < b[field]) {
          return 1;
        } else if (a[field] > b[field]) {
          return -1;
        } else {
          return 0;
        }
      });
    }
    return array;
  }

}
