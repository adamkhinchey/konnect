import { Component, Input, OnInit, Output, TemplateRef, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Company } from '../../../users/models';
import { FnCmpCntInterface, InviteFnCmpInterface } from '../../models/interfaces';
import { InviteFnCmpClass } from '../../models/classes';
import { devLogger } from '../../../../shared/utils';
import { environment } from '../../../../../environments/environment';
import * as _ from 'lodash';
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { EventService } from '../../services/event.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-event-assign-crew-function-cmp',
  templateUrl: './event-assign-crew-function-cmp.component.html',
  styleUrls: ['./event-assign-crew-function-cmp.component.scss']
})
export class EventAssignCrewFunctionCmpComponent implements OnInit, OnChanges {
  addressCardIcon = faAddressCard;
  @Input() eventData: any;
  @Input() clientCmpBtnLabel = '';
  runNgFor = true;
  @Input() contactListLabel = '';
  @Input() isViewBtnPermission :any;
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined | null;
  @Input() clientCompanyModal: TemplateRef<any> | undefined;
  @Input() contactModal: TemplateRef<any> | undefined;
  @Output() modalOpen = new EventEmitter<NgbModalRef>();
  @Output() crewRemove = new EventEmitter<number>();
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
  @Output() isCrew = new EventEmitter<any>();
  @Input() isViewPermission: any;
  @Input() isSelfIncludedInTab: any;
  @Input() isSelfIncludedInSection: any;
  @Input() permissionObj: any;
  @Input() editServiceIndex:number =0;
  @Input() serviceIndex:number =0;
  @Input() tabName: any;
  dateHistory:any=[];
  currentDateTimeStamp: any="";
  SendType : any ="crew";
  tooltipVisible = false;
  dataLoaded = false;
  checkIsCrew :any=0;
  constructor(
    private modalService: NgbModal,
    public eventSrvc: EventService,
    private toaster: ToastrService,
    private datePipe: DatePipe
    ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.selectedCompany && changes.selectedCompany.currentValue) {
      this.disableAddContacts = changes.selectedCompany.currentValue instanceof InviteFnCmpClass;
    } else if (changes && changes.selectedCompany && !changes.selectedCompany.currentValue) {
      this.disableAddContacts = true;
    }
  }

  ngOnInit(): void {
    if(this.selectedCompany!==undefined && this.selectedCompany!==null){
      this.getLatestDate(this.tabName, this.selectedCompany, this.eventData.eventData.eventId,this.SendType);

      this.checkCrewLogin(this.tabName,this.selectedCompany,this.eventData.eventData.eventId);
    }

  }

  checkCrewLogin(tabName:any,selectedCompany:any,eventId:any){
 
    this.eventSrvc.checkCrewLogin(tabName, selectedCompany, eventId).subscribe(
      (res: any) => {

        if(res.data!=null && res.data.length>0){
       
          res.data.map((item:any)=>{
         this.checkIsCrew=item.is_crew;
          })
        }

      
      },
      (err) => {
        console.log(err.error.message);
      }
    );
  }

  openVerticallyCentered(content: any, isCrew: number): void {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    this.isCrew.emit(1);
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
    this.currentContactLabelIdSelected = this.contactList[i].contactLabelId;
  }


  removeContactFromList(id: any): void {
    let index = _.findIndex(this.contactList, (e: any) => {

      return e.id == id;
    }, 0);
    this.crewRemove.emit(index);
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
    this.contactList = contactList;
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

  isFirstCrewMatch(index: number): boolean {
    let dataList= this.contactList;
    return dataList.slice(0, index).every(data => data.isCrew !== 1);
  }

 


  getCurrentDateTime() {
 
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
  this.eventSrvc.SaveCrerwConfirmationDate(this.contactList, this.tabName, formattedDate, this.selectedCompany, this.eventData.eventData.eventId,this.SendType).subscribe(
    (res: any) => {
      this.getLatestDate(this.tabName, this.selectedCompany, this.eventData.eventData.eventId,this.SendType);
      this.toaster.success("Confirmation Sent Successfully");

    },
    (err:any) => {
      
    }
  );
  
  }

  getLatestDate(tabName: any, selectedCompany: any, eventId: any,SendType:any) {
    this.eventSrvc.GetLatestDate(tabName, selectedCompany, eventId,SendType).subscribe(
        (res: any) => {
          // console.log("res.data[0]+++++",res.data[0]);
          if(res.data[0]==null){
            this.currentDateTimeStamp="None sent";
          }
          else{
            this.currentDateTimeStamp=res.data[0];
          }
         
  
        },
        (err) => {
          console.log(err.error.message);
        }
      );
    }


    GetSendHistory(firstIndex?:any){
      
    this.contactListItereration(firstIndex, true);

    this.eventSrvc.GetSendHistory(this.tabName, this.selectedCompany, this.eventData.eventData.eventId, this.SendType).subscribe(
      (res: any) => {
        this.dateHistory = res.data;
        this.dataLoaded = true;
        this.tooltipVisible = true;
      },
      (err) => {
        console.log(err.error.message);
      }
    );
      
    }

    contactListItereration(firstIndex: any, status: boolean) {
      this.contactList.map((res: any, index: any) => {
        if (firstIndex == index) {
          res.isVisible = status;
        }
      })
    }

    hideTooltip(firstIndex?: any) {
      this.tooltipVisible = false;
      this.contactListItereration(firstIndex, false)
    }
  
}
