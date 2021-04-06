import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, EventEmitter, Output} from '@angular/core';
import {CreateProfilePersonalDetails, LoginUserProfile, SignupUserProfile} from '../../../../shared/models';
import {CompaniesService} from '../../services/companies.service';
import {Subscription} from 'rxjs';
import {devLogger} from '../../../../shared/utils';
import {AssociateToCompany, AssociationType, Company} from '../../models';
import {ToastrService} from 'ngx-toastr';
import {Router} from "@angular/router";
import {AuthService} from "../../../../core/services/auth.service";

@Component({
  selector: 'app-company-details-tab',
  templateUrl: './company-details-tab.component.html',
  styleUrls: ['./company-details-tab.component.scss']
})
export class CompanyDetailsTabComponent implements OnInit, OnChanges, OnDestroy {

  @Input() personalDetails: CreateProfilePersonalDetails | undefined;
  @Input() user: LoginUserProfile | SignupUserProfile | undefined;
  @Output() createCompanyMode = new EventEmitter<{ status: boolean, type: { soleTrader: boolean, inc: boolean } }>();
  @Input() searchForCompany = false;
  @Input() navigateTo = 'home';

  cmpSearchSubscription: Subscription | undefined;
  assignCmpToUserSubscription: Subscription | undefined;

  company: Company | null = null;
  companyList: Company[] = [];

  constructor(private companiesService: CompaniesService,
              private toaster: ToastrService, private router: Router, private authService: AuthService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.personalDetails?.currentValue) {
      const domainName = this.getDomainName();
      if (domainName) {
        this.searchCompany(domainName);
      }
    }
  }

  ngOnInit(): void {

  }

  private getDomainName(): string | null {
    if (!this.personalDetails) {
      return null;
    }
    let domainName = null;
    const domainNameStartIndex = this.personalDetails?.email.indexOf('@');
    if (domainNameStartIndex !== -1) {
      domainName = this.personalDetails.email.substring(domainNameStartIndex + 1).trim();
      return domainName;
    }
    return null;
  }

  searchCompany(domain: string | null = null, searchKeyword: string | null = null): void {
    if (!domain && !searchKeyword) {
      this.company = null;
      this.companyList = [];
      return;
    }
    this.cmpSearchSubscription = this.companiesService.search({searchKeyword, domain})
      .subscribe((value: { company: Company | null, companyList: Company[] | null } | null | undefined) => {
          devLogger('log', {value});
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
        }
        , error => {
          devLogger('error', error);
        });
  }


  claimOrJoinCompany(event: Partial<AssociateToCompany>): void {
    const userId = this.user?.id || this.authService.getUserInfo().id;
    this.assignCmpToUserSubscription = this.companiesService.assignCompanyToUser({
      ...event, userId, positions: null
    }).subscribe(value => {
      devLogger('log', value);
      if (value) {
        if (event.assignType === AssociationType.JOIN) {
          this.toaster.success('Request to join company sent!');
        } else if (event.assignType === AssociationType.CLAIM) {
          this.toaster.success('Company claimed successfully. You are now Administrator of the Company');
        }
        this.router.navigate([this.navigateTo]);
      }
    }, err => {
      devLogger('error', err);
    });
  }

  ngOnDestroy(): void {
    if (this.cmpSearchSubscription) {
      this.cmpSearchSubscription.unsubscribe();
    }
    if (this.assignCmpToUserSubscription) {
      this.assignCmpToUserSubscription.unsubscribe();
    }
  }

  setCreateCompany(event: MouseEvent, param2: { soleTrader: boolean; inc: boolean }): void {
    event.preventDefault();
    this.createCompanyMode.emit({status: true, type: {...param2}});
  }
}
