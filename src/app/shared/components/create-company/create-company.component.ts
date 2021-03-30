import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {GetRegionAndCountriesService} from '../../services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IDropdownSettings} from 'ng-multiselect-dropdown';
import {environment} from '../../../../environments/environment';
import {CompanyType} from '../../models';
import {devLogger} from '../../utils';

@Component({
  selector: 'app-create-company',
  templateUrl: './create-company.component.html',
  styleUrls: ['./create-company.component.scss']
})
export class CreateCompanyComponent implements OnInit, OnChanges {

  @Input() createCompanyMode: { status: boolean, type: { soleTrader: boolean, inc: boolean } } = {
    status: false,
    type: {soleTrader: false, inc: false}
  };
  countries$ = this.getRegionAndCountriesService.getAllCountriesOnly();
  // @ts-ignore
  createCompanyForm: FormGroup;

  categoryList: any[] = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'val',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };
  selectedCategory: any;

  constructor(
    private getRegionAndCountriesService: GetRegionAndCountriesService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.createCompanyForm = this.fb.group({
      companyProfileImage: [null],
      companyName: [null, [Validators.required]],
      countryId: [null, [Validators.required]],
      city: [null, [Validators.required]],
      categoryIds: [null, [Validators.required]],
      website: [null],
      description: [''],
      companyType: []
    });
    this.categoryList = environment.companyCategories;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.createCompanyMode?.currentValue?.inc === true) {
      this.setWebSiteValidity();
      this.setCompanyType(CompanyType.INC);
    } else if (changes.createCompanyMode?.currentValue?.soleTrader === true) {
      this.setCompanyType(CompanyType.PROPRIETOR);
    }
  }

  private setCompanyType(companyType: CompanyType): void {
    this.createCompanyForm.get('companyType')?.setValue(companyType);
  }

  private setWebSiteValidity(): void {
    this.createCompanyForm.get('website')?.setValidators([Validators.required]);
    this.createCompanyForm.get('website')?.updateValueAndValidity();
  }

  onCategoryChange(event: { id: number, val: string }[]): void {
    if (event) {
      if (event.length === 0) {
        this.createCompanyForm.get('categoryIds')?.setValue(null);
      } else {
        this.createCompanyForm.get('categoryIds')?.setValue(event.map(ct => ct.id));
      }
    }
  }

  markCategoryTouched(): void {
    this.createCompanyForm.get('categoryIds')?.markAsTouched({onlySelf: true});
  }
}
