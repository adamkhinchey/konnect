import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from 'src/app/features/edit-events/services/event.service';

@Component({
  selector: 'app-client-access',
  templateUrl: './client-access.component.html',
  styleUrls: ['./client-access.component.scss'],
})
export class ClientAccessComponent implements OnInit {
  @Input() accessPermission: any = '0';
  constructor(
    private activeModal: NgbActiveModal,
    public eventSrvc: EventService
  ) {}

  ngOnInit(): void {}

  public dismiss() {
    this.activeModal.dismiss();
  }

  save() {
    console.log(this.accessPermission);
    this.activeModal.close({accessPermission: this.accessPermission});
  }
}
