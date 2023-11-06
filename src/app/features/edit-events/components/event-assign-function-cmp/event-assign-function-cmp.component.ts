import { Component, Input, OnInit, Output, TemplateRef, EventEmitter, OnChanges, SimpleChanges, Inject, LOCALE_ID } from '@angular/core';
import { NgbModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Company } from '../../../users/models';
import { FnCmpCntInterface, InviteFnCmpInterface } from '../../models/interfaces';
import { InviteFnCmpClass } from '../../models/classes';
import { devLogger } from '../../../../shared/utils';
import { environment } from '../../../../../environments/environment';
import { cloneDeep } from 'lodash-es';
import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { EventService } from '../../services/event.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { log } from 'console';

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
  @Input() isViewBtnPermission: any;
  @Input() isSelfIncludedInTab: any;
  @Input() isSelfIncludedInSection: any;
  @Output() contactRemove = new EventEmitter<number>();
  modalReference: NgbModalRef | undefined;
  editContactLabelModalReference: NgbModalRef | undefined;
  disableAddContacts = true;
  contactLabels = environment.eventContactLabels;
  dateHistory: any;
  @Input() contactList: FnCmpCntInterface[] = [];
  editingContactLabelIndex = -1;
  currentContactLabelIdSelected: number | null = null;
  @Input() isClientEditable: boolean = false;
  @Input() isManagerEditable: boolean = false;
  @Input() isVenueEditable: boolean = false;
  @Input() isServiceEditable: boolean = false;
  @Input() isExhibitorEditable: boolean = false;
  @Input() permissionObj: any;
  @Input() editServiceIndex: any;
  @Input() serviceIndex: number = 0;
  @Output() isCrew = new EventEmitter<any>();
  tooltipVisible = false;
  dataLoaded = false;

  @Input() tabName: any;
  currentDateTimeStamp: any = "";
  SendType: any = "contact";
  private notificationShown = false;
  checkIsCrew :any=0;
  constructor(
    private modalService: NgbModal,
    public eventSrvc: EventService,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
    @Inject(LOCALE_ID) private locale: string
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
   
    if (this.selectedCompany !== undefined && this.selectedCompany !== null) {
      this.checkCrewLogin(this.tabName,this.selectedCompany,this.eventData.eventData.eventId);
      this.getLatestDate(this.tabName, this.selectedCompany, this.eventData.eventData.eventId, this.SendType);
      this.eventSrvc.letestDate.subscribe(message => {
        if (message == "Send") {
          this.getLatestDate(this.tabName, this.selectedCompany, this.eventData.eventData.eventId, this.SendType);
        }
      });
      this.resetNotificationState();
    }

  }

checkCrewLogin(tabName:any,selectedCompany:any,eventId:any){
 console.log("In CHeck Cre++++++++++ ", this.selectedCompany)
    this.eventSrvc.checkCrewLogin(tabName, selectedCompany, eventId).subscribe(
      (res: any) => {

        if(res.data!=null && res.data.length>0){
       
          res.data.map((item:any)=>{
         this.checkIsCrew=item.is_crew;
          });
        }

      
      },
      (err) => {
        console.log(err.error.message);
      }
    );
  }

  ngOnDestroy() {
    this.eventSrvc.letestDate.next(null);
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
    this.currentContactLabelIdSelected = this.contactList[i].contactLabelId ? this.contactList[i].contactLabelId : 5;
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
    if (listLabel == 'Add Venue') {
      return true;
    }
    else if (this.permissionObj.isClient || this.permissionObj.isEventManager || this.isViewPermission) {
      return true;
    } else {
      return false;
    }
  }

  hideTooltip(firstIndex?: any) {
    this.tooltipVisible = false;
    this.contactListItereration(firstIndex, false)
  }

  isFirstCrewMatch(index: number): boolean {
    let dataList = this.contactList;

    return dataList.slice(0, index).every(data => data.isCrew !== 0);
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


    this.spinner.show();
    this.eventSrvc.SaveConfirmationDate(this.contactList, this.tabName, formattedDate, this.selectedCompany, this.eventData.eventData.eventId, this.SendType).subscribe(
      (res: any) => {
        this.spinner.hide();
        this.getLatestDate(this.tabName, this.selectedCompany, this.eventData.eventData.eventId, this.SendType);
        if (!this.notificationShown) {
          this.toaster.success("Confirmation Sent Successfully");
          this.notificationShown = true;
        }

      },
      (err) => {
        console.log(err.error.message);
      }
    );

  }

  getLatestDate(tabName: any, selectedCompany: any, eventId: any, SendType: any) {
    this.spinner.show();
    this.eventSrvc.GetLatestDate(tabName, selectedCompany, eventId, SendType).subscribe(
      (res: any) => {
        this.spinner.hide();
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

  convertDateFormat(inputDate: string | null): string {
    if (!inputDate) {
      return ''; // Or any other default value you prefer when inputDate is null
    }

    const dateObj = new Date(inputDate);
    const datePipe = new DatePipe(this.locale);
    return datePipe.transform(dateObj, 'dd-MM-yyyy HH:mm') || '';
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }


  GetSendHistory(firstIndex?: any) {
    this.resetNotificationState();
    this.contactListItereration(firstIndex, true);
    this.eventSrvc.GetSendHistory(this.tabName, this.selectedCompany, this.eventData.eventData.eventId, this.SendType).subscribe(
      (res: any) => {
        console.log("res.data+++++", res)
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

  title = 'appBootstrap';

  closeResult: any;

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  resetNotificationState() {
    this.notificationShown = false;
  }

}

