import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SaveEventClass } from "../../models/classes/saveEvent.class";
import { NgbAccordion, NgbNav, NgbPanelChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { devLogger } from "../../../../shared/utils";
import {
  EventSuppliersInterface,
  InviteFnCmpCntInterface,
  InviteFnCmpInterface, SuppExhTimeWindowFormatInterface,
  TimeWindowFormatInterface, VenueListItemInterface
} from '../../models/interfaces';
import { EventService } from "../../services/event.service";
import { Subscription } from "rxjs";
import { InviteFnCmpClass } from "../../models/classes";
import { Company } from "../../../users/models";
import { EventTimeWindowTypes } from "../../models/types";
import { ViewEventService } from '../../services/view-event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-suppliers-function',
  templateUrl: './event-suppliers-function.component.html',
  styleUrls: ['./event-suppliers-function.component.scss']
})
export class EventSuppliersFunctionComponent implements OnInit, OnDestroy, OnChanges {
  // @ts-ignore
  @ViewChild('ngbAccordion') ngbAccordion: NgbAccordion;
  @Input() eventData: any;
  @Input() eventToBeSaved = new SaveEventClass();
  @Input() venueCompanies: Array<Company | InviteFnCmpInterface | null> | undefined | null = [];
  @Output() saveAndInvite = new EventEmitter<{ venueIndex: number, serviceIndex: number, shouldInvite: boolean }>();
  @Input() searchInviteCmpModal: any;
  @Input() searchInviteFnCmpCntModal: any;
  @Input() setOpenedModalRef: any;
  @Input() permissionObj: any;
  @Input() content: any;
  activeServicePanel = 0;
  private supplierCompanyAddedSub: Subscription | undefined;
  private supplierCmpCntAddedSub: Subscription | undefined;
  venuesSuppCmpsMap = new Map<number, Map<number, Company | InviteFnCmpInterface>>();
  eventTimeWindowType = EventTimeWindowTypes.Supplier;
  isServiceEdit: boolean = false;
  public isServiceEditable: boolean = false;
  @Input() setIsCrew: any;

  constructor(
    public eventService: EventService,
    private viewEventService: ViewEventService,
    private router: Router
  ) {
  }

  ngOnChanges(changes:SimpleChanges){
    this.isServiceEdit = this.eventService.isEdit;
    this.isServiceEditable = this.eventService.isEdit;
  }

  editServiceFn() {
    this.eventService.isEdit = !this.isServiceEdit;
    this.isServiceEdit = !this.isServiceEdit;
    this.isServiceEditable = !this.isServiceEditable;
    // this.editVenue.emit(this.isVenueEdit);
  }

  ngOnInit(): void {
    console.log('event Data: ', this.eventData)
    this.supplierCompanyAddedSub = this.eventService.supplierCompanyAddSubject
      .subscribe(value => {
        devLogger('log', 'supplierCompanyAddedSub');
        devLogger('log', value);
        const isInvited = value.supplierCompany instanceof InviteFnCmpClass;
        const service = this.eventToBeSaved.venues?.list[value.venueIndex]
          .suppliers[0]?.services[value.serviceIndex];

        if (service) {
          service.companyId = isInvited ? null : (value.supplierCompany as Company).id;
          service.invited = isInvited ? (value.supplierCompany as InviteFnCmpClass) : null;
          service.contacts = isInvited ? null : [];
          if (this.venuesSuppCmpsMap.has(value.venueIndex)) {
            this.venuesSuppCmpsMap.get(value.venueIndex)?.set(value.serviceIndex, value.supplierCompany);
          } else {
            const serviceSuppCmpMap = new Map([[value.serviceIndex, value.supplierCompany]]);
            this.venuesSuppCmpsMap.set(value.venueIndex, serviceSuppCmpMap);
          }

          devLogger('log', this.venuesSuppCmpsMap);
        }
      }, err => {
        devLogger('error', err);
      });

    this.supplierCmpCntAddedSub = this.eventService.supplierCmpCntAddSubject.subscribe(value => {
      this.setContacts(value);
    });

    this.eventService.navigatesToSuppliers.subscribe(()=>{
      this.eventService.getFetchedVenueSrvcsCmp().forEach((param, index) => {
        this.eventService.activeServicePanel = { venueIndex: param.venueIndex, serviceIndex: param.serviceIndex };
        if (param.company) {
          this.eventService.supplierCompanyAdded(param.company);
        }

        if (index === this.eventService.getFetchedVenueSrvcsCmp().length - 1) {
          this.eventService.activeServicePanel = { venueIndex: 0, serviceIndex: 0 };
        }
      });
      this.eventService.getFetchedVenueSrvcCmpCnts().forEach((param, index) => {
        this.eventService.activeServicePanel = { venueIndex: param.venueIndex, serviceIndex: param.serviceIndex };
        if (param.contactList) {
          this.eventService.supplierContactsAdded(param.contactList);
        }
        if (index === this.eventService.getFetchedVenueSrvcCmpCnts().length - 1) {
          this.eventService.activeServicePanel = { venueIndex: 0, serviceIndex: 0 };
        }
      });
    })

    this.eventService.navigatesToSuppliers.next()

  }

