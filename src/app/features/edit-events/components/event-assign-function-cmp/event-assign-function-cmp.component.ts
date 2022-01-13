import { Component, Input, OnInit, Output, TemplateRef, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Company } from '../../../users/models';
import { FnCmpCntInterface, InviteFnCmpInterface } from '../../models/interfaces';
import { InviteFnCmpClass } from '../../models/classes';
import { devLogger } from '../../../../shared/utils';
import { environment } from '../../../../../environments/environment';
import { cloneDeep } from 'lodash-es';
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-event-assign-function-cmp',
  templateUrl: './event-assign-function-cmp.component.html',
  styleUrls: ['./event-assign-function-cmp.component.scss']
})
export class EventAssignFunctionCmpComponent implements OnInit, OnChanges {
  addressCardIcon = faAddressCard;
  @Input() eventData: any;
  @Input() clientCmpBtnLabel = '';
  @Input() contactListLabel = '';
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined | null;
  @Input() clientCompanyModal: TemplateRef<any> | undefined;
  @Input() contactModal: TemplateRef<any> | undefined;
  @Output() modalOpen = new EventEmitter<NgbModalRef>();
  @Input() isViewPermission: any;
  @Output() contactRemove = new EventEmitter<number>();
  modalReference: NgbModalRef | undefined;
  editContactLabelModalReference: NgbModalRef | undefined;
  disableAddContacts = true;
  contactLabels = environment.eventContactLabels;
  @Input() contactList: FnCmpCntInterface[] = [];
  editingContactLabelIndex = -1;
  currentContactLabelIdSelected: number | null = null;
  @Input() isClientEditable: boolean = false;
  @Input() isManagerEditable: boolean = false;
  @Input() isVenueEditable: boolean = false;
  @Input() isServiceEditable: boolean = false;
  @Input() isExhibitorEditable: boolean = false;
  @Input() permissionObj: any;
  @Input() editServiceIndex:number =0;
  @Input() serviceIndex:number =0;
  @Output() isCrew = new EventEmitter<any>();

  constructor(private modalService: NgbModal) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.selectedCompany && changes.selectedCompany.currentValue) {
      this.disableAddContacts = changes.selectedCompany.currentValue instanceof InviteFnCmpClass;
    } else if (changes && changes.selectedCompany && !changes.selectedCompany.currentValue) {
      this.disableAddContacts = true;
    }
  }

  ngOnInit(): void {
    this.contactList = this.contactList.filter(contact => contact.isCrew == 0);
  }

  openVerticallyCentered(content: any): void {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    this.isCrew.emit(0);
    this.modalOpen.emit(this.modalReference);
  }

  editContactLabelModal(editContactDetail: any, i: number): void {
    this.editContactLabelModalReference = this.modalService.open(editContactDetail, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false
    });
    this.editingContactLabelIndex = i;
    this.currentContactLabelIdSelected = this.contactList[i].contactLabelId?this.contactList[i].contactLabelId:5;
  }


  removeContactFromList(i: number): void {
    this.contactRemove.emit(i);
  }

  setSelectedCompany(company: Company | InviteFnCmpClass): void {
    this.selectedCompany = company;
    this.disableAddContacts = company instanceof InviteFnCmpClass;
  }

  removeSelectedCompany(): void {
    this.selectedCompany = null;
    this.disableAddContacts = true;
  }

  setContactList(contactList: FnCmpCntInterface[]): void {
    this.contactList = cloneDeep(contactList);
  }

  removeContactList(): void {
    this.contactList = [];
  }

  onContactLabelSelected(event: any): void {
    this.currentContactLabelIdSelected = parseInt(event, 10);
  }

  closeAndChangeContactLabelId(shouldChange: boolean = true): void {
    if (this.editingContactLabelIndex !== -1 && shouldChange) {
      this.contactList[this.editingContactLabelIndex].contactLabelId = this.currentContactLabelIdSelected;
    }
    this.editContactLabelModalReference?.close();
    this.editingContactLabelIndex = -1;
    this.currentContactLabelIdSelected = null;
  }

  goToUserProfile(userId: any, isPrivate: any) {
    if (userId) {
      localStorage.setItem('userId', JSON.stringify(userId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/edit-profile?isView=' + true);
    }
  }

  checkViewPermission(listLabel: any) {
    if(listLabel == 'Add Venue'){
      return true;
    }
      else if (this.permissionObj.isClient || this.permissionObj.isEventManager || this.isViewPermission) {
        return true;
      } else {
        return false;
      }
  }

}
