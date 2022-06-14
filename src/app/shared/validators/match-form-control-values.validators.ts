import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function matchControlValues(compareToControl: FormControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const val = compareToControl?.value;
    const repeatedVal = control.value;
    const isEqual = val === repeatedVal;
    return !isEqual ? { notMatching: { value: control.value } } : null;
  };
}

// custom validator to check that no white space in starting of input
export function noWhiteSpace(
  control: AbstractControl
): ValidationErrors | null | any {
  if (control.errors && !control.errors.whitespace) {
    return;
  }
  let value = control.value;
  console.log('value...', value);
  if (value && value != null) {
    value = value.replaceAll(/(<([^>]+)>)/gi, '');
    value = value.replaceAll(/&nbsp;/gi, '');
  }

  const isWhitespace = (value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { whitespace: true };
}
