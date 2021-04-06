import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, Validators} from '@angular/forms';
import {environment} from '../../../../../environments/environment';
import {GetRegionAndCountriesService, UserInfoService} from '../../../../shared/services';
import {Subscription} from 'rxjs';
import {checkRxFormValidation, devLogger} from '../../../../shared/utils';
import {ToastrService} from 'ngx-toastr';
import {UpdateUserProfileService} from '../../services/update-user-profile.service';
import {RemoveModalComponent} from '../../../../shared/components/modals/remove-modal/remove-modal.component';
import {LoginUserProfile, RemoveType} from '../../../../shared/models';
import {CompaniesService} from '../../services/companies.service';
import {AuthService} from '../../../../core/services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-edit-individual-profile',
  templateUrl: './edit-individual-profile.component.html',
  styleUrls: ['./edit-individual-profile.component.scss']
})
export class EditIndividualProfileComponent implements OnInit, OnDestroy {

  @ViewChild(RemoveModalComponent) removeModal: RemoveModalComponent | undefined;

  modalReference: any;
  timeZones = environment.timeZones;
  countries: { val: any, name: any, regionId: any }[] = [];
  editProfileForm = this.fb.group({
    profileImage: [],
    firstName: ['', [Validators.required]],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    recoveryEmail: ['', [Validators.email]],
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
  userInfo: any = {};

  companyIdToDissociate: number | null = null;
  removeMessage: any;
  removalType: RemoveType | null | undefined;

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
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.getAndSetCountries();
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
    this.userInfoSubscription = this.userInfoService.getInfo().subscribe((value) => {
      this.userInfo = value;
      this.populateFormValues();
    }, err => {
      devLogger('error', {err});
    });
  }

  private populateFormValues(): void {
    this.editProfileForm.get('firstName')?.setValue(this.userInfo?.firstName);
    this.editProfileForm.get('lastName')?.setValue(this.userInfo?.lastName);
    this.editProfileForm.get('email')?.setValue(this.userInfo?.email);
    this.editProfileForm.get('recoveryEmail')?.setValue(this.userInfo?.recoveryEmail);
    let timeZoneIndex = this.timeZones.findIndex(timeZone => {
      const receivedTz = typeof this.userInfo?.timeZone === 'string' ?
        JSON.parse(this.userInfo?.timeZone) : this.userInfo?.timeZone;
      return timeZone.val === receivedTz?.val;
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
      .filter(({isDefault}) => isDefault === 1)[0]?.id || null;
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

  updateProfile(event: MouseEvent): void {
    event.preventDefault();
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
    this.companyService.dissociate({companyId: this.companyIdToDissociate}).subscribe(
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
    this.authService.deleteUserProfile({userId: this.userInfo.id}).subscribe(
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
      state: {navigateToPostCreate: this.router.url}
    });
  }

  ngOnDestroy(): void {
    this.userInfoSubscription.unsubscribe();
  }

}
