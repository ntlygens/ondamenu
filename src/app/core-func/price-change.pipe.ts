import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cloverUserPrice'
})
export class CloverUserPrice implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return (value / 100).toFixed(2);
  }

}

@Pipe({
  name: 'cloverDbPrice'
})
export class CloverDbPrice implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return (value * 100);
  }

}
