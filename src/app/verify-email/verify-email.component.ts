import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  @ViewChild('content', { static: false }) modalContent!: TemplateRef<any>;
  @ViewChild('contentfailed', { static: false }) modalContentFailed!: TemplateRef<any>;
  constructor(
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.showSuccessModel();
  }

  showSuccessModel(){
    this.modalService.open(this.modalContent, { centered: true, backdrop: false, keyboard: false });
  }

  showErrorModel(){
    this.modalService.open(this.modalContentFailed, { centered: true, backdrop: false, keyboard: false });
  }

}
