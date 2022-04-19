import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import {
  GetRegionAndCountriesService,
  UploadFileService,
  UserInfoService,
  UserSettingsService
} from '../../../../shared/services';
import { Subscription } from 'rxjs';
import { checkRxFormValidation, devLogger } from '../../../../shared/utils';
import { ToastrService } from 'ngx-toastr';
import { UpdateUserProfileService } from '../../services/update-user-profile.service';
import { RemoveModalComponent } from '../../../../shared/components/modals/remove-modal/remove-modal.component';
import { FileUploadConfigInterface, LoginUserProfile, RemoveType } from '../../../../shared/models';
import { CompaniesService } from '../../services/companies.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-edit-individual-profile',
  templateUrl: './edit-individual-profile.component.html',
  styleUrls: ['./edit-individual-profile.component.scss']
})
export class EditIndividualProfileComponent implements OnInit, OnDestroy {

  //OLD_MOBILE_REGEX = new RegExp(/^(?!(\d)\1+$)(?:\(?\+\d{1,3}\)?[- ]?|0)?\d{11}$/);
  MOBILE_REGEX = new RegExp(/^(?:0|\+[1-9]{1,3})\d{10,15}$/);
  EMAIL_REGEX = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,20}))$/);

  @ViewChild(RemoveModalComponent) removeModal: RemoveModalComponent | undefined;

  modalReference: any;
  timeZones = environment.timeZones;
  countries: { val: any, name: any, regionId: any }[] = [];
  editProfileForm = this.fb.group({
    profileImage: [],
    firstName: ['', [Validators.required]],
    lastName: [''],
    email: ['', [Validators.required, Validators.pattern(this.EMAIL_REGEX)]],
    recoveryEmail: ['', [Validators.pattern(this.EMAIL_REGEX)]],
    timeZone: [null, [Validators.required]],
    mobileNumber: [''],
    city: ['', [Validators.required]],
    countryId: ['', [Validators.required]],
    id: [null, [Validators.required]],
    defaultCompanyId: [null, [Validators.required]],
    headline: [''],
    aboutMe: ['']
  });

  userInfoSubscription = new Subscription();
  userInfo: any = null;

  companyIdToDissociate: number | null = null;
  removeMessage: any;
  removalType: RemoveType | null | undefined;
  profileImageConfig: FileUploadConfigInterface = {
    fileTypes: environment.imageFileAllowedFormats,
    size: environment.imageFileUploadSize
  };
  selectedImageSrc: string | undefined;
  private selectedProfileImage: File | undefined;
  userId: any = 0;
  loginUserId: any = 0;
  isView: any;
  isEmailVerified:boolean=true;
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private getRegionAndCountriesService: GetRegionAndCountriesService,
    private userInfoService: UserInfoService,
    private toaster: ToastrService,
    private updateUserProfileService: UpdateUserProfileService,
    private companyService: CompaniesService,
    private authService: AuthService,
    private router: Router,
    public aroute: ActivatedRoute,
    private fileUploadService: UploadFileService,
    private userSettingsService: UserSettingsService) {
    this.aroute.queryParams.subscribe(param => {
      if (param.isView)
        this.isView = param.isView;
    })
  }

  changeConfig() {
    if (this.isView) this.config.editable = false;
    else this.config.editable = true;
  }

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');
    // this.isView = localStorage.getItem('isView');
    localStorage.removeItem('userId');
    localStorage.removeItem('isView');
    this.getAndSetCountries();
    this.loginUserId = this.authService.getUserInfo().id
  }

  private getAndSetCountries(): void {
    this.getRegionAndCountriesService.getAllCountriesOnly().subscribe((value) => {
      this.countries = value;
    }, err => {
      devLogger('error', err);
    }, () => {
      this.fetchUserInfo();
    });
  }

  private fetchUserInfo(): void {
    this.userInfoSubscription = this.userInfoService.getInfo(this.userId).subscribe((value) => {
      this.userInfo = value;
      this.isEmailVerified = value.is_email_verified;
      if(this.loginUserId !=  this.userInfo.id){
        this.isEmailVerified = true;
      }
      this.populateFormValues();
      this.userSettingsService.populateSettings(value);
    }, err => {
      devLogger('error', { err });
    });
  }

  private populateFormValues(): void {
    this.editProfileForm.get('profileImage')?.setValue(this.userInfo.profileImage);
    this.editProfileForm.get('firstName')?.setValue(this.userInfo?.firstName);
    this.editProfileForm.get('lastName')?.setValue(this.userInfo?.lastName);
    this.editProfileForm.get('email')?.setValue(this.userInfo?.email);
    this.editProfileForm.get('mobileNumber')?.setValue(this.userInfo?.mobile?.trim());
    this.editProfileForm.get('recoveryEmail')?.setValue(this.userInfo?.recoveryEmail);
    let timeZoneIndex = this.timeZones.findIndex(timeZone => {
      const receivedTz = typeof this.userInfo?.timeZone === 'string' ?
        JSON.parse(this.userInfo?.timeZone) : this.userInfo?.timeZone;
      return timeZone.val === receivedTz?.val &&
        timeZone.name.trim().toLocaleLowerCase() === receivedTz?.name.trim().toLocaleLowerCase();
    });
    if (timeZoneIndex === -1) {
      timeZoneIndex = 0;
    }
    this.editProfileForm.get('timeZone')?.setValue(this.timeZones[timeZoneIndex]);
    this.editProfileForm.get('mobileNumber')?.setValue(this.userInfo?.mobile);
    this.editProfileForm.get('city')?.setValue(this.userInfo?.city);

    let countryIndex = this.countries.findIndex(country => {
      return country.val === this.userInfo?.countryId;
    });
    if (countryIndex === -1) {
      countryIndex = 0;
    }

    this.editProfileForm.get('countryId')?.setValue(this.countries[countryIndex].val);
    this.editProfileForm.get('id')?.setValue(this.userInfo?.id);
    const defaultCompanyId = this.userInfo?.associatedCompanies
      // @ts-ignore
      .filter(({ isDefault }) => isDefault === 1)[0]?.id || null;
    if (defaultCompanyId) {
      this.editProfileForm.get('defaultCompanyId')?.setValue(defaultCompanyId);
    } else {
      this.editProfileForm.removeControl('defaultCompanyId');
    }
    this.editProfileForm.get('headline')?.setValue(this.userInfo?.headline);
    this.editProfileForm.get('aboutMe')?.setValue(this.userInfo?.aboutMe);
  }

  confirmRemoveCompany(companyId: number, index: number, isDefaultCmp: boolean): void {
    if (isDefaultCmp) {
      this.toaster.error('Currently this is your default company, please mark other company as default and save your changes first',
        'Cannot remove default company');
      return;
    }
    this.companyIdToDissociate = companyId;
    this.removalType = RemoveType.COMPANY;
    this.removeMessage = 'Are you sure you want to remove this company from your profile?';
    this.modalReference = this.modalService.open(this.removeModal?.content, {
      centered: true,
      size: 'md',
    });
  }

  confirmDeleteUserProfile(event: MouseEvent): void {
    event.preventDefault();
    this.removalType = RemoveType.USER;
    this.removeMessage = 'Are you sure you want to delete your profile?';
    this.modalReference = this.modalService.open(this.removeModal?.content, {
      centered: true,
      size: 'md',
    });
  }

  uploadImageAndUpdateProfile(event: MouseEvent): void {
    event.preventDefault();
    if (this.selectedProfileImage) {
      this.fileUploadService.uploadFile(this.selectedProfileImage, (url) => {
        this.editProfileForm.get('profileImage')?.setValue(url);
        this.updateProfile();
      });
    } else {
      this.updateProfile();
    }
  }

  updateProfile(): void {
    this.updateUserProfileService.update(this.editProfileForm.value)
      .subscribe((data) => {
        if (data) {
          this.toaster.success('Profile updated successfully');
          this.fetchUserInfo();
        }
      }, err => {
        devLogger('error', err);
      });

  }

  checkValidityOfForm(event: MouseEvent): boolean {
    event.preventDefault();
    return checkRxFormValidation(this.editProfileForm);
  }

  private removeCompany(): void {
    this.companyService.dissociate({ companyId: this.companyIdToDissociate }).subscribe(
      value => {
        this.toaster.success('Company Dissociated Successfully');
        this.companyIdToDissociate = null;
      },
      err => {
        devLogger('error', err);
        this.companyIdToDissociate = null;
      },
      () => {
        this.fetchUserInfo();
        this.companyIdToDissociate = null;
      }
    );
  }

  private deleteUserProfile(): void {
    this.authService.deleteUserProfile({ userId: this.userInfo.id }).subscribe(
      value => {
        this.toaster.success('Your profile is deleted now');
        this.companyIdToDissociate = null;
        this.authService.logout();
      },
      err => {
        devLogger('error', err);
        this.companyIdToDissociate = null;
      },
      () => {
        this.companyIdToDissociate = null;
      }
    );
  }

  confirmRemove(event: RemoveType | null | undefined): void {
    if (!event) {
      return;
    }
    if (event === RemoveType.COMPANY) {
      this.removeCompany();
    } else if (event === RemoveType.USER) {
      this.deleteUserProfile();
    }
    this.modalReference?.dismiss('Confirmed');
  }

  cancelRemove(event: RemoveType | null | undefined): void {
    if (this.companyIdToDissociate) {
      this.companyIdToDissociate = null;
    }
    this.removalType = null;
    this.removeMessage = null;
    this.modalReference?.dismiss('Confirmed');
  }

  navigateToJoinCreateCompany(event: MouseEvent): void {
    event.preventDefault();
    this.router.navigate(['home', 'join-company'], {
      state: { navigateToPostCreate: this.router.url }
    });
  }

  ngOnDestroy(): void {
    this.userInfoSubscription.unsubscribe();
    localStorage.removeItem('userId');
    localStorage.removeItem('isView');
  }

  setSelectedImage(event: File): void {
    this.selectedImageSrc = URL.createObjectURL(event);
    this.selectedProfileImage = event;
    devLogger('log', { FILEEEEE: event });
  }

  goToCompanyProfile(companyId: any, isPrivate: any) {
    if (companyId) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/company/manage-company?isView=' + true);
    }
  }

  resendEmailVerification(){
    this.updateUserProfileService.resendEmailVerificationLink().subscribe((value) => {
      if(value.code == 200){
        this.toaster.success(value.message);
      }else{
        this.toaster.error(value.message);
      }
    }, err => {
      this.toaster.error('Something went wrong!');
      devLogger('error', { err });
    });
  }

}
