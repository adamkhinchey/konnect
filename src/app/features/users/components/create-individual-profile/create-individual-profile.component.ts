import {Component, OnInit} from '@angular/core';
import {NgWizardConfig, NgWizardService, STEP_STATE, StepChangedArgs, StepValidationArgs, THEME} from 'ng-wizard';
import {Observable, of} from 'rxjs';

@Component({
  selector: 'app-create-individual-profile',
  templateUrl: './create-individual-profile.component.html',
  styleUrls: ['./create-individual-profile.component.scss']
})
export class CreateIndividualProfileComponent implements OnInit {

  isValidTypeBoolean = true;

  stepStates = {
    normal: STEP_STATE.normal,
    disabled: STEP_STATE.disabled,
    error: STEP_STATE.error,
    hidden: STEP_STATE.hidden
  };

  config: NgWizardConfig = {
    selected: 0,
    theme: THEME.arrows,
    toolbarSettings: {
      showNextButton: false,
      showPreviousButton: false,
      toolbarExtraButtons: [
        {
          text: 'Finish', class: 'btn btn-info', event: () => {
            alert('Finished!!!');
          }
        }
      ],
    }
  };

  constructor(private ngWizardService: NgWizardService) {
  }

  showPreviousStep(event?: Event): void {
    this.ngWizardService.previous();
  }

  showNextStep(event?: Event): void {
    this.ngWizardService.next();
  }

  resetWizard(event?: Event): void {
    this.ngWizardService.reset();
  }

  setTheme(theme: THEME): void {
    this.ngWizardService.theme(theme);
  }

  stepChanged(args: StepChangedArgs): void {
    console.log(args.step);
  }

  isValidFunctionReturnsBoolean(args: StepValidationArgs): boolean {
    return true;
  }

  isValidFunctionReturnsObservable(args: StepValidationArgs): Observable<boolean> {
    return of(true);
  }

  ngOnInit(): void {
  }

}
