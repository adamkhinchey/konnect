import { Injectable } from '@angular/core';
import {LocationStrategy, PathLocationStrategy} from "@angular/common";

@Injectable()
export class OnlyPrimaryLocationStrategy extends PathLocationStrategy implements LocationStrategy {
  static readonly AUX_ROUTE_SEPERATOR = '//';

  replaceState(state: any, title: string, url: string, queryParams: string): void {
    super.replaceState(state, title, this.preprocessUrl(url), queryParams);
  }

  pushState(state: any, title: string, url: string, queryParams: string): void {
    super.pushState(state, title, this.preprocessUrl(url), queryParams);
  }

  preprocessUrl(url: string): string {
    if (url.includes(OnlyPrimaryLocationStrategy.AUX_ROUTE_SEPERATOR)) {
      if (url.split(OnlyPrimaryLocationStrategy.AUX_ROUTE_SEPERATOR).length > 2) {
        throw new Error(
          'Usage for more than one auxiliary route on the same level detected - please recheck imlementation'
        );
      }
      return url.split(OnlyPrimaryLocationStrategy.AUX_ROUTE_SEPERATOR)[0].replace('(', '');
    } else {
      return url;
    }
  }
}
