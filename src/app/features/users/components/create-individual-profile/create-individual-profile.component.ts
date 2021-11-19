import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgWizardConfig, NgWizardService, STEP_STATE, StepChangedArgs, StepValidationArgs, THEME } from 'ng-wizard';
import { Observable, of, Subscription } from 'rxjs';
import { CreateProfilePersonalDetails, LoginUserProfile, SignupUserProfile } from '../../../../shared/models';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute, Router } from "@angular/router";
import { UploadFileService } from "../../../../shared/services";
import * as _ from 'lodash';
import { UpdateUserProfileService } from '../../services/update-user-profile.service';

@Component({
  selector: 'app-create-individual-profile',
  templateUrl: './create-individual-profile.component.html',
  styleUrls: ['./create-individual-profile.component.scss']
})
export class CreateIndividualProfileComponent implements OnInit, OnDestroy {

  isValidTypeBoolean = true;
  isLoggedInSubscription = new Subscription();
  personalDetails: CreateProfilePersonalDetails | undefined;
  user: LoginUserProfile | SignupUserProfile | undefined;
  createCompanyMode: { status: boolean, type: { soleTrader: boolean, inc: boolean } } = {
    status: false,
    type: { soleTrader: false, inc: false }
  };

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

  profileImage: File | null = null;
  uid: any;
  defaultCompanyId:number | null  | undefined;

  constructor(private ngWizardService: NgWizardService,
    private auth: AuthService,
    private router: Router,
    private uploadFileService: UploadFileService,
    private aroute: ActivatedRoute,
    public updateUserSrvc: UpdateUserProfileService
  ) {

    this.aroute.queryParams.subscribe(param => {
      if (param.uid)
        this.uid = param.uid;
    })
  }

  showPreviousStep(event?: Event): void {
    this.ngWizardService.previous();
  }

  showNextStep(personalDetails: CreateProfilePersonalDetails): void {
    if (this.profileImage) {
      this.uploadFileService.uploadFile(this.profileImage, (url: string) => {
        personalDetails.profileImage = url;
        this.auth.signup(personalDetails);
        this.personalDetails = personalDetails;
        if (this.uid) {
          if(this.defaultCompanyId){
            this.router.navigate(['home']);
          }else{
            this.ngWizardService.next();
          }

        }
      });
    } else {
      this.auth.signup(personalDetails);
      this.personalDetails = personalDetails;
      if (this.uid) {
        if(this.defaultCompanyId){
          this.router.navigate(['home']);
        }else{
          this.ngWizardService.next();
        }
      }
    }
  }

  resetWizard(event?: Event): void {
    this.ngWizardService.reset();
  }

  setTheme(theme: THEME): void {
    this.ngWizardService.theme(theme);
  }

  stepChanged(args: StepChangedArgs): void {

  }

  isValidFunctionReturnsBoolean(args: StepValidationArgs): boolean {
    return true;
  }

  isValidFunctionReturnsObservable(args: StepValidationArgs): Observable<boolean> {
    return of(true);
  }

  ngOnInit(): void {
    if (this.auth.getToken() && !this.uid) {
      this.router.navigate(['home']);
      return;
    }
    if (!this.uid) {
      this.isLoggedInSubscription = this.auth.isLoggedIn.subscribe(value => {
        if (value.status) {
          this.user = value.user;
          this.ngWizardService.next();
        }
      });
    }
    else {
      this.updateUserSrvc.getUserDataByUid(this.uid).subscribe((res: any) => {
        if(res.isPrivate == 1){
        this.auth.saveToken((res) as LoginUserProfile);
        this.auth.loggedIn = true;
        this.user = (res) as LoginUserProfile;
        this.user!.inviteUID = this.uid
        localStorage.setItem('userId', JSON.stringify(this.user.id));
        this.personalDetails = this.user as CreateProfilePersonalDetails;
        this.defaultCompanyId = this.user.defaultCompanyId;
        // this.ngWizardService.next();
      }else{
        this.auth.logout();
      }
      }, err => {
        console.log(err);
      });
      // this.isLoggedInSubscription = this.auth.isLoggedIn.subscribe(value => {
      //   alert(value);
      //   if (value.status) {
      //     this.user = value.user;
      //     this.ngWizardService.next();
      //   }
      // });
    }
  }

  getPersonalDetails() {
    if (this.personalDetails?.email != undefined || this.personalDetails?.email != '') {
      return this.personalDetails
    } else {
      return undefined;
    }
  }

  ngOnDestroy(): void {
    this.isLoggedInSubscription.unsubscribe();
  }

}
