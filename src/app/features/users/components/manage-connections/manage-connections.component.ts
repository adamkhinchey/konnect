import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgbNavChangeEvent} from "@ng-bootstrap/ng-bootstrap";
import {faAddressCard} from '@fortawesome/free-regular-svg-icons';
import {ConnectionType, UserSettingsInterface} from "../../../../shared/models";
import {devLogger} from "../../../../shared/utils";
import {UserSettingsService} from "../../../../shared/services";
import {Subscription} from "rxjs";
import {CompaniesService} from "../../services/companies.service";

@Component({
  selector: 'app-manage-connections',
  templateUrl: './manage-connections.component.html',
  styleUrls: ['./manage-connections.component.scss']
})
export class ManageConnectionsComponent implements OnInit, OnDestroy {

  active = 1;
  disabled = true;
  addressCardIcon = faAddressCard;
  modalReference: any;
  private userSettingsSubscription: Subscription | undefined;
  defaultCompany: any;
  usersFirstName: string | undefined;
  private connectionPageNumber = 1;
  public connectionPageSize = 10000;
  connectionType = ConnectionType.USER;
  private getCompanyConnSub: Subscription | undefined;
  allIntrUserConnections: any[] = [];
  allIntrCmpConnections: any[] = [];
  userConnections: any[] = [];
  companyConnections: any[] = [];
  isExternal = 0; // 0 means own contact book, 1 means outer i.e. non-colleagues and non-contact
  keyword = '';
  private searchOnPlatformSub: Subscription | undefined;
  isUserAdmin: boolean | undefined = false;


  constructor(private userSettings: UserSettingsService, private companiesService: CompaniesService) {
  }

  onNavChange(changeEvent: NgbNavChangeEvent): void {
    if (changeEvent.nextId === 3) {
      changeEvent.preventDefault();
      return;
    }
    this.connectionType = changeEvent.nextId;
    this.keyword = '';
    if (this.isExternal === 0) {
      this.doConnectionSearch(this.keyword);
    }
  }

  toggleDisabled() {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    }
  }

  ngOnInit(): void {

    this.userSettingsSubscription = this.userSettings.settings.subscribe((value: UserSettingsInterface) => {
      this.defaultCompany = value.defaultCompany;
      this.usersFirstName = value.firstName;
      this.isUserAdmin = value.isAdmin;
      this.getCompanyConnections();
    }, err => {
      devLogger('error', err);
    }, () => {
    });
  }

  private getCompanyConnections(): void {
    if (this.defaultCompany && this.defaultCompany.id) {
      this.getCompanyConnSub = this.companiesService.getConnections({
        entityType: this.connectionType,
        companyId: this.defaultCompany.id,
        pageNo: this.connectionPageNumber,
        pageSize: this.connectionPageSize
      }).subscribe((value) => {
        if (this.connectionType === ConnectionType.USER) {
          if (this.isExternal === 0) {
            this.allIntrUserConnections = value;
            this.userConnections = [...this.allIntrUserConnections];
          } else {
            this.userConnections = value;
          }
        } else if (this.connectionType === ConnectionType.COMPANY) {
          if (this.isExternal === 0) {
            this.allIntrCmpConnections = value;
            this.companyConnections = [...this.allIntrCmpConnections];
          } else {
            this.companyConnections = value;
          }
        }
      });
    }
  }

  private searchGlobally(): void {
    if (this.defaultCompany && this.defaultCompany.id) {
      this.searchOnPlatformSub = this.companiesService.searchOnPlatform({
        entityType: this.connectionType,
        keyword: this.keyword.trim().toLocaleLowerCase(),
        regionId: null,
        isExternal: this.isExternal,
        companyId: this.defaultCompany.id,
        pageNo: this.connectionPageNumber,
        pageSize: this.connectionPageSize
      }).subscribe((value) => {
        if (this.connectionType === ConnectionType.USER) {
          this.userConnections = value;
        } else if (this.connectionType === ConnectionType.COMPANY) {
          this.companyConnections = value;
        }
      });
    }
  }

  doConnectionSearch(event: string): void {
    if (this.isExternal === 0 && this.allIntrUserConnections.length > 0) {
      const filterText = event.trim().toLocaleLowerCase();
      if (this.connectionType === ConnectionType.USER) {
        this.userConnections = this.allIntrUserConnections.filter(val => {
          return val.firstName?.trim().toLocaleLowerCase().indexOf(filterText) !== -1 ||
            val.lastName?.trim().toLocaleLowerCase().indexOf(filterText) !== -1 ||
            val.email?.trim().toLocaleLowerCase().indexOf(filterText) !== -1;
        });
      }
      if (this.connectionType === ConnectionType.COMPANY) {
        this.userConnections = this.allIntrCmpConnections.filter(val => {
          return val.companyName?.trim().toLocaleLowerCase().indexOf(filterText) !== -1 ||
            val.website?.trim().toLocaleLowerCase().indexOf(filterText) !== -1;
        });
      }
    } else if (this.isExternal === 0 && this.allIntrUserConnections.length === 0) {
      this.getCompanyConnections();
    } else if (this.isExternal === 1) {
      this.userConnections = [];
      this.companyConnections = [];
      this.searchGlobally();
    }
  }


  ngOnDestroy(): void {
    this.userSettingsSubscription?.unsubscribe();
    this.getCompanyConnSub?.unsubscribe();
    this.searchOnPlatformSub?.unsubscribe();
  }

  onSearchScopeChange(searchScope: number): void {
    // searchScope is isExternal=0 OR 1
    this.keyword = '';
    this.userConnections = [];
    this.allIntrUserConnections = [];
    this.companyConnections = [];
    this.allIntrCmpConnections = [];
    if (searchScope === 0) {
      this.getCompanyConnections();
    }
  }

  openRemoveConfirmationBox($event: MouseEvent) {

  }
}
