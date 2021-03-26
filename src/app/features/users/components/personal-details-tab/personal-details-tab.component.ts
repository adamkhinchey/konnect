import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {environment} from '../../../../../environments/environment';
import {GetRegionAndCountriesService} from '../../../../shared/services/get-region-and-countries.service';

// const EMAIL_REGX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
  selector: 'app-personal-details-tab',
  templateUrl: './personal-details-tab.component.html',
  styleUrls: ['./personal-details-tab.component.scss']
})
export class PersonalDetailsTabComponent implements OnInit {
  @Output() moveToCompanyDetailsTab = new EventEmitter();

  // @ts-ignore
  personalDetailsForm: FormGroup;
  timeZones = environment.timeZones;
  countries$ = this.getRegionAndCountriesService.getAllCountriesOnly();

  constructor(
    private fb: FormBuilder,
    private getRegionAndCountriesService: GetRegionAndCountriesService) {
  }

  ngOnInit(): void {
    this.getRegionAndCountriesService.getAllCountriesOnly();
    this.timeZones.unshift({name: 'Select Timezone', val: ''});
    this.personalDetailsForm = this.fb.group({
      profileImage: [],
      firstName: ['', [Validators.required]],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12)]],
      timeZone: [this.timeZones[0].val, [Validators.required]],
      mobile: [''],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]]
    });
  }

  checkValidation(): boolean {
    this.personalDetailsForm.markAllAsTouched();
    return this.personalDetailsForm.valid;
  }
}
