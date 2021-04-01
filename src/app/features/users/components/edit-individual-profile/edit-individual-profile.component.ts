import {Component, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-edit-individual-profile',
  templateUrl: './edit-individual-profile.component.html',
  styleUrls: ['./edit-individual-profile.component.scss']
})
export class EditIndividualProfileComponent implements OnInit {

  modalReference: any;

  constructor(private modalService: NgbModal) {
  }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any) {
    this.modalReference = this.modalService.open(content, {
      centered: true,
      size: "md",
    });

  }

}
