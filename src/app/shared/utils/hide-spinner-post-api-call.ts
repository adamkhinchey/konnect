import {finalize} from 'rxjs/operators';
import {NgxSpinnerService} from 'ngx-spinner';
import {MonoTypeOperatorFunction} from "rxjs";


export const hideSpinnerPostApiCall = <T>(spinner: NgxSpinnerService): MonoTypeOperatorFunction<T> => {
  return finalize<T>(() => {
    spinner.hide();
  });
};
