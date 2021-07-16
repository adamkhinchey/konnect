import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-manage-company',
  templateUrl: './manage-company.component.html',
  styleUrls: ['./manage-company.component.scss']
})
export class ManageCompanyComponent implements OnInit, OnDestroy {
  WEBSITE_REGEX = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[\w]{2,3}(\/\S*)?$/
  //WEBSITE_REGEX = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$/;
  //OLD_MOBILE_REGEX = new RegExp(/^(?!(\d)\1+$)(?:\(?\+\d{1,3}\)?[- ]?|0)?\d{11}$/);
  MOBILE_REGEX = new RegExp(/^(?:0|\+[1-9]{1,3})\d{10,15}$/);
  EMAIL_REGEX = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/);

  @ViewChild(RemoveModalComponent) removeModal: RemoveModalComponent | undefined;

  modalReference: any;
  timeZones = environment.timeZones;
  countries: { val: any, name: any, regionId: any }[] = [];
  categories: { id: any, name: any }[] = [];
  editProfileForm = this.fb.group({
    profileImage: [],
    firstName: ['', [Validators.required]],
    lastName: [''],
    email: ['', [Validators.required, Validators.pattern(this.EMAIL_REGEX)]],
    recoveryEmail: ['', [Validators.pattern(this.EMAIL_REGEX)]],
    timeZone: [null, [Validators.required]],
    mobileNumber: ['', [Validators.pattern(this.MOBILE_REGEX)]],
    city: ['', [Validators.required]],
    countryId: ['', [Validators.required]],
    id: [null, [Validators.required]],
    defaultCompanyId: [null, [Validators.required]],
    headline: [''],
    aboutMe: ['']
  });

  editCompanyForm = this.fb.group({
    companyId: [null, [Validators.required]],
    companyProfileImage: [],
    companyName: ['', [Validators.required]],
    companyTaxNumber: [''],
    streetAddress1: [''],
    streetAddress2: [''],
    city: ['', [Validators.required]],
    state: [''],
    postCode: ['', [Validators.pattern("^[0-9]*$")]],
    countryId: ['', [Validators.required]],
    phone: [''],
    website: ['', [Validators.required, Validators.pattern(this.WEBSITE_REGEX)]],
    category: [null, [Validators.required]],
    description: [''],
  });

  userInfoSubscription = new Subscription();
  userInfo: any = null;
  companyInfo: any = null;

  companyIdToDissociate: number | null = null;
  removeMessage: any;
  removalType: RemoveType | null | undefined;
  profileImageConfig: FileUploadConfigInterface = {
    fileTypes: environment.imageFileAllowedFormats,
    size: environment.imageFileUploadSize
  };
  selectedImageSrc: string | undefined;
  private selectedProfileImage: File | undefined;
  companyId: any;
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    enableCheckAll: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    //itemsShowLimit: 3,
    allowSearchFilter: true,
  };
  selectedCategory: any = [];
  company: any;
  isView: any;
  private userSettingsSub: Subscription | undefined;
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
    private userSettingsService: UserSettingsService,
    public route: ActivatedRoute
  ) {
    this.aroute.queryParams.subscribe(param => {
      if (param.isView)
        this.isView = param.isView;
    })
  }

  ngOnInit() {

    let companyId = localStorage.getItem('companyId');
    // this.isView = localStorage.getItem('isView');
    // this.company = this.userSettingsService.settings.getValue();
    if (companyId != null) {
      console.log('company id not null')
      this.companyId = companyId
      localStorage.removeItem('companyId');
      localStorage.removeItem('isView');
      this.getAndSetCountries();
    }
    else {
      this.userSettingsSub = this.userSettingsService.settings.subscribe((value) => {
        console.log(value);
        this.company = value
        if (this.company) {
          console.log('in if')
          this.companyId = this.company.defaultCompany.id
          this.getAndSetCountries();
        }
      });
    }
  }

  getCompanyDetails() {
    this.companyService.getCompanyDetails(this.companyId).subscribe((res: any) => {
      console.log(res);
      this.companyInfo = res;
      this.populateCompanyFormValues();
    }, err => {
      devLogger('error', err);
    })
  }

  private getAndSetCountries(): void {
    this.getRegionAndCountriesService.getAllCountriesOnly().subscribe((value) => {
      this.countries = value;
    }, err => {
      devLogger('error', err);
    }, () => {
      this.getCategories();
    });
  }

  getCategories() {
    this.companyService.getCategoryList().subscribe((value) => {
      console.log(value);
      this.categories = value.categoryList
    }, err => {
      devLogger('error', err);
    }, () => {
      this.getCompanyDetails();
    })
  }

  // private fetchUserInfo(): void {
  //   this.userInfoSubscription = this.userInfoService.getInfo().subscribe((value) => {
  //     this.userInfo = value;
  //     console.log(this.userInfo);
  //     this.populateFormValues();
  //     this.userSettingsService.populateSettings(value);
  //   }, err => {
  //     devLogger('error', { err });
  //   });
  // }

  private populateCompanyFormValues(): void {
    this.editCompanyForm.get('companyId')?.setValue(this.companyInfo?.company.id);
    this.editCompanyForm.get('companyProfileImage')?.setValue(this.companyInfo.company.companyProfileImage);
    this.editCompanyForm.get('companyName')?.setValue(this.companyInfo?.company.companyName);
    this.editCompanyForm.get('companyTaxNumber')?.setValue(this.companyInfo?.company.companyTaxNumber);
    this.editCompanyForm.get('streetAddress1')?.setValue(this.companyInfo?.company.streetAddress1);
    this.editCompanyForm.get('streetAddress2')?.setValue(this.companyInfo?.company.streetAddress2);
    this.editCompanyForm.get('city')?.setValue(this.companyInfo?.company.city);
    this.editCompanyForm.get('state')?.setValue(this.companyInfo?.company.state);
    this.editCompanyForm.get('postCode')?.setValue(this.companyInfo?.company.postCode);
    let countryIndex = this.countries.findIndex(country => {
      return country.val === this.companyInfo?.company.countryId;
    });
    if (countryIndex === -1) {
      countryIndex = 0;
    }
    this.editCompanyForm.get('countryId')?.setValue(this.countries[countryIndex].val);
    this.editCompanyForm.get('phone')?.setValue(this.companyInfo?.company.phone?.trim());
    this.editCompanyForm.get('website')?.setValue(this.companyInfo?.company.website);
    this.editCompanyForm.get('category')?.setValue(this.companyInfo?.company.category);
    this.editCompanyForm.get('description')?.setValue(this.companyInfo?.company.description);
    for (let i = 0; i < this.companyInfo?.company?.category?.length; i++) {
      let data = this.categories.filter((val: any) => {
        return val.id == this.companyInfo?.company.category[i];
      })
      this.selectedCategory.push(data[0]);
    }
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
        // this.editProfileForm.get('profileImage')?.setValue(url);
        this.editCompanyForm.get('companyProfileImage')?.setValue(url);
        this.updateCompanyProfile();
      });
    } else {
      this.updateCompanyProfile();
    }
  }

  updateProfile(): void {
    this.updateUserProfileService.update(this.editProfileForm.value)
      .subscribe((data) => {
        if (data) {
          this.toaster.success('Profile updated successfully');
          // this.fetchUserInfo();
        }
      }, err => {
        devLogger('error', err);
      });

  }

  checkValidityOfForm(event: MouseEvent): boolean {
    event.preventDefault();
    return checkRxFormValidation(this.editCompanyForm);
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
        this.getCompanyDetails();
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
    this.userSettingsSub?.unsubscribe();
    localStorage.removeItem('companyId');
    localStorage.removeItem('isView');
  }

  setSelectedImage(event: File): void {
    this.selectedImageSrc = URL.createObjectURL(event);
    this.selectedProfileImage = event;
    devLogger('log', { FILEEEEE: event });
  }

  updateCompanyProfile(): void {
    if (this.company.isAdmin) {
      this.editCompanyForm.get('category')?.setValue(this.selectedCategory.map((ct: any) => ct.id));
      this.companyService.updateCompanyProfile(this.editCompanyForm.value)
        .subscribe((data) => {
          if (data) {
            this.toaster.success('Company profile updated successfully');
            // this.router.navigate(['home']);
          }
        }, err => {
          devLogger('error', err);
        });
    } else {
      this.toaster.info('Only company admin can edit details', 'Info');
    }
  }

  markCategoryTouched(): void {
    this.editCompanyForm.get('category')?.markAsTouched({ onlySelf: true });
  }

  onCategoryChange(event: { id: number, val: string }[]): void {
    console.log(event);
    if (event) {
      if (event.length === 0) {
        this.editCompanyForm.get('category')?.setValue(null);
      } else {
        this.editCompanyForm.get('category')?.setValue(event.map(ct => ct.id));
      }
    }
    console.log(this.selectedCategory);
  }

  goToUserProfile(userId: any, isPrivate: any) {
    console.log(userId);
    if (userId && isPrivate == 0) {
      localStorage.setItem('userId', JSON.stringify(userId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/edit-profile?isView=' + true);
    }
  }

}
