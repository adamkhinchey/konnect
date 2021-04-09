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
  private userConnections: any[] = [];
  private companyConnections: any[] = [];

  constructor(private userSettings: UserSettingsService, private companiesService: CompaniesService) {
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    if (changeEvent.nextId === 3) {
      changeEvent.preventDefault();
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
          this.userConnections = value;
        } else if (this.connectionType === ConnectionType.Company) {
          this.companyConnections = value;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.userSettingsSubscription?.unsubscribe();
    this.getCompanyConnSub?.unsubscribe();
  }
}