  private setContacts(value: { venueIndex: number; serviceIndex: number; contactList: InviteFnCmpCntInterface[] }): void {
    const service = this.eventToBeSaved.venues?.list[value.venueIndex]
      .suppliers[0]?.services[value.serviceIndex];
    if (service) {
      if (service.contacts) {
        service.contacts = service.contacts.concat([...value.contactList]);
      } else {
        service.contacts = [...value.contactList];
      }
    }
  }

  openVerticallyCentered(content: any): void {

  }

  panelChange($event: NgbPanelChangeEvent): void {

  }

  addService(venue: VenueListItemInterface, venueIndex: number): void {
    this.isServiceEdit = true;
    this.isServiceEditable = true;
    if (!venue.suppliers[0]) {
      const timeWindows: SuppExhTimeWindowFormatInterface = {
        bumpIn: { sameAsVenue: null, timings: [] },
        bumpOut: { sameAsVenue: null, timings: [] },
        eventTime: { sameAsVenue: null, timings: [] }
      };
      venue.suppliers[0] = {
        notesToAll: '',
        services: [{
          name: '',
          shouldInvite: 0,
          invited: null,
          contacts: null,
          companyId: null,
          requirement: '',
          timeWindows
        }]
      };
    } else {
      const timeWindows: SuppExhTimeWindowFormatInterface = {
        bumpIn: { sameAsVenue: null, timings: [] },
        bumpOut: { sameAsVenue: null, timings: [] },
        eventTime: { sameAsVenue: null, timings: [] }
      };
      venue.suppliers[0].services.push({
        name: '',
        shouldInvite: 0,
        invited: null,
        contacts: null,
        companyId: null,
        requirement: '',
        timeWindows
      });
    }
    this.ngbAccordion.collapseAll();
    this.activeServicePanel = venue.suppliers[0].services.length - 1;
    this.eventService.activeServicePanel = { venueIndex, serviceIndex: this.activeServicePanel };
    //devLogger('log', {selectedCompanies: this.selectedCompanies});

  }

  servicePanelActivated(venueIndex: number, serviceIndex: number): void {
    this.activeServicePanel = serviceIndex;
    this.eventService.activeServicePanel = { venueIndex, serviceIndex };
  }

  removeServiceContact(venueIndex: number, serviceIndex: number, event: number): void {
    console.log('venue index: ', venueIndex, 'service index: ', serviceIndex, 'event: ', event)
    const service = this.eventToBeSaved.venues?.list[venueIndex]
      .suppliers[0]?.services[serviceIndex];
    console.log('service: ', service);
    if (service && service.contacts) {
      service.contacts.splice(event, 1);
    }
  }


  getCompanyProfileImage(company: Company | InviteFnCmpClass | undefined): string | null | undefined {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.companyProfileImage;
    }
  }

  getCompanyWebsite(company: Company | InviteFnCmpClass | undefined): string | null | undefined {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.website;
    }
  }

  getCompanyPhone(company: Company | InviteFnCmpClass | undefined): string | null | undefined {
    if (!company) {
      return null;
    }
    if (company instanceof InviteFnCmpClass) {
      return null;
    } else {
      return (company as Company)?.phone;
    }
  }

  ngOnDestroy(): void {
    this.supplierCompanyAddedSub?.unsubscribe();
    this.supplierCmpCntAddedSub?.unsubscribe();
  }

  removeSelectedCompany(venueIndex: number, serviceIndex: number): void {
    const service = this.eventToBeSaved.venues?.list[venueIndex]
      .suppliers[0].services[serviceIndex];

    if (service) {
      service.companyId = null;
      service.contacts = null;
      service.shouldInvite = null;
      service.invited = null;
      this.venuesSuppCmpsMap.get(venueIndex)?.delete(serviceIndex);
    }
  }

  removeDeclineService(supplierId: any, isAccept: any) {
    console.log(supplierId);
    let payload = {
      eventId: this.eventData.eventData.eventId,
      tabId: supplierId,
      tabType: 4,
      isAccept: isAccept
    }
    this.viewEventService.removeDecline(payload).subscribe((res: any) => {
      console.log(res);
      this.router.navigate(['home']);
    }, err => {
      devLogger('err', err)
    })
  }



  acceptDeclineService(tab: any, isAccept: any) {
    // console.log(tab.venueId);
    console.log("isAccept", isAccept);
    if(tab.supplierId && isAccept> 0){
      let payload = {
        eventId: this.eventData.eventData.eventId,
        tabId: tab.supplierId,
        tabType: 4,
        isAccept: isAccept > 1 ? 0 : isAccept
      }
      console.log("payload ** ", payload );
      this.viewEventService.removeDecline(payload).subscribe((res: any) => {
        console.log(res);
        this.router.navigate(['home']);
      }, err => {
        devLogger('err', err)
      })
  }
  }

  goToCompanyProfile(companyId:any) {
    console.log(companyId);
    if (companyId) {
      localStorage.setItem('companyId', JSON.stringify(companyId));
      localStorage.setItem('isView', JSON.stringify(true));
      window.open('/home/company/manage-company', '_blank');
    }
  }


}
