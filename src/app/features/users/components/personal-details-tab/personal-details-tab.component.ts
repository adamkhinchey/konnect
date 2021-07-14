import { Component, OnInit, Output, EventEmitter, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { GetRegionAndCountriesService } from '../../../../shared/services';
import { CreateProfilePersonalDetails, FileUploadConfigInterface } from '../../../../shared/models';
import { devLogger } from "../../../../shared/utils";


@Component({
  selector: 'app-personal-details-tab',
  templateUrl: './personal-details-tab.component.html',
  styleUrls: ['./personal-details-tab.component.scss']
})
export class PersonalDetailsTabComponent implements OnInit, OnDestroy, OnChanges {

  //OLD_MOBILE_REGEX = new RegExp(/^(?!(\d)\1+$)(?:\(?\+\d{1,3}\)?[- ]?|0)?\d{11}$/);
  MOBILE_REGEX = new RegExp(/^(?:0|\+[1-9]{1,3})\d{10,15}$/);
  EMAIL_REGEX = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/);
  @Input() personalDetails: any;
  @Output() moveToCompanyDetailsTab = new EventEmitter<CreateProfilePersonalDetails>();
  @Output() profileImageChangeEvent = new EventEmitter<File>();
  // @ts-ignore
  personalDetailsForm: FormGroup;
  timeZones = environment.timeZones;
  countries$ = this.getRegionAndCountriesService.getAllCountriesOnly();
  //personalDetails: CreateProfilePersonalDetails;
  profileImageConfig: FileUploadConfigInterface = {
    fileTypes: environment.imageFileAllowedFormats,
    size: environment.imageFileUploadSize
  };
  selectedProfileImage: File | undefined;
  selectedImageSrc: string | undefined;


  constructor(
    private fb: FormBuilder,
    private getRegionAndCountriesService: GetRegionAndCountriesService) {
  }

  ngOnInit(): void {
    this.getRegionAndCountriesService.getAllCountriesOnly();
    this.timeZones.unshift({ name: 'Select Timezone', val: '' });
    this.personalDetailsForm = this.fb.group({
      profileImage: [],
      firstName: ['', [Validators.required]],
      lastName: [''],
      email: ['', [Validators.required, Validators.pattern(this.EMAIL_REGEX)]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12)]],
      timeZone: [this.timeZones[0].val, [Validators.required]],
      mobileNumber: [''],
      city: ['', [Validators.required]],
      countryId: ['', [Validators.required]],
      inviteUID: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('personal details: ', changes.personalDetails.currentValue);
    if (this.personalDetails.email) {
      this.personalDetailsForm.controls['email'].setValue(this.personalDetails.email);
      this.personalDetailsForm.controls['firstName'].setValue(this.personalDetails.firstName);
      this.personalDetailsForm.controls['inviteUID'].setValue(this.personalDetails.inviteUID);
    }
  }

  checkValidation(): boolean {
    this.personalDetailsForm.markAllAsTouched();
    return this.personalDetailsForm.valid;
  }

  setSelectedImage(event: File): void {
    this.selectedImageSrc = URL.createObjectURL(event);
    this.selectedProfileImage = event;
    this.profileImageChangeEvent.emit(event);
    devLogger('log', { FILEEEEE: event });
  }

  ngOnDestroy(): void {
    if (this.selectedImageSrc) {
      URL.revokeObjectURL(this.selectedImageSrc);
    }
  }
}
