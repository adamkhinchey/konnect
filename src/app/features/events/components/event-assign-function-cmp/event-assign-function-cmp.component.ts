import {Component, Input, OnInit, TemplateRef} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-event-assign-function-cmp',
  templateUrl: './event-assign-function-cmp.component.html',
  styleUrls: ['./event-assign-function-cmp.component.scss']
})
export class EventAssignFunctionCmpComponent implements OnInit {
  @Input() content: TemplateRef<any> | undefined;
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

  }
}
