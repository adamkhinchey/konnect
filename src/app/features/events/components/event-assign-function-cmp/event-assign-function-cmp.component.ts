import {Component, Input, OnInit, Output, TemplateRef, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {Company} from "../../../users/models";
import {InviteFnCmpInterface} from "../../models/interfaces";
import {InviteFnCmpClass} from "../../models/classes";

@Component({
  selector: 'app-event-assign-function-cmp',
  templateUrl: './event-assign-function-cmp.component.html',
  styleUrls: ['./event-assign-function-cmp.component.scss']
})
export class EventAssignFunctionCmpComponent implements OnInit, OnChanges {
  @Input() selectedCompany: Company | InviteFnCmpClass | undefined;
  @Input() content: TemplateRef<any> | undefined;
  @Output() modalOpen = new EventEmitter<NgbModalRef>();
  modalReference: NgbModalRef | undefined;
  disableAddContacts = true;


  constructor(private modalService: NgbModal) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.selectedCompnay) {
      this.disableAddContacts = changes.selectedCompany.currentValue instanceof InviteFnCmpClass;
    }
  }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any): void {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: 'lg',
    });

    this.modalOpen.emit(this.modalReference);
  }
}
