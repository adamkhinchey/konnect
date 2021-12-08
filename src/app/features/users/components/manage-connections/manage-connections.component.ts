import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef, NgbNavChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { ConnectionType, RemoveType, UserSettingsInterface } from "../../../../shared/models";
import { devLogger } from "../../../../shared/utils";
import { UserSettingsService } from "../../../../shared/services";
import { Subscription } from "rxjs";
import { CompaniesService } from "../../services/companies.service";
import { ToastrService } from "ngx-toastr";
import { RemoveModalComponent } from "../../../../shared/components/modals/remove-modal/remove-modal.component";
import { v4 as uuidV4 } from "uuid";

@Component({
  selector: 'app-manage-connections',
  templateUrl: './manage-connections.component.html',
  styleUrls: ['./manage-connections.component.scss']
})
export class ManageConnectionsComponent implements OnInit, OnDestroy {
  @ViewChild(RemoveModalComponent) removeConnectionModal: RemoveModalComponent | undefined;

  active = 1;
  disabled = true;
  addressCardIcon = faAddressCard;
  modalReference: NgbModalRef | undefined;
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
  isExternal = 1; // 0 means own contact book, 1 means outer i.e. non-colleagues and non-contact
  keyword = '';
  private searchOnPlatformSub: Subscription | undefined;
  isUserAdmin: boolean | undefined = false;
  private addConnSub: Subscription | undefined;
  removalType: RemoveType | undefined;
  private connectionToRemoveId: null | number = null;
  private deleteConnSub: Subscription | undefined;


  constructor(
    private userSettings: UserSettingsService,
    private companiesService: CompaniesService,
    private toaster: ToastrService,
    private modalService: NgbModal) {
  }


  ngOnInit(): void {

    this.userSettingsSubscription = this.userSettings.settings.subscribe((value: UserSettingsInterface) => {
      this.defaultCompany = value.defaultCompany;
      this.usersFirstName = value.firstName;
      this.isUserAdmin = value.isAdmin;
      this.keyword = '';
      this.clearSearchResults();
      // this.getCompanyConnections();
      this.searchGlobally();
    }, err => {
      devLogger('error', err);
    }, () => {
    });
  }

  onNavChange(changeEvent: NgbNavChangeEvent): void {
    if (changeEvent.nextId === 3) {
      changeEvent.preventDefault();
      return;
    }
    this.connectionType = changeEvent.nextId;
    this.keyword = '';
    if (this.isExternal === 1) {
      this.clearSearchResults();
      this.searchGlobally();
    } 
    // else if (this.isExternal === 1) {
    //   this.clearSearchResults();
    // }
  }

  toggleDisabled() {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    }
  }

  private getCompanyConnections(): void {
    if (this.defaultCompany && this.defaultCompany.id && this.isExternal === 0) {
      this.clearSearchResults();
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
      this.searchOnPlatformSub = this.companiesService.searchGlobalConnectionForCollection({
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
    const filterText = event.trim().toLocaleLowerCase();
    if (filterText.length >= 3) {
      if (this.isExternal === 0 &&
        (this.connectionType === ConnectionType.USER && this.allIntrUserConnections.length > 0)) {

        this.userConnections = this.allIntrUserConnections.filter(val => {
          return val.firstName?.trim().toLocaleLowerCase().indexOf(filterText) !== -1 ||
            val.lastName?.trim().toLocaleLowerCase().indexOf(filterText) !== -1 ||
            val.email?.trim().toLocaleLowerCase().indexOf(filterText) !== -1;
        });
      } else if (this.isExternal === 0 &&
        (this.connectionType === ConnectionType.COMPANY && this.allIntrCmpConnections.length > 0)) {
        this.companyConnections = this.allIntrCmpConnections.filter(val => {
          return val.companyName?.trim().toLocaleLowerCase().indexOf(filterText) !== -1 ||
            val.website?.trim().toLocaleLowerCase().indexOf(filterText) !== -1;
        });
      } else if (this.isExternal === 0 && (this.allIntrUserConnections.length === 0 || this.allIntrCmpConnections.length === 0)) {
        this.getCompanyConnections();
      } else if (this.isExternal === 1) {
        this.userConnections = [];
        this.companyConnections = [];
        this.searchGlobally();
      }
    }
    if (this.isExternal === 1 && filterText.length == 0) {
      this.searchGlobally();
    }
  }


  onSearchScopeChange(searchScope: number): void {
    // searchScope is isExternal=0 OR 1
    this.keyword = '';
    this.clearSearchResults();
    if (searchScope === 0) {
      this.getCompanyConnections();
    }
  }

  private clearSearchResults(): void {
    this.userConnections = [];
    this.allIntrUserConnections = [];
    this.companyConnections = [];
    this.allIntrCmpConnections = [];
  }


  addToConnections(id: number): void {
    if (this.defaultCompany && this.defaultCompany.id) {
      this.addConnSub = this.companiesService.addToConnection({
        companyId: this.defaultCompany.id,
        connectionId: id,
        connectionType: this.connectionType
      })
        .subscribe((value) => {
          this.toaster.success('New connection added successfully');
          this.searchGlobally();
        }, err => {
          this.toaster.error('Failed to add new connection');
        });
    } else {
      this.toaster.error('Please make sure that a company is selected from top right', 'Can\'t to connection')
    }
  }

  openRemoveConfirmationBox(connectionId: number): void {
    if (this.defaultCompany && this.defaultCompany.id) {
      this.connectionToRemoveId = connectionId;
      this.modalReference = this.modalService.open(this.removeConnectionModal?.content, {
        centered: true,
        size: 'lg',
      });
    } else {
      this.toaster.error('No Company is associated or selected');
    }
  }

  cancelRemove(): void {
    this.connectionToRemoveId = null;
    this.modalReference?.close('Cancelled by user');
  }

  confirmRemove(): void {
    this.deleteConnSub = this.companiesService.deleteConnection({
      companyId: this.defaultCompany.id,
      connectionId: this.connectionToRemoveId,
      connectionType: this.connectionType
    }).subscribe((value: any) => {
      this.toaster.success('Connection removed successfully');
      this.modalReference?.close('connection removed');
      this.connectionToRemoveId = null;
      this.getCompanyConnections();
    }, (err: any) => {
      devLogger('error', err);
      this.modalReference?.dismiss('connection removal failed');
      this.connectionToRemoveId = null;
    });
  }

  ngOnDestroy(): void {
    this.userSettingsSubscription?.unsubscribe();
    this.getCompanyConnSub?.unsubscribe();
    this.searchOnPlatformSub?.unsubscribe();
    this.addConnSub?.unsubscribe();
    this.deleteConnSub?.unsubscribe();
  }

  goToCompanyProfile(companyId: any, isPrivate: any) {
    if (companyId) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/company/manage-company?isView=' + true);
    }
  }

  goToUserProfile(userId: any, isPrivate: any) {
    if (userId) {
      localStorage.setItem('userId', JSON.stringify(userId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/edit-profile?isView=' + true);
    }
  }

}
