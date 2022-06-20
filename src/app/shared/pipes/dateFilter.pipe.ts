import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';
import * as moment from 'moment';

@Pipe({
  name: 'dateFilter'
})
export class DateFilterPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {
  }

  transform(value: any, format?: string): any {
    console.log('value in date pipe...', value);
    console.log('format...', format)
    if (!value) {
      return '';
    }
    format = format || 'short';
    return value ? this.datePipe.transform(value, format) : '';
  }

}