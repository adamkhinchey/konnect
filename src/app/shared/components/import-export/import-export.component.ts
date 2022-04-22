import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent implements OnInit {
  
  constructor(private activeModal: NgbActiveModal) { }
  

  ngOnInit(): void {
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

}
