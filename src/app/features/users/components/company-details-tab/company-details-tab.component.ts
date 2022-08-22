import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  EventEmitter,
  Output,
  AfterViewInit,
} from '@angular/core';
import {
  CreateProfilePersonalDetails,
  LoginUserProfile,
  SignupUserProfile,
} from '../../../../shared/models';
import { CompaniesService } from '../../services/companies.service';
import { Subscription } from 'rxjs';
import { devLogger } from '../../../../shared/utils';
import { AssociateToCompany, AssociationType, Company } from '../../models';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-company-details-tab',
  templateUrl: './company-details-tab.component.html',
  styleUrls: ['./company-details-tab.component.scss'],
})
export class CompanyDetailsTabComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input() personalDetails: CreateProfilePersonalDetails | undefined;
  @Input() user: LoginUserProfile | SignupUserProfile | undefined;
  @Output() createCompanyMode = new EventEmitter<{
    status: boolean;
    type: { soleTrader: boolean; inc: boolean };
  }>();
  @Input() searchForCompany = false;
  // TODO make navigation back to home or /home/events-dashboard
  @Input() navigateTo = 'home/edit-profile';

  cmpSearchSubscription: Subscription | undefined;
  assignCmpToUserSubscription: Subscription | undefined;

  company: Company | null = null;
  companyList: Company[] = [];
  domainName: any = null;
  constructor(
    private companiesService: CompaniesService,
    private toaster: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.personalDetails?.currentValue) {
      this.domainName = this.getDomainName();
      console.log('domain name...', this.domainName);
      if (this.domainName) {
        this.searchCompany(this.domainName);
      }
    }
  }

  ngOnInit(): void {
    this.domainName = this.getDomainName();
  }

  ngAfterViewInit() {
    if (!this.domainName && this.router.url === '/home/join-company') {
      this.searchCompany(this.domainName);
    }
  }

  private getDomainName(): string | null {
    if (!this.personalDetails) {
      return null;
    }

    const domainNameStartIndex = this.personalDetails?.email.indexOf('@');
    if (domainNameStartIndex !== -1) {
      this.domainName = this.personalDetails.email
        .substring(domainNameStartIndex + 1)
        .trim();
      return this.domainName;
    }
    return null;
  }

  searchCompany(
    domain: string | null = null,
    searchKeyword: string | null = null
  ): void {
    domain = this.domainName;
    console.log('domain...', domain);
    if (domain == null) {
      const domainNameStartIndex = this.authService
        .getUserInfo()
        ?.email.indexOf('@');
      if (domainNameStartIndex !== -1) {
        domain = this.authService
          .getUserInfo()
          .email.substring(domainNameStartIndex + 1)
          .trim()
          .split('@')[1];
      }
    } else {
      try {
        // domain = domain.split('@')[1];
        console.log('domain in else...', domain);
      } catch (err) {}
    }
    const param =
      this.router.url === '/create-konnect-profile' ||
      this.router.url.indexOf('create-konnect-profile') != -1
        ? { searchKeyword, domain, includePrivate: 1 }
        : { searchKeyword, domain };
    this.cmpSearchSubscription = this.companiesService.search(param).subscribe(
      (
        value:
          | { company: Company | null; companyList: Company[] | null }
          | null
          | undefined
      ) => {
        devLogger('log', { value });
        if (value) {
          if (value.company) {
            this.company = value.company;
          } else {
            this.searchForCompany = true;
          }
          if (value.companyList) {
            this.companyList = value.companyList;
          }
        }
      },
      (error) => {
        devLogger('error', error);
      }
    );
  }

  claimOrJoinCompany(event: Partial<AssociateToCompany>): void {
    const userId = this.user?.id || this.authService.getUserInfo().id;
    this.assignCmpToUserSubscription = this.companiesService
      .assignCompanyToUser({
        ...event,
        userId,
        positions: null,
      })
      .subscribe(
        (value) => {
          devLogger('log', value);
          if (value) {
            if (event.assignType === AssociationType.JOIN) {
              this.toaster.success(
                'Your request to join a company has been sent and is pending approval by the company.'
              );
            } else if (event.assignType === AssociationType.CLAIM) {
              this.toaster.success(
                'Company claimed successfully. You are now Administrator of the Company'
              );
            }
            this.router.navigate([this.navigateTo]);
          }
        },
        (err) => {
          devLogger('error', err);
        }
      );
  }

  ngOnDestroy(): void {
    if (this.cmpSearchSubscription) {
      this.cmpSearchSubscription.unsubscribe();
    }
    if (this.assignCmpToUserSubscription) {
      this.assignCmpToUserSubscription.unsubscribe();
    }
  }

  setCreateCompany(
    event: MouseEvent,
    param2: { soleTrader: boolean; inc: boolean }
  ): void {
    event.preventDefault();
    this.createCompanyMode.emit({ status: true, type: { ...param2 } });
  }
}
