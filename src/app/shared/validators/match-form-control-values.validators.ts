import {AbstractControl, FormControl, ValidatorFn} from '@angular/forms';

export function matchControlValues(compareToControl: FormControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const val = compareToControl?.value;
    const repeatedVal = control.value;
    const isEqual = val === repeatedVal;
    console.log(`${isEqual}=${val}===${repeatedVal}`);
    return !isEqual ? {notMatching: {value: control.value}} : null;
  };
}
