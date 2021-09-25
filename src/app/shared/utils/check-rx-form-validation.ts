import {FormGroup} from '@angular/forms';

const alwaysTruFn = () => true;

export function checkRxFormValidation(form: FormGroup, fn: (someArgs: any) => boolean = alwaysTruFn): boolean {
  console.log(form);
  form.markAllAsTouched();
  return form.valid && fn(null);
}
