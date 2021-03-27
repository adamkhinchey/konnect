import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgWizardConfig, NgWizardService, STEP_STATE, StepChangedArgs, StepValidationArgs, THEME} from 'ng-wizard';
import {Observable, of, Subscription} from 'rxjs';
import {CreateProfilePersonalDetails} from '../../../../shared/models';
import {AuthService} from '../../../../core/services/auth.service';

@Component({
  selector: 'app-create-individual-profile',
  templateUrl: './create-individual-profile.component.html',
  styleUrls: ['./create-individual-profile.component.scss']
})
export class CreateIndividualProfileComponent implements OnInit, OnDestroy {

  isValidTypeBoolean = true;
  isLoggedInSubscription = new Subscription();

  stepStates = {
    normal: STEP_STATE.normal,
    disabled: STEP_STATE.disabled,
    error: STEP_STATE.error,
    hidden: STEP_STATE.hidden
  };

  companyDetailsTabState = this.stepStates.normal;
  personalDetailsTabState = this.stepStates.normal;

  config: NgWizardConfig = {
    selected: 0,
    theme: THEME.arrows,
    toolbarSettings: {
      showNextButton: false,
      showPreviousButton: false,
    },
    anchorSettings: {
      anchorClickable: false,
    }
  };

  constructor(private ngWizardService: NgWizardService, private auth: AuthService) {
  }

  showPreviousStep(event?: Event): void {
    this.ngWizardService.previous();
  }

  showNextStep(personalDetails: CreateProfilePersonalDetails): void {
    this.auth.signup(personalDetails);
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
    this.isLoggedInSubscription = this.auth.isLoggedIn.subscribe((value?: boolean) => {
      if (value) {
        this.ngWizardService.next();
      }
    });
  }

  ngOnDestroy(): void {
    this.isLoggedInSubscription.unsubscribe();
  }

}
