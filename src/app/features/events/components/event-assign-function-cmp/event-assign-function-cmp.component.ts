import {Component, Input, OnInit, Output, TemplateRef, EventEmitter} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {Company} from "../../../users/models";

@Component({
  selector: 'app-event-assign-function-cmp',
  templateUrl: './event-assign-function-cmp.component.html',
  styleUrls: ['./event-assign-function-cmp.component.scss']
})
export class EventAssignFunctionCmpComponent implements OnInit {
  @Input() selectedCompany: Company | undefined;
  @Input() content: TemplateRef<any> | undefined;
  @Output() modalOpen = new EventEmitter<NgbModalRef>();
  modalReference: NgbModalRef | undefined;


  constructor(private modalService: NgbModal) {
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
