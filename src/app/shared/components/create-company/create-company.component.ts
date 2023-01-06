import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  EventEmitter,
} from '@angular/core';
import {
  CompanyCategoriesService,
  GetRegionAndCountriesService,
  UploadFileService,
} from '../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { environment } from '../../../../environments/environment';
import {
  CompanyType,
  CreateCompanyInterface,
  FileUploadConfigInterface,
  LoginUserProfile,
  SignupUserProfile,
} from '../../models';
import { checkRxFormValidation, devLogger } from '../../utils';
import { CompaniesService } from '../../../features/users/services/companies.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { AngularEditorConfig } from '@kolkov/angular-editor';

const WEBSITE_REGEX =
  /^(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[\w]{2,}(\/\S*)?$/;

@Component({
  selector: 'app-create-company',
  templateUrl: './create-company.component.html',
  styleUrls: ['./create-company.component.scss'],
})
export class CreateCompanyComponent implements OnInit, OnDestroy {
  @Input() user: LoginUserProfile | SignupUserProfile | undefined;
  @Input() createCompanyMode: {
    status: boolean;
    type: { soleTrader: boolean; inc: boolean };
  } = {
    status: false,
    type: { soleTrader: false, inc: false },
  };
  @Input() navigateToPostCreate = 'home';
  createCompanySubscription: Subscription | undefined;
  categoryListSubscription: Subscription | undefined;
  countries$ = this.getRegionAndCountriesService.getAllCountriesOnly();
  // @ts-ignore
  createCompanyForm: FormGroup;

  categoryList: any[] = [];
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
  selectedCategory: any;
  profileImageConfig: FileUploadConfigInterface = {
    fileTypes: environment.imageFileAllowedFormats,
    size: environment.imageFileUploadSize,
  };
  selectedImageSrc: string | undefined;
  private selectedProfileImage: File | undefined;
  config: AngularEditorConfig = {
    editable: true,
    showToolbar:false,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    sanitize: false,
    defaultFontSize:'2',
    toolbarHiddenButtons: [
      [
        // 'undo',
        // 'redo',
        // 'fontSize',
        // 'textColor',
        // 'backgroundColor',
        // 'bold',
        // 'italic',
        // 'underline',
        // 'strikeThrough',
        'subscript',
        'superscript',
        // 'justifyLeft',
        // 'justifyCenter',
        // 'justifyRight',
        'justifyFull',
        // 'indent',
        // 'outdent',
        // 'insertUnorderedList',
        // 'insertOrderedList',
        'heading',
        'fontName'
      ],
      [
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
    ],
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
    private getRegionAndCountriesService: GetRegionAndCountriesService,
    private fb: FormBuilder,
    private companiesService: CompaniesService,
    private router: Router,
    private toaster: ToastrService,
    private companyCategoriesService: CompanyCategoriesService,
    private authService: AuthService,
    private uploadFileService: UploadFileService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    devLogger('log', { createCompanyMode: this.createCompanyMode });
    if (!this.createCompanyMode.status) {
      this.router.navigate(['home']);
    }
    this.createCompanyForm = this.fb.group({
      companyProfileImage: [null],
      companyName: [null, [Validators.required]],
      countryId: ['', [Validators.required]],
      city: [null, [Validators.required]],
      categoryIds: [null, [Validators.required]],
      website: [null, [Validators.pattern(WEBSITE_REGEX)]],
      description: [null],
      companyType: [null, [Validators.required]],
    });
    this.setInitialFormControlStates();
    this.fetchCategories();
  }

  private setInitialFormControlStates(): void {
    if (this.createCompanyMode?.type?.inc === true) {
      this.setWebSiteValidity();
      this.setCompanyType(CompanyType.INC);
    } else if (this.createCompanyMode?.type?.soleTrader === true) {
      this.setCompanyType(CompanyType.PROPRIETOR);
    }
  }

  private setCompanyType(companyType: CompanyType): void {
    this.createCompanyForm.get('companyType')?.setValue(companyType);
  }

  private setWebSiteValidity(): void {
    this.createCompanyForm
      .get('website')
      ?.setValidators([Validators.required, Validators.pattern(WEBSITE_REGEX)]);
    this.createCompanyForm.get('website')?.updateValueAndValidity();
  }

  private fetchCategories(): void {
    this.categoryListSubscription = this.companyCategoriesService
      .get()
      .subscribe(
        (value) => {
          if (value) {
            this.categoryList = value;
            devLogger('log', { categoryList: value });
          }
        },
        (err) => {
          devLogger('error', err);
        }
      );
  }

  onCategoryChange(event: { id: number; val: string }[]): void {
    if (event) {
      if (event.length === 0) {
        this.createCompanyForm.get('categoryIds')?.setValue(null);
      } else {
        this.createCompanyForm
          .get('categoryIds')
          ?.setValue(event.map((ct) => ct.id));
      }
    }
  }

  markCategoryTouched(): void {
    this.createCompanyForm
      .get('categoryIds')
      ?.markAsTouched({ onlySelf: true });
  }

  checkValidation(): boolean {
    devLogger('log', this.createCompanyForm);
    return checkRxFormValidation(this.createCompanyForm);
  }

  saveImageAndCreateCompany(): void {
    this.spinner.show();
    if (this.selectedProfileImage) {
      this.uploadFileService.uploadFileCreateCompany(
        this.selectedProfileImage,
        (url: string) => {
          this.createCompanyForm.get('companyProfileImage')?.setValue(url);
          this.createCompany();
        }
      );
    } else {
      this.createCompany();
    }
  }

  createCompany(): void {
    devLogger('log', this.createCompanyForm.value);
    this.spinner.show();
    const userId = this.user?.id || this.authService.getUserInfo().id;
    if (this.createCompanySubscription) {
      this.createCompanySubscription.unsubscribe();
    }
    this.createCompanySubscription = this.companiesService
      .createCompany({ userId, ...this.createCompanyForm.value })
      .subscribe(
        async (value) => {
          if (value) {
            this.toaster.success('Company created successfully');
            await this.router.navigate([this.navigateToPostCreate]);
            this.spinner.hide();
          }
        },
        (err) => {
          devLogger('error', err);
          this.spinner.hide();
        }
      );
  }

  ngOnDestroy(): void {
    if (this.createCompanySubscription) {
      this.createCompanySubscription.unsubscribe();
    }
    if (this.categoryListSubscription) {
      this.categoryListSubscription.unsubscribe();
    }
  }

  setSelectedImage(event: File): void {
    this.selectedImageSrc = URL.createObjectURL(event);
    this.selectedProfileImage = event;
    devLogger('log', { FILEEEEE: event });
  }
  changeConfig() {
    $('#createCompanyDescription .angular-editor-textarea').css('border-top', 'none');
    this.config.editable = true;
    this.config.showToolbar = true;
    // }
  }
}
